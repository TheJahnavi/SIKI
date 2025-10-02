// SIKI Backend Server with Express.js

const express = require('express');
const multer = require('multer');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const compression = require('compression'); // Add compression middleware
const Tesseract = require('tesseract.js');
const { HfInference } = require('@huggingface/inference');

// Load environment variables
require('dotenv').config();

// Initialize Firebase using the new config file
let db = null;
try {
  db = require('./firebase-config.js');
  console.log('Firebase integration loaded successfully');
} catch (error) {
  console.warn('Firebase integration failed:', error.message);
  console.warn('Continuing without Firebase integration');
}

// Try to initialize TensorFlow and MobileNet
let tf = null;
let mobilenet = null;
let mobileNetModel = null;

try {
  tf = require('@tensorflow/tfjs-node');
  mobilenet = require('@tensorflow-models/mobilenet');
  console.log('TensorFlow.js loaded successfully');
} catch (error) {
  console.warn('TensorFlow.js not available:', error.message);
  console.warn('Computer vision features will be simulated');
}

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(compression()); // Add compression for better performance
app.use(cors());
app.use(express.json());
app.use(express.static('dist')); // Serve static files from dist folder

// Multer configuration for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage: storage });

// Create uploads directory if it doesn't exist
if (!fs.existsSync('uploads')) {
  fs.mkdirSync('uploads');
}

// Initialize Hugging Face Inference client
const hf = new HfInference(process.env.HUGGINGFACE_API_KEY);

// Log the API key status (without revealing the actual key)
console.log('Hugging Face API Key configured:', process.env.HUGGINGFACE_API_KEY ? 'Yes' : 'No');

// Load fallback database
const { fallbackDB, getFallbackData } = require('./scripts/fallback-db');

// Initialize MobileNet model (loaded once at startup)
async function loadMobileNetModel() {
  if (mobilenet) {
    try {
      mobileNetModel = await mobilenet.load();
      console.log('MobileNet model loaded successfully');
    } catch (error) {
      console.error('Error loading MobileNet model:', error);
    }
  } else {
    console.log('MobileNet not available, using simulation');
  }
}

// Load the model when the server starts
loadMobileNetModel();

// API Routes

// POST /api/store-product - Store product analysis results
app.post('/api/store-product', async (req, res) => {
  try {
    const { product, userId } = req.body;
    
    if (!product) {
      return res.status(400).json({ success: false, error: 'Product data is required' });
    }
    
    // Add timestamp and user info
    const productData = {
      ...product,
      userId: userId || null,
      storedAt: db ? db.FieldValue.serverTimestamp() : new Date()
    };
    
    // Save to Firestore
    if (db) {
      try {
        const docRef = await db.collection('products').add(productData);
        console.log('Product stored successfully with ID:', docRef.id);
        return res.json({ success: true, productId: docRef.id });
      } catch (error) {
        console.warn('Error storing product in Firestore:', error.message);
        // Continue with mock success
      }
    }
    
    // Mock success for when Firestore is not available
    res.json({ success: true, productId: 'mock-' + Date.now() });
  } catch (error) {
    console.error('Store Product API error:', error);
    res.status(500).json({ success: false, error: 'Internal server error: ' + error.message });
  }
});

// POST /api/chat-log - Log chat interactions
app.post('/api/chat-log', async (req, res) => {
  try {
    const { productId, userId, query, response } = req.body;
    
    if (!query || !response) {
      return res.status(400).json({ success: false, error: 'Query and response are required' });
    }
    
    // Create chat log entry
    const chatLogEntry = {
      productId: productId || null,
      userId: userId || null,
      query: query,
      response: response,
      timestamp: db ? db.FieldValue.serverTimestamp() : new Date()
    };
    
    // Save to Firestore
    if (db) {
      try {
        const docRef = await db.collection('chat_logs').add(chatLogEntry);
        console.log('Chat log stored successfully with ID:', docRef.id);
        return res.json({ success: true, logId: docRef.id });
      } catch (error) {
        console.warn('Error storing chat log in Firestore:', error.message);
        // Continue with mock success
      }
    }
    
    // Mock success for when Firestore is not available
    res.json({ success: true, logId: 'mock-' + Date.now() });
  } catch (error) {
    console.error('Chat Log API error:', error);
    res.status(500).json({ success: false, error: 'Internal server error: ' + error.message });
  }
});

