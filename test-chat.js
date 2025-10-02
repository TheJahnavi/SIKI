// Test script to verify the enhanced chat response system

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

// Mock product data
const mockProductData = {
  name: "Organic Coconut Water",
  score: 85,
  category: "Beverage",
  nutrition: {
    calories: "46",
    sugar: "9g"
  },
  ingredients: [
    { name: "Coconut Water" },
    { name: "Natural Flavors" },
    { name: "Vitamin C" }
  ],
  allergens: [],
  dietary: ["vegan", "gluten-free", "keto-friendly"]
};

// Mock user preferences
const mockUserPreferences = {
  allergies: ["nuts"],
  dietaryRestrictions: ["vegan"],
  healthGoals: ["low-sugar"]
};

// Test cases
const testCases = [
  "Is this product keto-friendly?",
  "Is this product vegan?",
  "Is this safe for someone with nut allergies?",
  "Is this product healthy?",
  "What are the ingredients?",
  "How many calories does it have?"
];

console.log("Testing enhanced chat response system...\n");

testCases.forEach((query, index) => {
  console.log(`Test ${index + 1}: "${query}"`);
  const response = generateEnhancedResponse(mockProductData, mockUserPreferences, query);
  console.log(`Response: ${response}\n`);
});