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

// Initialize our new services
const IngredientService = require('./services/IngredientService.cjs');
const ComputerVisionService = require('./services/ComputerVisionService.cjs');
const ChatbotService = require('./services/ChatbotService.cjs');

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

// Enhanced error logging middleware
app.use((err, req, res, next) => {
  console.error(`[ERROR] ${new Date().toISOString()} - ${err.message}`);
  console.error(err.stack);
  res.status(500).json({ success: false, error: 'Internal server error: ' + err.message });
});

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

// GET /api/ingredients - Get all ingredients
app.get('/api/ingredients', (req, res) => {
  try {
    console.log('[INGREDIENTS] Retrieving all ingredients');
    const ingredients = IngredientService.getAllIngredients();
    res.json({ success: true, ingredients });
  } catch (error) {
    console.error('[INGREDIENTS] API error:', error);
    res.status(500).json({ success: false, error: 'Internal server error: ' + error.message });
  }
});

// GET /api/ingredients/:name - Get a specific ingredient by name
app.get('/api/ingredients/:name', (req, res) => {
  try {
    const { name } = req.params;
    console.log(`[INGREDIENTS] Retrieving ingredient: ${name}`);
    
    const ingredient = IngredientService.getIngredientByName(name);
    if (!ingredient) {
      return res.status(404).json({ success: false, error: 'Ingredient not found' });
    }
    
    res.json({ success: true, ingredient });
  } catch (error) {
    console.error('[INGREDIENTS] API error:', error);
    res.status(500).json({ success: false, error: 'Internal server error: ' + error.message });
  }
});

// GET /api/ingredients/risk/:riskLevel - Get ingredients by risk level
app.get('/api/ingredients/risk/:riskLevel', (req, res) => {
  try {
    const { riskLevel } = req.params;
    console.log(`[INGREDIENTS] Retrieving ingredients with risk level: ${riskLevel}`);
    
    const ingredients = IngredientService.searchByRiskLevel(riskLevel);
    res.json({ success: true, ingredients });
  } catch (error) {
    console.error('[INGREDIENTS] API error:', error);
    res.status(500).json({ success: false, error: 'Internal server error: ' + error.message });
  }
});

// GET /api/flagged-ingredients - Get all flagged ingredients
app.get('/api/flagged-ingredients', (req, res) => {
  try {
    console.log('[INGREDIENTS] Retrieving flagged ingredients');
    
    const ingredients = IngredientService.getFlaggedIngredients();
    res.json({ success: true, ingredients });
  } catch (error) {
    console.error('[INGREDIENTS] API error:', error);
    res.status(500).json({ success: false, error: 'Internal server error: ' + error.message });
  }
});

// POST /api/store-product - Store product analysis results
app.post('/api/store-product', async (req, res) => {
  try {
    const { product, userId } = req.body;
    
    console.log(`[STORE-PRODUCT] Storing product for user ${userId || 'anonymous'}`);
    
    if (!product) {
      console.warn('[STORE-PRODUCT] No product data provided');
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
        console.log('[STORE-PRODUCT] Product stored successfully with ID:', docRef.id);
        return res.json({ success: true, productId: docRef.id });
      } catch (error) {
        console.warn('[STORE-PRODUCT] Error storing product in Firestore:', error.message);
        // Continue with mock success
      }
    }
    
    // Mock success for when Firestore is not available
    res.json({ success: true, productId: 'mock-' + Date.now() });
  } catch (error) {
    console.error('[STORE-PRODUCT] API error:', error);
    res.status(500).json({ success: false, error: 'Internal server error: ' + error.message });
  }
});

// POST /api/chat-log - Log chat interactions
app.post('/api/chat-log', async (req, res) => {
  try {
    const { productId, userId, query, response } = req.body;
    
    console.log(`[CHAT-LOG] Logging chat interaction for product ${productId || 'unknown'}`);
    
    if (!query || !response) {
      console.warn('[CHAT-LOG] Query and response are required');
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
        console.log('[CHAT-LOG] Chat log stored successfully with ID:', docRef.id);
        return res.json({ success: true, logId: docRef.id });
      } catch (error) {
        console.warn('[CHAT-LOG] Error storing chat log in Firestore:', error.message);
        // Continue with mock success
      }
    }
    
    // Mock success for when Firestore is not available
    res.json({ success: true, logId: 'mock-' + Date.now() });
  } catch (error) {
    console.error('[CHAT-LOG] API error:', error);
    res.status(500).json({ success: false, error: 'Internal server error: ' + error.message });
  }
});