// POST /api/analyze-product - Accept image, run OCR/CV, return product data
app.post('/api/analyze-product', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'No image file uploaded' });
    }

    const imagePath = req.file.path;
    
    // Generate a unique ID for this image based on its content
    // In a real implementation, you might use a hash of the image content
    const imageId = `img_${Date.now()}`;
    
    // Check if we already have analysis results for this image in Firestore
    if (db) {
      try {
        const doc = await db.collection('productAnalysis').doc(imageId).get();
        if (doc.exists) {
          console.log('Returning cached analysis result from Firestore');
          return res.json({ success: true, product: doc.data() });
        }
      } catch (error) {
        console.warn('Error checking Firestore for cached result:', error.message);
      }
    }
    
    // Stage 1: OCR - Product Label Analysis
    console.log('Starting OCR analysis...');
    const ocrResult = await Tesseract.recognize(
      imagePath,
      'eng',
      { 
        logger: info => console.log(info),
        // Tesseract configuration for optimal text recognition
        tessedit_char_whitelist: '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz.,:;-()[]{}!@#$%^&*+=/\\|? '
      }
    );
    
    const ocrText = ocrResult.data.text;
    console.log('OCR Text:', ocrText);
    
    // Check if OCR found enough text to be useful
    const hasSufficientText = ocrText.trim().length > 50; // Adjust threshold as needed
    
    let productData;
    
    if (hasSufficientText) {
      // Process OCR text to extract product information
      productData = analyzeOCRText(ocrText);
    } else {
      // Stage 2: Computer Vision - Fallback Object Classification
      console.log('Insufficient OCR text, switching to fallback classification...');
      
      // If TensorFlow is available, use it for classification
      if (tf && mobileNetModel) {
        console.log('Using MobileNet for classification...');
        
        // Load image for TensorFlow
        const imageBuffer = fs.readFileSync(imagePath);
        const decodedImage = tf.node.decodeImage(imageBuffer, 3);
        const tensor = decodedImage.expandDims(0);
        
        // Classify the image
        const predictions = await mobileNetModel.classify(tensor);
        tensor.dispose();
        decodedImage.dispose();
        
        console.log('MobileNet Predictions:', predictions);
        
        if (predictions && predictions.length > 0) {
          // Use the top prediction
          const topPrediction = predictions[0];
          const objectName = topPrediction.className.toLowerCase();
          
          // Get fallback data
          const fallbackData = getFallbackData(objectName);
          
          productData = {
            _id: "fallback-" + Date.now(),
            name: objectName,
            score: fallbackData.score,
            category: fallbackData.type,
            message: fallbackData.message,
            nutrition: fallbackData.nutrition,
            dietary: fallbackData.dietary,
            allergens: fallbackData.allergens,
            fallback: true,
            confidence: topPrediction.probability
          };
        } else {
          // If no predictions, return unknown object
          const fallbackData = getFallbackData("unknown");
          
          productData = {
            _id: "fallback-" + Date.now(),
            name: "Unknown Object",
            score: fallbackData.score,
            category: fallbackData.type,
            message: fallbackData.message,
            nutrition: fallbackData.nutrition,
            dietary: fallbackData.dietary,
            allergens: fallbackData.allergens,
            fallback: true
          };
        }
      } else {
        // If TensorFlow is not available, use simulated classification
        console.log('Using simulated classification...');
        
        // Simulate a random classification result
        const objectTypes = Object.keys(fallbackDB);
        const randomObject = objectTypes[Math.floor(Math.random() * objectTypes.length)];
        const fallbackData = fallbackDB[randomObject];
        
        productData = {
          _id: "fallback-" + Date.now(),
          name: randomObject,
          score: fallbackData.score,
          category: fallbackData.type,
          message: fallbackData.message,
          nutrition: fallbackData.nutrition,
          dietary: fallbackData.dietary,
          allergens: fallbackData.allergens,
          fallback: true,
          simulated: true
        };
      }
    }
    
    // Add the imageId to the product data
    productData.id = imageId;
    
    // Save the analysis result to Firestore
    if (db) {
      try {
        await db.collection('productAnalysis').doc(imageId).set({
          ...productData,
          analyzedAt: db ? db.FieldValue.serverTimestamp() : new Date(),
          imagePath: imagePath
        });
        console.log('Analysis result saved to Firestore');
      } catch (error) {
        console.warn('Error saving analysis result to Firestore:', error.message);
      }
    }
    
    // Return the product data
    return res.json({ success: true, product: productData, productId: imageId });
  } catch (error) {
    console.error('Analyze Product API error:', error);
    res.status(500).json({ success: false, error: 'Internal server error: ' + error.message });
  }
});

