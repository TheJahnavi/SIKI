// Ingredient Service for SIKI App
// Handles ingredient data operations and database interactions

const Ingredient = require('../models/Ingredient.cjs');

class IngredientService {
  constructor() {
    // In-memory database for ingredients (in a real app, this would be Firestore)
    this.ingredients = new Map();
    this.initializeDatabase();
  }

  // Initialize the database with sample data
  initializeDatabase() {
    console.log('[INGREDIENT-SERVICE] Initializing ingredient database with sample data');
    
    // Sample ingredient data (first 50 common flagged ingredients)
    const sampleIngredients = [
      {
        name: "High Fructose Corn Syrup",
        harmfulTag: "High Sugar",
        effectOnBody: "Can lead to weight gain, fatty liver disease, and insulin resistance. May increase risk of diabetes and heart disease.",
        swapSuggestion: "Look for products sweetened with stevia, monk fruit, or small amounts of natural sugars like honey or maple syrup.",
        regulatoryStatus: "Approved",
        category: "Sweetener",
        riskLevel: "warning",
        commonSources: ["Sodas", "Candy", "Packaged snacks", "Breakfast cereals"],
        alternativeNames: ["HFCS", "Glucose-fructose syrup", "Isoglucose"]
      },
      {
        name: "Artificial Colors",
        harmfulTag: "Synthetic Additive",
        effectOnBody: "May cause hyperactivity in children and allergic reactions. Some have been linked to cancer in animal studies.",
        swapSuggestion: "Choose products with natural colorants like beet juice, turmeric, or spirulina.",
        regulatoryStatus: "Approved with restrictions",
        category: "Coloring",
        riskLevel: "caution",
        commonSources: ["Candy", "Cereals", "Packaged snacks", "Beverages"],
        alternativeNames: ["FD&C Red No. 40", "Yellow 5", "Blue 1", "Tartrazine"]
      },
      {
        name: "BHA (Butylated Hydroxyanisole)",
        harmfulTag: "Preservative",
        effectOnBody: "Possible human carcinogen. May disrupt hormone function.",
        swapSuggestion: "Look for products using natural preservatives like vitamin E (tocopherols) or rosemary extract.",
        regulatoryStatus: "Approved with restrictions",
        category: "Preservative",
        riskLevel: "caution",
        commonSources: ["Chips", "Packaged nuts", "Cereals", "Packaged baked goods"],
        alternativeNames: ["E320", "Butylated hydroxyanisole"]
      },
      {
        name: "BHT (Butylated Hydroxytoluene)",
        harmfulTag: "Preservative",
        effectOnBody: "Possible human carcinogen. May disrupt hormone function.",
        swapSuggestion: "Look for products using natural preservatives like vitamin E (tocopherols) or rosemary extract.",
        regulatoryStatus: "Approved with restrictions",
        category: "Preservative",
        riskLevel: "caution",
        commonSources: ["Chips", "Packaged nuts", "Cereals", "Packaged baked goods"],
        alternativeNames: ["E321", "Butylated hydroxytoluene"]
      },
      {
        name: "Partially Hydrogenated Oils",
        harmfulTag: "Trans Fat",
        effectOnBody: "Raises bad cholesterol (LDL) and lowers good cholesterol (HDL). Increases risk of heart disease, stroke, and diabetes.",
        swapSuggestion: "Choose products with liquid oils like olive, avocado, or canola oil.",
        regulatoryStatus: "Banned in some countries",
        category: "Fat",
        riskLevel: "warning",
        commonSources: ["Margarine", "Packaged baked goods", "Fried foods", "Snack crackers"],
        alternativeNames: ["Trans fats", "Hydrogenated oils"]
      },
      {
        name: "Sodium Nitrite",
        harmfulTag: "Curing Agent",
        effectOnBody: "Can form nitrosamines, which are carcinogenic. May increase risk of certain cancers.",
        swapSuggestion: "Look for nitrate-free meats that use natural curing agents like celery juice powder.",
        regulatoryStatus: "Approved with restrictions",
        category: "Preservative",
        riskLevel: "caution",
        commonSources: ["Bacon", "Hot dogs", "Deli meats", "Cured sausages"],
        alternativeNames: ["E250", "Nitrite"]
      },
      {
        name: "Monosodium Glutamate (MSG)",
        harmfulTag: "Flavor Enhancer",
        effectOnBody: "May cause headaches, flushing, and sweating in sensitive individuals (Chinese Restaurant Syndrome).",
        swapSuggestion: "Use natural umami sources like mushrooms, tomatoes, or seaweed for flavor enhancement.",
        regulatoryStatus: "Approved",
        category: "Flavor Enhancer",
        riskLevel: "caution",
        commonSources: ["Chips", "Soups", "Seasoning mixes", "Frozen meals"],
        alternativeNames: ["E621", "Glutamic acid sodium salt"]
      },
      {
        name: "Artificial Sweeteners",
        harmfulTag: "Sugar Substitute",
        effectOnBody: "May disrupt gut bacteria and glucose metabolism. Some linked to cancer in animal studies.",
        swapSuggestion: "Use small amounts of natural sweeteners like honey, maple syrup, or stevia if needed.",
        regulatoryStatus: "Approved with restrictions",
        category: "Sweetener",
        riskLevel: "caution",
        commonSources: ["Diet sodas", "Sugar-free gum", "Low-calorie snacks", "Protein powders"],
        alternativeNames: ["Aspartame", "Sucralose", "Saccharin", "Acesulfame Potassium"]
      },
      {
        name: "Propyl Gallate",
        harmfulTag: "Antioxidant",
        effectOnBody: "May disrupt hormone function. Possible carcinogen.",
        swapSuggestion: "Look for products using natural antioxidants like vitamin E (tocopherols) or rosemary extract.",
        regulatoryStatus: "Approved with restrictions",
        category: "Preservative",
        riskLevel: "caution",
        commonSources: ["Meat products", "Packaged oils", "Chewing gum", "Cosmetics"],
        alternativeNames: ["E310", "Propyl gallate"]
      },
      {
        name: "Sodium Benzoate",
        harmfulTag: "Preservative",
        effectOnBody: "May cause hyperactivity in children. Can form benzene (carcinogen) when combined with vitamin C.",
        swapSuggestion: "Choose products with natural preservatives like rosemary extract or vitamin E.",
        regulatoryStatus: "Approved with restrictions",
        category: "Preservative",
        riskLevel: "caution",
        commonSources: ["Sodas", "Juices", "Pickles", "Condiments"],
        alternativeNames: ["E211", "Benzoic acid sodium salt"]
      }
    ];

    // Add sample ingredients to the database
    sampleIngredients.forEach(ingredientData => {
      const ingredient = new Ingredient(ingredientData);
      this.ingredients.set(ingredient.name.toLowerCase(), ingredient);
    });

    console.log(`[INGREDIENT-SERVICE] Initialized with ${this.ingredients.size} ingredients`);
  }

