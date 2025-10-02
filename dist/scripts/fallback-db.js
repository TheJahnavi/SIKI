// Fallback Database for SIKI App
// Contains static data for objects that can't be identified through OCR

export const fallbackDB = {
  // Raw Foods
  "apple": { 
    score: 95, 
    type: "Raw Food", 
    message: "High in fiber and antioxidants. A healthy snack option.",
    nutrition: {
      calories: "95 per medium apple",
      sugar: "19g",
      fiber: "4g",
      vitamins: ["Vitamin C", "Potassium"]
    },
    dietary: ["vegan", "gluten-free", "keto-friendly in moderation"]
  },
  "banana": { 
    score: 90, 
    type: "Raw Food", 
    message: "Rich in potassium and vitamins. Great for energy.",
    nutrition: {
      calories: "105 per medium banana",
      sugar: "14g",
      fiber: "3g",
      vitamins: ["Vitamin B6", "Potassium"]
    },
    dietary: ["vegan", "gluten-free"]
  },
  "orange": { 
    score: 85, 
    type: "Raw Food", 
    message: "High in vitamin C and fiber. Supports immune system.",
    nutrition: {
      calories: "62 per medium orange",
      sugar: "12g",
      fiber: "3g",
      vitamins: ["Vitamin C", "Folate"]
    },
    dietary: ["vegan", "gluten-free", "keto-friendly in moderation"]
  },
  "pear": { 
    score: 88, 
    type: "Raw Food", 
    message: "Good source of fiber and vitamin C. Hydrating and nutritious.",
    nutrition: {
      calories: "101 per medium pear",
      sugar: "17g",
      fiber: "6g",
      vitamins: ["Vitamin C", "Copper"]
    },
    dietary: ["vegan", "gluten-free"]
  },
  
  // Packaged Foods
  "chocolate": { 
    score: 40, 
    type: "Processed Food", 
    message: "High in sugar and calories. Consume occasionally as a treat.",
    nutrition: {
      calories: "220 per ounce",
      sugar: "13g",
      fat: "13g",
      ingredients: ["Cocoa", "Sugar", "Milk"]
    },
    dietary: ["vegetarian"],
    allergens: ["milk"]
  },
  "cookie": { 
    score: 30, 
    type: "Processed Food", 
    message: "High in sugar and unhealthy fats. Not recommended for regular consumption.",
    nutrition: {
      calories: "150 per cookie",
      sugar: "10g",
      fat: "8g",
      ingredients: ["Flour", "Sugar", "Butter", "Chocolate chips"]
    },
    dietary: ["vegetarian"],
    allergens: ["gluten", "milk"]
  },
  "chips": { 
    score: 25, 
    type: "Processed Food", 
    message: "High in sodium and unhealthy fats. Occasional consumption only.",
    nutrition: {
      calories: "160 per ounce",
      fat: "10g",
      sodium: "170mg",
      ingredients: ["Potatoes", "Vegetable oil", "Salt"]
    },
    dietary: ["vegan", "gluten-free"],
    allergens: []
  },
  
  // Beverages
  "water bottle": { 
    score: "N/A", 
    type: "Beverage Container", 
    message: "Reusable container. Fill with clean water for hydration.",
    nutrition: {
      calories: "0",
      ingredients: ["Water"]
    },
    dietary: ["vegan", "gluten-free", "keto-friendly"],
    allergens: []
  },
  "soda can": { 
    score: 10, 
    type: "Beverage Container", 
    message: "High in sugar and empty calories. Choose water or unsweetened alternatives.",
    nutrition: {
      calories: "140 per 12 fl oz",
      sugar: "39g",
      caffeine: "34mg",
      ingredients: ["Carbonated water", "High fructose corn syrup", "Caramel color"]
    },
    dietary: ["vegan", "gluten-free"],
    allergens: []
  },
  
  // Packaging & Containers
  "plastic bottle": { 
    score: 40, 
    type: "Packaging", 
    message: "Recycle properly. Consider reusable alternatives to reduce waste.",
    nutrition: null,
    dietary: [],
    allergens: []
  },
  "glass bottle": { 
    score: 50, 
    type: "Packaging", 
    message: "Recyclable container. Better environmental choice than plastic.",
    nutrition: null,
    dietary: [],
    allergens: []
  },
  
  // Tools & Non-Food Items
  "pencil": { 
    score: "N/A", 
    type: "Tool", 
    message: "Not edible. Use for writing or drawing.",
    nutrition: null,
    dietary: [],
    allergens: []
  },
  "pen": { 
    score: "N/A", 
    type: "Tool", 
    message: "Not edible. Use for writing or drawing.",
    nutrition: null,
    dietary: [],
    allergens: []
  },
  
  // Default
  "unknown": { 
    score: "N/A", 
    type: "Unknown", 
    message: "Unable to identify object. Please try another image.",
    nutrition: null,
    dietary: [],
    allergens: []
  }
};

// Function to get fallback data by object name
export function getFallbackData(objectName) {
  // Normalize the object name for matching
  const normalizedName = objectName.toLowerCase().trim();
  
  // Direct match
  if (fallbackDB[normalizedName]) {
    return fallbackDB[normalizedName];
  }
  
  // Partial match
  for (const key in fallbackDB) {
    if (normalizedName.includes(key) || key.includes(normalizedName)) {
      return fallbackDB[key];
    }
  }
  
  // Default fallback
  return fallbackDB["unknown"];
}