// Function to analyze OCR text and extract product information
function analyzeOCRText(rawText) {
  try {
    // This is a simplified implementation
    // In a real application, you would use more sophisticated NLP techniques
    
    // Extract potential product name (first line or capitalized words)
    const lines = rawText.trim().split('\n').filter(line => line.trim().length > 0);
    const productName = lines[0] || 'Unknown Product';
    
    // Simple keyword-based categorization
    const keywords = rawText.toLowerCase();
    let category = 'Unknown';
    let score = 50; // Default neutral score
    
    if (keywords.includes('organic') || keywords.includes('natural')) {
      category = 'Organic Food';
      score = 80;
    } else if (keywords.includes('sugar') || keywords.includes('sweet')) {
      category = 'Snack';
      score = 30;
    } else if (keywords.includes('water') || keywords.includes('beverage')) {
      category = 'Beverage';
      score = 70;
    } else if (keywords.includes('vitamin') || keywords.includes('supplement')) {
      category = 'Supplement';
      score = 60;
    }
    
    // Extract potential ingredients (lines with commas or common ingredient words)
    const ingredients = [];
    lines.forEach(line => {
      if (line.includes(',') || line.toLowerCase().includes('ingredient')) {
        ingredients.push(...line.split(',').map(item => item.trim()));
      }
    });
    
    // Extract nutrition info (lines with numbers and common nutrition words)
    const nutrition = {};
    lines.forEach(line => {
      if (line.match(/\d+/) && (line.toLowerCase().includes('calorie') || 
          line.toLowerCase().includes('sugar') || 
          line.toLowerCase().includes('fat'))) {
        const parts = line.split(':');
        if (parts.length === 2) {
          const key = parts[0].trim().toLowerCase();
          const value = parts[1].trim();
          nutrition[key] = value;
        }
      }
    });
    
    // Extract potential allergens
    const allergens = [];
    const allergenKeywords = ['milk', 'eggs', 'fish', 'shellfish', 'tree nuts', 'peanuts', 'wheat', 'soybeans'];
    lines.forEach(line => {
      const lineLower = line.toLowerCase();
      allergenKeywords.forEach(allergen => {
        if (lineLower.includes(allergen)) {
          allergens.push(allergen);
        }
      });
    });
    
    // Extract dietary information
    const dietary = [];
    const dietaryKeywords = ['vegan', 'vegetarian', 'gluten-free', 'keto-friendly', 'organic', 'non-gmo'];
    lines.forEach(line => {
      const lineLower = line.toLowerCase();
      dietaryKeywords.forEach(diet => {
        if (lineLower.includes(diet)) {
          dietary.push(diet);
        }
      });
    });
    
    return {
      _id: "ocr-" + Date.now(),
      name: productName,
      score: score,
      category: category,
      nutrition: Object.keys(nutrition).length > 0 ? nutrition : { calories: 'N/A', sugar: 'N/A' },
      ingredients: ingredients.length > 0 ? ingredients.map(name => ({ name, risk: 'unknown' })) : [{ name: 'Unknown', risk: 'unknown' }],
      allergens: allergens,
      dietary: dietary,
      fallback: false
    };
  } catch (error) {
    console.error('Error analyzing OCR text:', error);
    // Return a safe fallback response
    return {
      _id: "ocr-error-" + Date.now(),
      name: "Analysis Error",
      score: 0,
      category: "Error",
      message: "Failed to analyze product text. Please try again with a clearer image.",
      nutrition: { calories: 'N/A', sugar: 'N/A' },
      ingredients: [{ name: 'Unknown', risk: 'unknown' }],
      allergens: [],
      dietary: [],
      fallback: true,
      error: error.message
    };
  }
}