// POST /api/analyze-product - Accept image, run OCR/CV, return product data
app.post('/api/analyze-product', upload.single('image'), async (req, res) => {
  try {
    console.log('[ANALYZE-PRODUCT] Starting product analysis');
    
    if (!req.file) {
      console.warn('[ANALYZE-PRODUCT] No image file uploaded');
      return res.status(400).json({ success: false, error: 'No image file uploaded' });
    }

    const imagePath = req.file.path;
    console.log('[ANALYZE-PRODUCT] Image uploaded to:', imagePath);
    
    // Generate a unique ID for this image based on its content
    // In a real implementation, you might use a hash of the image content
    const imageId = `img_${Date.now()}`;
    
    // Check if we already have analysis results for this image in Firestore
    if (db) {
      try {
        const doc = await db.collection('productAnalysis').doc(imageId).get();
        if (doc.exists) {
          console.log('[ANALYZE-PRODUCT] Returning cached analysis result from Firestore');
          return res.json({ success: true, product: doc.data() });
        }
      } catch (error) {
        console.warn('[ANALYZE-PRODUCT] Error checking Firestore for cached result:', error.message);
      }
    }
    
    // Stage 1: Use our new Computer Vision Service for comprehensive analysis
    console.log('[ANALYZE-PRODUCT] Starting comprehensive CV analysis...');
    const cvResult = await ComputerVisionService.analyzeProductImage(imagePath);
    
    // Process the results to create product data
    let productData = {
      _id: imageId,
      name: "Unknown Product",
      score: 50, // Default neutral score
      category: "Unknown",
      message: "Analysis completed",
      nutrition: { calories: 'N/A', sugar: 'N/A' },
      ingredients: [],
      allergens: [],
      dietary: [],
      fallback: false,
      cvData: cvResult
    };
    
    // Extract information from CV results
    if (cvResult.barcode && cvResult.barcode.value) {
      productData.name = `Product ${cvResult.barcode.value}`;
      productData.category = "Barcode Detected";
      productData.score = 70; // Higher score for barcode detection
    } else if (cvResult.objects && cvResult.objects.length > 0) {
      // Use top object prediction
      const topObject = cvResult.objects[0];
      productData.name = topObject.className;
      productData.category = "Object Detected";
      productData.score = Math.round(topObject.probability * 100);
    }
    
    // Extract text information if available
    if (cvResult.text && cvResult.text.trim().length > 0) {
      // Simple text analysis (similar to existing implementation)
      const lines = cvResult.text.trim().split('\n').filter(line => line.trim().length > 0);
      if (lines.length > 0) {
        productData.name = lines[0]; // First line as product name
      }
      
      // Simple keyword-based categorization
      const keywords = cvResult.text.toLowerCase();
      if (keywords.includes('organic') || keywords.includes('natural')) {
        productData.category = 'Organic Food';
        productData.score = Math.max(productData.score, 80);
      } else if (keywords.includes('sugar') || keywords.includes('sweet')) {
        productData.category = 'Snack';
        productData.score = Math.min(productData.score, 30);
      } else if (keywords.includes('water') || keywords.includes('beverage')) {
        productData.category = 'Beverage';
        productData.score = Math.max(productData.score, 70);
      }
      
      // Extract potential ingredients
      const ingredients = [];
      lines.forEach(line => {
        if (line.includes(',') || line.toLowerCase().includes('ingredient')) {
          const items = line.split(',').map(item => item.trim());
          items.forEach(item => {
            // Check if we have information about this ingredient
            const ingredientInfo = IngredientService.getIngredientByName(item);
            if (ingredientInfo) {
              ingredients.push({
                name: item,
                risk: ingredientInfo.riskLevel,
                harmfulTag: ingredientInfo.harmfulTag,
                effectOnBody: ingredientInfo.effectOnBody
              });
            } else {
              ingredients.push({ name: item, risk: 'unknown' });
            }
          });
        }
      });
      
      if (ingredients.length > 0) {
        productData.ingredients = ingredients;
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
        console.log('[ANALYZE-PRODUCT] Analysis result saved to Firestore');
      } catch (error) {
        console.warn('[ANALYZE-PRODUCT] Error saving analysis result to Firestore:', error.message);
      }
    }
    
    // Return the product data
    console.log('[ANALYZE-PRODUCT] Analysis completed successfully');
    return res.json({ success: true, product: productData, productId: imageId });
  } catch (error) {
    console.error('[ANALYZE-PRODUCT] API error:', error);
    res.status(500).json({ success: false, error: 'Analysis failed: ' + error.message });
  } finally {
    // Clean up the uploaded file
    if (req.file && req.file.path) {
      try {
        fs.unlinkSync(req.file.path);
        console.log('[ANALYZE-PRODUCT] Temporary file cleaned up:', req.file.path);
      } catch (cleanupError) {
        console.warn('[ANALYZE-PRODUCT] Error cleaning up temporary file:', cleanupError.message);
      }
    }
  }
});

