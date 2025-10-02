// Test script to verify the complete SIKI workflow

const fs = require('fs');
const path = require('path');

// Extract the analyzeOCRText function from server.js
function analyzeOCRText(rawText) {
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
}

// Extract the generateEnhancedResponse function from server.js
function generateEnhancedResponse(productData, userPreferences, query) {
  // Create a more intelligent response based on available data
  if (!productData) {
    return "I don't have product information available to answer your question. Please analyze a product first.";
  }
  
  // Check for specific query patterns
  if (query.toLowerCase().includes('keto') || query.toLowerCase().includes('ketogenic')) {
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
  }
  
  if (query.toLowerCase().includes('vegan')) {
    if (productData.dietary && productData.dietary.includes('vegan')) {
      return `Yes, this ${productData.name} is marked as vegan based on the product information.`;
    } else if (productData.ingredients) {
      const nonVeganIngredients = ['milk', 'eggs', 'honey', 'gelatin', 'casein'];
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
  }
  
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
    }
  }
  
  if (query.toLowerCase().includes('health') || query.toLowerCase().includes('healthy')) {
    if (productData.score >= 80) {
      return `This ${productData.name} has a health score of ${productData.score}/100 which is considered excellent. It appears to be a healthy choice.`;
    } else if (productData.score >= 60) {
      return `This ${productData.name} has a health score of ${productData.score}/100 which is considered good. It's a reasonably healthy choice.`;
    } else {
      return `This ${productData.name} has a health score of ${productData.score}/100 which is considered poor. You may want to consider healthier alternatives.`;
    }
  }
  
  // Default responses
  const responses = [
    `Based on the product information for ${productData.name}, this appears to be a ${productData.category || 'general'} item. ${query.includes('healthy') ? 'For health considerations, I recommend checking the ingredients list and nutrition facts.' : 'Is there anything specific about this product you\'d like to know?'}`,
    `This ${productData.name} ${productData.nutrition ? 'has' : 'would have'} nutritional information that can help determine its health value. ${query.includes('?') ? 'What specific aspect are you interested in?' : 'Feel free to ask more detailed questions.'}`,
    `I can provide more detailed analysis of this ${productData.name}'s ingredients and nutritional content. ${query.includes('ingredient') ? 'The key ingredients would be important to review.' : 'What would you like to know about its composition?'}`
  ];
  
  return responses[Math.floor(Math.random() * responses.length)];
}

// Create a simple test image file
const testImagePath = path.join(__dirname, 'test-image.txt');
const testImageContent = `
NUTRITION FACTS
Servings Per Container: 8
Serving Size: 1 cup (30g)

Amount Per Serving
Calories 120
Calories from Fat 10
Total Fat 1g
Saturated Fat 0g
Trans Fat 0g
Cholesterol 0mg
Sodium 140mg
Total Carbohydrate 26g
Dietary Fiber 3g
Sugars 12g
Protein 2g

Vitamin A 10% • Vitamin C 2%
Calcium 15% • Iron 4%

Ingredients: Whole Grain Oats, Sugar, Corn Syrup, Salt, Caramel Color.
Contains: Gluten.

Manufactured by: Healthy Foods Inc.
`;

// Write test image content to file
fs.writeFileSync(testImagePath, testImageContent);
console.log('Created test image file');

// Test the complete workflow
async function testCompleteWorkflow() {
  try {
    console.log('Testing complete SIKI workflow...');
    
    // Step 1: Test product analysis endpoint
    console.log('Step 1: Testing product analysis...');
    
    // Analyze the test image content
    const productData = analyzeOCRText(testImageContent);
    console.log('OCR Analysis Result:', JSON.stringify(productData, null, 2));
    
    // Step 2: Test chat functionality with the product data
    console.log('\nStep 2: Testing chat functionality...');
    
    // Mock user preferences
    const userPreferences = {
      allergies: ['nuts'],
      dietaryRestrictions: ['vegan'],
      healthGoals: ['low-sugar']
    };
    
    // Test the enhanced response function
    const testQueries = [
      "Is this product keto-friendly?",
      "Is this product vegan?",
      "Is this safe for someone with gluten allergies?",
      "Is this product healthy?",
      "What are the ingredients?"
    ];
    
    testQueries.forEach(query => {
      const response = generateEnhancedResponse(productData, userPreferences, query);
      console.log(`\nQuery: ${query}`);
      console.log(`Response: ${response}`);
    });
    
    console.log('\nComplete workflow test finished successfully!');
    
  } catch (error) {
    console.error('Error in complete workflow test:', error.message);
  } finally {
    // Clean up test file
    if (fs.existsSync(testImagePath)) {
      fs.unlinkSync(testImagePath);
      console.log('Cleaned up test image file');
    }
  }
}

// Run the test
testCompleteWorkflow();