// POST /api/chat - Accept product ID + query, return AI response
app.post('/api/chat', async (req, res) => {
  try {
    const { productId, query, userId } = req.body;
    
    if (!query) {
      return res.status(400).json({ success: false, error: 'Query is required' });
    }
    
    // Retrieve product data from Firestore
    let productData = null;
    if (db && productId) {
      try {
        const doc = await db.collection('productAnalysis').doc(productId).get();
        if (doc.exists) {
          productData = doc.data();
        }
      } catch (error) {
        console.warn('Error retrieving product data from Firestore:', error.message);
      }
    }
    
    // Retrieve user preferences if userId is provided
    let userPreferences = null;
    if (db && userId) {
      try {
        const doc = await db.collection('userPreferences').doc(userId).get();
        if (doc.exists) {
          userPreferences = doc.data();
        }
      } catch (error) {
        console.warn('Error retrieving user preferences from Firestore:', error.message);
      }
    }
    
    // Use Hugging Face for AI chat with context
    let aiResponse = '';
    
    if (process.env.HUGGINGFACE_API_KEY && process.env.HUGGINGFACE_API_KEY !== 'YOUR_HUGGINGFACE_API_KEY') {
      try {
        // Construct the prompt according to the specification
        let prompt = "You are SIKI, a friendly, helpful, and concise product analysis assistant. Your only source of truth is the JSON data provided below. Do not use outside knowledge. If the answer is not in the JSON, state that you cannot find the information.\n\n";
        
        if (userPreferences) {
          prompt += "USER DIETARY PREFERENCES:\n" + JSON.stringify(userPreferences, null, 2) + "\n\n";
        }
        
        if (productData) {
          prompt += "PRODUCT DATA:\n" + JSON.stringify(productData, null, 2) + "\n\n";
        }
        
        prompt += "USER QUESTION:\n" + query;
        
        console.log('Sending prompt to Hugging Face:', prompt);
        
        // Try to use Hugging Face API
        let response;
        try {
          response = await hf.textGeneration({
            model: 'google/flan-t5-base', // This is a freely available model
            inputs: prompt,
            parameters: {
              max_new_tokens: 150,
              temperature: 0.7,
              top_p: 0.9,
              return_full_text: false
            }
          });
          
          aiResponse = response.generated_text || 'I apologize, but I couldn\'t generate a response at the moment.';
        } catch (hfError) {
          // If Hugging Face fails, fall back to enhanced template responses
          console.warn('Hugging Face API error:', hfError.message);
          aiResponse = generateEnhancedResponse(productData, userPreferences, query);
        }
      } catch (error) {
        console.warn('Error in chat processing:', error.message);
        aiResponse = generateEnhancedResponse(productData, userPreferences, query);
      }
    } else {
      // Fallback simulation if no API key is provided
      aiResponse = generateEnhancedResponse(productData, userPreferences, query);
    }
    
    // Store chat history in Firestore
    if (db) {
      try {
        const chatEntry = {
          productId: productId || null,
          userId: userId || null,
          query: query,
          response: aiResponse,
          timestamp: db ? db.FieldValue.serverTimestamp() : new Date()
        };
        
        await db.collection('chatHistory').add(chatEntry);
        console.log('Chat interaction saved to Firestore');
      } catch (error) {
        console.warn('Error saving chat interaction to Firestore:', error.message);
      }
    }
    
    res.json({ success: true, reply: aiResponse });
  } catch (error) {
    console.error('Chat API error:', error);
    res.status(500).json({ success: false, error: 'Internal server error: ' + error.message });
  }
});