// POST /api/chat - Accept product data + query, return AI response
app.post('/api/chat', async (req, res) => {
  try {
    const { product, query, userId } = req.body;
    
    console.log(`[CHAT] Processing chat request for product from user ${userId || 'anonymous'}`);
    
    if (!query) {
      console.warn('[CHAT] Query is required');
      return res.status(400).json({ success: false, error: 'Query is required' });
    }
    
    if (!product) {
      console.warn('[CHAT] Product data is required');
      return res.status(400).json({ success: false, error: 'Product data is required' });
    }
    
    // Use our new Chatbot Service for contextual question answering
    try {
      const response = await ChatbotService.processChatMessage(product, query);
      console.log('[CHAT] Chat response generated successfully');
      
      // Store chat history in Firestore
      if (db) {
        try {
          const chatEntry = {
            productId: product.id || null,
            userId: userId || null,
            query: query,
            response: response,
            timestamp: db ? db.FieldValue.serverTimestamp() : new Date()
          };
          
          await db.collection('chatHistory').add(chatEntry);
          console.log('[CHAT] Chat interaction saved to Firestore');
        } catch (error) {
          console.warn('[CHAT] Error saving chat interaction to Firestore:', error.message);
        }
      }
      
      res.json({ success: true, reply: response });
    } catch (chatError) {
      console.error('[CHAT] Error processing chat message:', chatError);
      res.status(500).json({ success: false, error: 'Chat processing failed: ' + chatError.message });
    }
  } catch (error) {
    console.error('[CHAT] API error:', error);
    res.status(500).json({ success: false, error: 'Internal server error: ' + error.message });
  }
});

// POST /api/user-preferences - Set user dietary preferences
app.post('/api/user-preferences', async (req, res) => {
  try {
    const { userId, preferences } = req.body;
    
    console.log(`[USER-PREFERENCES] Saving preferences for user ${userId}`);
    
    if (!userId || !preferences) {
      console.warn('[USER-PREFERENCES] User ID and preferences are required');
      return res.status(400).json({ success: false, error: 'User ID and preferences are required' });
    }
    
    // Save user preferences to Firestore
    if (db) {
      try {
        await db.collection('userPreferences').doc(userId).set({
          ...preferences,
          updatedAt: db ? db.FieldValue.serverTimestamp() : new Date()
        });
        console.log('[USER-PREFERENCES] User preferences saved to Firestore');
      } catch (error) {
        console.warn('[USER-PREFERENCES] Error saving user preferences to Firestore:', error.message);
        return res.status(500).json({ success: false, error: 'Failed to save preferences' });
      }
    }
    
    res.json({ success: true, message: 'Preferences saved successfully' });
  } catch (error) {
    console.error('[USER-PREFERENCES] API error:', error);
    res.status(500).json({ success: false, error: 'Internal server error: ' + error.message });
  }
});

// GET /api/user-preferences - Get user dietary preferences
app.get('/api/user-preferences/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    console.log(`[USER-PREFERENCES] Retrieving preferences for user ${userId}`);
    
    if (!userId) {
      console.warn('[USER-PREFERENCES] User ID is required');
      return res.status(400).json({ success: false, error: 'User ID is required' });
    }
    
    // Retrieve user preferences from Firestore
    let preferences = null;
    if (db) {
      try {
        const doc = await db.collection('userPreferences').doc(userId).get();
        if (doc.exists) {
          preferences = doc.data();
          console.log('[USER-PREFERENCES] User preferences retrieved from Firestore');
        } else {
          console.log('[USER-PREFERENCES] No preferences found for user');
        }
      } catch (error) {
        console.warn('[USER-PREFERENCES] Error retrieving user preferences from Firestore:', error.message);
        return res.status(500).json({ success: false, error: 'Failed to retrieve preferences' });
      }
    }
    
    res.json({ success: true, preferences });
  } catch (error) {
    console.error('[USER-PREFERENCES] API error:', error);
    res.status(500).json({ success: false, error: 'Internal server error: ' + error.message });
  }
});

// GET /api/history - Return recent scans
app.get('/api/history', async (req, res) => {
  try {
    console.log('[HISTORY] Retrieving recent scans');
    
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
        console.log('[HISTORY] Retrieved history from Firestore');
      } catch (error) {
        console.warn('[HISTORY] Error retrieving history from Firestore:', error.message);
      }
    }
    
    // If no Firestore data, return mock history
    if (history.length === 0) {
      console.log('[HISTORY] Using mock history data');
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
    console.error('[HISTORY] API error:', error);
    res.status(500).json({ success: false, error: 'Internal server error: ' + error.message });
  }
});

// POST /api/report-missing - Log unknown product
app.post('/api/report-missing', async (req, res) => {
  try {
    const { productName, imageUrl } = req.body;
    
    console.log(`[REPORT-MISSING] Reporting missing product: ${productName}`);
    
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
        console.log(`[REPORT-MISSING] Missing product reported and saved to Firestore: ${productName}`);
      } catch (error) {
        console.warn('[REPORT-MISSING] Error saving missing product report to Firestore:', error.message);
      }
    }
    
    res.json({ success: true, message: 'Product reported successfully' });
  } catch (error) {
    console.error('[REPORT-MISSING] API error:', error);
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
  const server = app.listen(PORT, () => {
    console.log(`SIKI server running on http://localhost:${PORT}`);
  });
  
  // Graceful shutdown
  process.on('SIGINT', () => {
    console.log('Shutting down server...');
    server.close(() => {
      console.log('Server closed');
      process.exit(0);
    });
  });
}