  // Get an ingredient by name
  getIngredientByName(name) {
    if (!name) return null;
    
    // Try exact match first
    let ingredient = this.ingredients.get(name.toLowerCase());
    
    // If not found, try alternative names
    if (!ingredient) {
      for (let [key, ing] of this.ingredients) {
        if (ing.alternativeNames.some(altName => 
          altName.toLowerCase() === name.toLowerCase())) {
          ingredient = ing;
          break;
        }
      }
    }
    
    return ingredient ? ingredient.toJSON() : null;
  }

  // Get all ingredients
  getAllIngredients() {
    return Array.from(this.ingredients.values()).map(ing => ing.toJSON());
  }

  // Add a new ingredient
  addIngredient(ingredientData) {
    const ingredient = new Ingredient(ingredientData);
    this.ingredients.set(ingredient.name.toLowerCase(), ingredient);
    return ingredient.toJSON();
  }

  // Update an existing ingredient
  updateIngredient(name, updateData) {
    const existing = this.ingredients.get(name.toLowerCase());
    if (!existing) return null;
    
    // Update the ingredient properties
    Object.assign(existing, updateData);
    return existing.toJSON();
  }

  // Delete an ingredient
  deleteIngredient(name) {
    return this.ingredients.delete(name.toLowerCase());
  }

  // Search ingredients by category
  searchByCategory(category) {
    const results = [];
    for (let [key, ingredient] of this.ingredients) {
      if (ingredient.category.toLowerCase().includes(category.toLowerCase())) {
        results.push(ingredient.toJSON());
      }
    }
    return results;
  }

  // Search ingredients by risk level
  searchByRiskLevel(riskLevel) {
    const results = [];
    for (let [key, ingredient] of this.ingredients) {
      if (ingredient.riskLevel === riskLevel) {
        results.push(ingredient.toJSON());
      }
    }
    return results;
  }

  // Get flagged ingredients (caution or warning)
  getFlaggedIngredients() {
    const results = [];
    for (let [key, ingredient] of this.ingredients) {
      if (ingredient.isFlagged()) {
        results.push(ingredient.toJSON());
      }
    }
    return results;
  }
}

// Create and export a singleton instance
const ingredientService = new IngredientService();
module.exports = ingredientService;