// Enhanced response generation function
function generateEnhancedResponse(productData, userPreferences, query) {
  // Create a more intelligent response based on available data
  if (!productData) {
    return "I don't have product information available to answer your question. Please analyze a product first.";
  }
  
  // Handle empty or invalid product data
  if (!productData.name || productData.name === "Unknown Product") {
    return "I couldn't properly analyze this product. Please try scanning it again with better lighting and focus.";
  }
  
  // Check for weight loss related queries
  if (query.toLowerCase().includes('weight') || query.toLowerCase().includes('lose') || query.toLowerCase().includes('diet')) {
    if (productData.score >= 70) {
      return `✅ This ${productData.name} is a good choice for weight management with a health score of ${productData.score}/100. It appears to be nutritious and relatively healthy.`;
    } else if (productData.nutrition) {
      const calories = productData.nutrition.calories || productData.nutrition.Calories;
      if (calories && parseInt(calories) < 100) {
        return `✅ This ${productData.name} is low in calories (${calories}), making it suitable for weight management.`;
      } else if (calories && parseInt(calories) > 300) {
        return `⚠️ This ${productData.name} is high in calories (${calories}), which may not be ideal for weight loss.`;
      }
    }
    return `Based on the available information, this ${productData.name} has a health score of ${productData.score}/100. For weight management, I recommend checking the calorie content and ingredients list.`;
  }
  
  // Check for diabetic-friendly queries
  if (query.toLowerCase().includes('diabet') || query.toLowerCase().includes('sugar') || query.toLowerCase().includes('glycemic')) {
    if (productData.nutrition && productData.nutrition.sugar) {
      const sugarContent = productData.nutrition.sugar;
      const sugarValue = parseInt(sugarContent);
      
      if (sugarValue === 0 || sugarContent.toLowerCase().includes('zero') || sugarContent.toLowerCase().includes('none')) {
        return `✅ This ${productData.name} is sugar-free, making it suitable for diabetics.`;
      } else if (sugarValue < 5) {
        return `✅ This ${productData.name} is low in sugar (${sugarContent}), which is generally acceptable for diabetics in moderation.`;
      } else if (sugarValue > 15) {
        return `⚠️ This ${productData.name} is high in sugar (${sugarContent}), which may not be suitable for diabetics.`;
      } else {
        return `This ${productData.name} contains ${sugarContent} of sugar. Diabetics should consume this in moderation and monitor their blood sugar levels.`;
      }
    }
    return `For diabetic considerations, I recommend checking the sugar content on the nutrition label. This ${productData.name} has a health score of ${productData.score}/100.`;
  }
  
  // Check for keto/low-carb queries
  if (query.toLowerCase().includes('keto') || query.toLowerCase().includes('ketogenic') || query.toLowerCase().includes('low carb')) {
    if (productData.dietary && productData.dietary.includes('keto-friendly')) {
      return `Yes, this ${productData.name} is marked as keto-friendly based on the product information.`;
    } else if (productData.nutrition && productData.nutrition.sugar) {
      const sugar = parseInt(productData.nutrition.sugar);
      if (sugar < 5) {
        return `This ${productData.name} is relatively low in sugar (${productData.nutrition.sugar}), which may be suitable for a ketogenic diet. However, I recommend checking the full ingredients list to ensure it meets all keto requirements.`;
      } else {
        return `This ${productData.name} contains ${productData.nutrition.sugar} of sugar, which may be too high for a strict ketogenic diet.`;
      }
    }
    return `For keto considerations, look for products with less than 5g net carbs per serving. This ${productData.name} has a health score of ${productData.score}/100.`;
  }
  
  // Check for vegan queries
  if (query.toLowerCase().includes('vegan')) {
    if (productData.dietary && productData.dietary.includes('vegan')) {
      return `Yes, this ${productData.name} is marked as vegan based on the product information.`;
    } else if (productData.ingredients) {
      const nonVeganIngredients = ['milk', 'eggs', 'honey', 'gelatin', 'casein', 'whey', 'lactose'];
      const hasNonVegan = productData.ingredients.some(ing => 
        nonVeganIngredients.some(nonVegan => 
          ing.name.toLowerCase().includes(nonVegan)
        )
      );
      
      if (hasNonVegan) {
        return `This ${productData.name} may not be vegan as it contains ingredients that are typically non-vegan. Please check the full ingredients list to be sure.`;
      } else {
        return `Based on the ingredients list, this ${productData.name} appears to be vegan-friendly. However, I recommend checking the full ingredients list to be certain.`;
      }
    }
    return `To determine if this ${productData.name} is vegan, check for animal-derived ingredients like milk, eggs, honey, or gelatin. The health score is ${productData.score}/100.`;
  }
  
  // Check for allergy safety queries
  if (query.toLowerCase().includes('allerg') || query.toLowerCase().includes('safe')) {
    if (userPreferences && userPreferences.allergies && productData.allergens) {
      const userAllergies = userPreferences.allergies;
      const productAllergens = productData.allergens;
      const matches = userAllergies.filter(allergy => 
        productAllergens.includes(allergy)
      );
      
      if (matches.length > 0) {
        return `⚠️ CAUTION: This ${productData.name} contains ${matches.join(', ')} which matches your allergy preferences. Please avoid consuming this product.`;
      } else {
        return `✅ Based on your allergy preferences, this ${productData.name} does not appear to contain any ingredients you're allergic to. However, always check the packaging to be sure.`;
      }
    } else if (productData.allergens && productData.allergens.length > 0) {
      return `⚠️ This ${productData.name} contains the following allergens: ${productData.allergens.join(', ')}. Please check if any of these match your allergies.`;
    }
    return `I couldn't identify specific allergens in this ${productData.name}. Always check the packaging for complete allergen information.`;
  }
  
  // Check for general health queries
  if (query.toLowerCase().includes('health') || query.toLowerCase().includes('healthy') || query.toLowerCase().includes('good')) {
    if (productData.score >= 80) {
      return `✅ This ${productData.name} has an excellent health score of ${productData.score}/100. It appears to be a very healthy choice.`;
    } else if (productData.score >= 60) {
      return `👍 This ${productData.name} has a good health score of ${productData.score}/100. It's a reasonably healthy choice.`;
    } else if (productData.score >= 40) {
      return `⚠️ This ${productData.name} has a moderate health score of ${productData.score}/100. It's okay in moderation but has room for improvement.`;
    } else {
      return `❌ This ${productData.name} has a poor health score of ${productData.score}/100. You may want to consider healthier alternatives.`;
    }
  }
  
  // Check for heart health queries
  if (query.toLowerCase().includes('heart') || query.toLowerCase().includes('cardio')) {
    if (productData.dietary && productData.dietary.includes('heart-healthy')) {
      return `✅ This ${productData.name} is marked as heart-healthy based on the product information.`;
    } else if (productData.nutrition) {
      const sodium = productData.nutrition.sodium || productData.nutrition.Sodium;
      const fat = productData.nutrition.fat || productData.nutrition.Fat;
      
      if (sodium && parseInt(sodium) < 140) {
        return `✅ This ${productData.name} is low in sodium (${sodium}), which is beneficial for heart health.`;
      } else if (fat && parseInt(fat) < 3) {
        return `✅ This ${productData.name} is low in fat (${fat}), which is beneficial for heart health.`;
      }
    }
    return `For heart health, look for products low in sodium, saturated fat, and cholesterol. This ${productData.name} has a health score of ${productData.score}/100.`;
  }
  
  // Check for high protein queries
  if (query.toLowerCase().includes('protein') || query.toLowerCase().includes('muscle')) {
    if (productData.nutrition && productData.nutrition.protein) {
      const protein = parseInt(productData.nutrition.protein);
      if (protein > 10) {
        return `✅ This ${productData.name} is high in protein (${productData.nutrition.protein}), which is great for muscle building and maintenance.`;
      } else if (protein > 5) {
        return `👍 This ${productData.name} contains a moderate amount of protein (${productData.nutrition.protein}).`;
      } else {
        return `This ${productData.name} is low in protein (${productData.nutrition.protein}). Consider pairing it with high-protein foods.`;
      }
    }
    return `For high protein content, look for products with 10g+ protein per serving. This ${productData.name} has a health score of ${productData.score}/100.`;
  }
  
  // Default responses
  const responses = [
    `Based on the product information for ${productData.name}, this appears to be a ${productData.category || 'general'} item. ${query.includes('healthy') ? 'For health considerations, I recommend checking the ingredients list and nutrition facts.' : 'Is there anything specific about this product you\'d like to know?'}`,
    `This ${productData.name} ${productData.nutrition ? 'has' : 'would have'} nutritional information that can help determine its health value. ${query.includes('?') ? 'What specific aspect are you interested in?' : 'Feel free to ask more detailed questions.'}`,
    `I can provide more detailed analysis of this ${productData.name}'s ingredients and nutritional content. ${query.includes('ingredient') ? 'The key ingredients would be important to review.' : 'What would you like to know about its composition?'}`,
    `The health score for ${productData.name} is ${productData.score}/100. ${productData.score >= 70 ? 'This is a good score!' : productData.score >= 50 ? 'This is an average score.' : 'There might be healthier options available.'}`,
    `For ${productData.name}, I recommend checking the ingredients list for any additives or preservatives, and reviewing the nutrition facts for calories, sugar, and sodium content.`
  ]
  
  return responses[Math.floor(Math.random() * responses.length)];
}

// POST /api/user-preferences - Set user dietary preferences
app.post('/api/user-preferences', async (req, res) => {
  try {
    const { userId, preferences } = req.body;
    
    if (!userId || !preferences) {
      return res.status(400).json({ success: false, error: 'User ID and preferences are required' });
    }
    
    // Save user preferences to Firestore
    if (db) {
      try {
        await db.collection('userPreferences').doc(userId).set({
          ...preferences,
          updatedAt: db ? db.FieldValue.serverTimestamp() : new Date()
        });
        console.log('User preferences saved to Firestore');
      } catch (error) {
        console.warn('Error saving user preferences to Firestore:', error.message);
        return res.status(500).json({ success: false, error: 'Failed to save preferences' });
      }
    }
    
    res.json({ success: true, message: 'Preferences saved successfully' });
  } catch (error) {
    console.error('User Preferences API error:', error);
    res.status(500).json({ success: false, error: 'Internal server error: ' + error.message });
  }
});

// GET /api/user-preferences - Get user dietary preferences
app.get('/api/user-preferences/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    if (!userId) {
      return res.status(400).json({ success: false, error: 'User ID is required' });
    }
    
    // Retrieve user preferences from Firestore
    let preferences = null;
    if (db) {
      try {
        const doc = await db.collection('userPreferences').doc(userId).get();
        if (doc.exists) {
          preferences = doc.data();
        }
      } catch (error) {
        console.warn('Error retrieving user preferences from Firestore:', error.message);
        return res.status(500).json({ success: false, error: 'Failed to retrieve preferences' });
      }
    }
    
    res.json({ success: true, preferences });
  } catch (error) {
    console.error('User Preferences API error:', error);
    res.status(500).json({ success: false, error: 'Internal server error: ' + error.message });
  }
});

// GET /api/history - Return recent scans
app.get('/api/history', async (req, res) => {
  try {
    // In a real implementation with Firestore, you would:
    // 1. Query the database for user's scan history
    let history = [];
    
    if (db) {
      try {
        const snapshot = await db.collection('productAnalysis')
          .orderBy('analyzedAt', 'desc')
          .limit(10)
          .get();
        
        history = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
      } catch (error) {
        console.warn('Error retrieving history from Firestore:', error.message);
      }
    }
    
    // If no Firestore data, return mock history
    if (history.length === 0) {
      history = [
        {
          _id: "1",
          name: "Organic Coconut Water",
          score: 85,
          timestamp: new Date(Date.now() - 86400000) // 1 day ago
        },
        {
          _id: "2",
          name: "Chocolate Chip Cookies",
          score: 30,
          timestamp: new Date(Date.now() - 172800000) // 2 days ago
        }
      ];
    }
    
    res.json({ success: true, history: history });
  } catch (error) {
    console.error('History API error:', error);
    res.status(500).json({ success: false, error: 'Internal server error: ' + error.message });
  }
});

// POST /api/report-missing - Log unknown product
app.post('/api/report-missing', async (req, res) => {
  try {
    const { productName, imageUrl } = req.body;
    
    // In a real implementation with Firestore, you would:
    // 1. Store report in database
    if (db) {
      try {
        const reportEntry = {
          productName: productName || 'Unknown',
          imageUrl: imageUrl || null,
          reportedAt: db ? db.FieldValue.serverTimestamp() : new Date(),
          status: 'pending'
        };
        
        await db.collection('missingProducts').add(reportEntry);
        console.log(`Missing product reported and saved to Firestore: ${productName}`);
      } catch (error) {
        console.warn('Error saving missing product report to Firestore:', error.message);
      }
    }
    
    res.json({ success: true, message: 'Product reported successfully' });
  } catch (error) {
    console.error('Report missing API error:', error);
    res.status(500).json({ success: false, error: 'Internal server error: ' + error.message });
  }
});

// Serve the main app
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// Export app for testing
module.exports = app;

// Start server only if this file is run directly
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`SIKI server running on http://localhost:${PORT}`);
  });
}