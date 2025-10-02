// Script to populate the ingredient database with sample data
// This script adds more ingredients to meet the requirement of 50 common flagged ingredients

import IngredientService from '../services/IngredientService.js';

// Additional sample ingredient data to reach 50 ingredients
const additionalIngredients = [
  {
    name: "Aspartame",
    harmfulTag: "Artificial Sweetener",
    effectOnBody: "May cause headaches and migraines in sensitive individuals. Some studies suggest potential links to cancer, though FDA considers it safe.",
    swapSuggestion: "Use natural sweeteners like stevia, monk fruit, or small amounts of honey or maple syrup.",
    regulatoryStatus: "Approved with restrictions",
    category: "Sweetener",
    riskLevel: "caution",
    commonSources: ["Diet sodas", "Sugar-free gum", "Low-calorie snacks", "Protein powders"],
    alternativeNames: ["E951", "NutraSweet", "Equal"]
  },
  {
    name: "Saccharin",
    harmfulTag: "Artificial Sweetener",
    effectOnBody: "Was banned in Canada due to cancer concerns in animal studies. Now considered safe in moderate amounts by FDA.",
    swapSuggestion: "Choose natural sweeteners like stevia or small amounts of honey.",
    regulatoryStatus: "Approved with restrictions",
    category: "Sweetener",
    riskLevel: "caution",
    commonSources: ["Diet sodas", "Tabletop sweeteners", "Processed foods"],
    alternativeNames: ["E954", "Sweet'n Low"]
  },
  {
    name: "Sucralose",
    harmfulTag: "Artificial Sweetener",
    effectOnBody: "May negatively affect gut bacteria. Heat can create toxic compounds when used in cooking.",
    swapSuggestion: "Use heat-stable natural sweeteners like stevia or small amounts of maple syrup for cooking.",
    regulatoryStatus: "Approved",
    category: "Sweetener",
    riskLevel: "caution",
    commonSources: ["Diet sodas", "Sugar-free products", "Baked goods"],
    alternativeNames: ["E955", "Splenda"]
  },
  {
    name: "Acesulfame Potassium",
    harmfulTag: "Artificial Sweetener",
    effectOnBody: "May affect insulin response and glucose metabolism. Often combined with other artificial sweeteners.",
    swapSuggestion: "Choose products with single natural sweeteners like stevia or monk fruit.",
    regulatoryStatus: "Approved",
    category: "Sweetener",
    riskLevel: "caution",
    commonSources: ["Diet sodas", "Sugar-free gum", "Protein bars"],
    alternativeNames: ["E950", "Ace-K"]
  },
  {
    name: "Carrageenan",
    harmfulTag: "Thickening Agent",
    effectOnBody: "May cause gastrointestinal inflammation and digestive issues in sensitive individuals.",
    swapSuggestion: "Look for products using natural thickeners like guar gum, xanthan gum, or pectin.",
    regulatoryStatus: "Approved",
    category: "Stabilizer",
    riskLevel: "caution",
    commonSources: ["Plant-based milks", "Yogurt", "Processed meats"],
    alternativeNames: ["E407", "Irish moss extract"]
  },
  {
    name: "Potassium Bromate",
    harmfulTag: "Flour Treatment",
    effectOnBody: "Classified as a possible human carcinogen. Banned in EU and several other countries.",
    swapSuggestion: "Choose breads labeled as bromate-free or made with organic flour.",
    regulatoryStatus: "Approved with restrictions (banned in EU, Canada, Brazil)",
    category: "Flour Treatment",
    riskLevel: "warning",
    commonSources: ["Commercial breads", "Rolls", "Crackers"],
    alternativeNames: ["E924", "Bromate"]
  },
  {
    name: "Azodicarbonamide",
    harmfulTag: "Flour Bleaching Agent",
    effectOnBody: "May cause respiratory issues and allergic reactions. Banned in EU and Australia.",
    swapSuggestion: "Choose products with natural aging processes or labeled as unbleached.",
    regulatoryStatus: "Approved with restrictions (banned in EU, Australia)",
    category: "Flour Treatment",
    riskLevel: "caution",
    commonSources: ["Commercial breads", "Buns", "Crackers"],
    alternativeNames: ["E927", "ADA"]
  },
  {
    name: "Butylated Hydroxytoluene (BHT)",
    harmfulTag: "Antioxidant",
    effectOnBody: "Possible endocrine disruptor. May accumulate in body tissues over time.",
    swapSuggestion: "Look for products using natural antioxidants like vitamin E (tocopherols) or rosemary extract.",
    regulatoryStatus: "Approved with restrictions",
    category: "Preservative",
    riskLevel: "caution",
    commonSources: ["Chips", "Packaged nuts", "Cereals", "Packaged baked goods"],
    alternativeNames: ["E321", "Butylated hydroxytoluene"]
  },
  {
    name: "Olestra",
    harmfulTag: "Fat Substitute",
    effectOnBody: "Can cause digestive issues and interfere with absorption of fat-soluble vitamins (A, D, E, K).",
    swapSuggestion: "Choose products with natural fats in moderation rather than fat substitutes.",
    regulatoryStatus: "Approved",
    category: "Fat Substitute",
    riskLevel: "caution",
    commonSources: ["Fat-free chips", "Snack crackers", "Reduced-fat products"],
    alternativeNames: ["Olean", "E952"]
  },
  {
    name: "Yellow 5 (Tartrazine)",
    harmfulTag: "Artificial Color",
    effectOnBody: "May cause allergic reactions and hyperactivity in children. Can trigger asthma in sensitive individuals.",
    swapSuggestion: "Choose products with natural colorants like turmeric, annatto, or beta-carotene.",
    regulatoryStatus: "Approved with restrictions",
    category: "Coloring",
    riskLevel: "caution",
    commonSources: ["Candy", "Cereals", "Packaged snacks", "Beverages"],
    alternativeNames: ["E102", "FD&C Yellow No. 5"]
  },
  {
    name: "Yellow 6 (Sunset Yellow)",
    harmfulTag: "Artificial Color",
    effectOnBody: "May cause allergic reactions and hyperactivity in children. Contains benzidine, a potential carcinogen.",
    swapSuggestion: "Choose products with natural colorants like turmeric or paprika extract.",
    regulatoryStatus: "Approved with restrictions",
    category: "Coloring",
    riskLevel: "caution",
    commonSources: ["Candy", "Cereals", "Packaged snacks", "Beverages"],
    alternativeNames: ["E110", "FD&C Yellow No. 6"]
  },
  {
    name: "Red 40 (Allura Red)",
    harmfulTag: "Artificial Color",
    effectOnBody: "May cause allergic reactions and hyperactivity in children. Linked to tumor formation in animal studies.",
    swapSuggestion: "Choose products with natural colorants like beet juice or red cabbage extract.",
    regulatoryStatus: "Approved with restrictions",
    category: "Coloring",
    riskLevel: "caution",
    commonSources: ["Candy", "Cereals", "Packaged snacks", "Beverages"],
    alternativeNames: ["E129", "FD&C Red No. 40"]
  },
  {
    name: "Blue 1 (Brilliant Blue)",
    harmfulTag: "Artificial Color",
    effectOnBody: "May cause allergic reactions. Can accumulate in organs like the liver and kidneys.",
    swapSuggestion: "Choose products with natural colorants like spirulina or butterfly pea flower extract.",
    regulatoryStatus: "Approved with restrictions",
    category: "Coloring",
    riskLevel: "caution",
    commonSources: ["Candy", "Cereals", "Packaged snacks", "Beverages"],
    alternativeNames: ["E133", "FD&C Blue No. 1"]
  },
  {
    name: "Blue 2 (Indigotine)",
    harmfulTag: "Artificial Color",
    effectOnBody: "May cause allergic reactions and hyperactivity in children. Linked to tumor formation in animal studies.",
    swapSuggestion: "Choose products with natural colorants like spirulina or butterfly pea flower extract.",
    regulatoryStatus: "Approved with restrictions",
    category: "Coloring",
    riskLevel: "caution",
    commonSources: ["Candy", "Cereals", "Packaged snacks", "Beverages"],
    alternativeNames: ["E132", "FD&C Blue No. 2"]
  },
  {
    name: "Green 3 (Fast Green)",
    harmfulTag: "Artificial Color",
    effectOnBody: "May cause allergic reactions. Contains aluminum which can accumulate in the body.",
    swapSuggestion: "Choose products with natural colorants like spinach extract or matcha powder.",
    regulatoryStatus: "Approved with restrictions",
    category: "Coloring",
    riskLevel: "caution",
    commonSources: ["Candy", "Cereals", "Packaged snacks", "Beverages"],
    alternativeNames: ["E143", "FD&C Green No. 3"]
  },
  {
    name: "Red 3 (Erythrosine)",
    harmfulTag: "Artificial Color",
    effectOnBody: "Linked to thyroid tumors in animal studies. May cause allergic reactions.",
    swapSuggestion: "Choose products with natural colorants like beet juice or red cabbage extract.",
    regulatoryStatus: "Approved with restrictions",
    category: "Coloring",
    riskLevel: "caution",
    commonSources: ["Candy", "Cereals", "Packaged snacks", "Beverages"],
    alternativeNames: ["E127", "FD&C Red No. 3"]
  },
  {
    name: "Citric Acid",
    harmfulTag: "Acidulant",
    effectOnBody: "Generally safe but can erode tooth enamel when consumed in large amounts in acidic beverages.",
    swapSuggestion: "Choose products with natural citric acid from citrus fruits or consume acidic beverages with meals.",
    regulatoryStatus: "Approved",
    category: "Acidulant",
    riskLevel: "caution",
    commonSources: ["Sodas", "Candy", "Jams", "Packaged snacks"],
    alternativeNames: ["E330", "Sour salt"]
  },
  {
    name: "Sodium Cyclamate",
    harmfulTag: "Artificial Sweetener",
    effectOnBody: "Banned in the US due to cancer concerns in animal studies. Still approved in some countries.",
    swapSuggestion: "Choose products with approved natural sweeteners like stevia or monk fruit.",
    regulatoryStatus: "Banned in US, Approved in EU with restrictions",
    category: "Sweetener",
    riskLevel: "caution",
    commonSources: ["Diet sodas (in countries where allowed)", "Tabletop sweeteners (in countries where allowed)"],
    alternativeNames: ["E952", "Cyclamic acid"]
  },
  {
    name: "Potassium Sorbate",
    harmfulTag: "Preservative",
    effectOnBody: "Generally safe but may cause allergic reactions in sensitive individuals. Can interact with other preservatives.",
    swapSuggestion: "Look for products using natural preservatives like rosemary extract or vitamin E.",
    regulatoryStatus: "Approved",
    category: "Preservative",
    riskLevel: "caution",
    commonSources: ["Cheese", "Wine", "Baked goods", "Dried fruits"],
    alternativeNames: ["E202", "Sorbic acid potassium salt"]
  },
  {
    name: "Calcium Propionate",
    harmfulTag: "Preservative",
    effectOnBody: "May cause migraines and behavioral changes in sensitive individuals, especially children.",
    swapSuggestion: "Choose breads labeled as preservative-free or made with natural fermentation processes.",
    regulatoryStatus: "Approved",
    category: "Preservative",
    riskLevel: "caution",
    commonSources: ["Commercial breads", "Baked goods", "Cheese"],
    alternativeNames: ["E282", "Propionic acid calcium salt"]
  },
  {
    name: "Sodium Nitrate",
    harmfulTag: "Curing Agent",
    effectOnBody: "Can form nitrosamines, which are carcinogenic. May increase risk of certain cancers.",
    swapSuggestion: "Look for nitrate-free meats that use natural curing agents like celery juice powder.",
    regulatoryStatus: "Approved with restrictions",
    category: "Preservative",
    riskLevel: "caution",
    commonSources: ["Bacon", "Hot dogs", "Deli meats", "Cured sausages"],
    alternativeNames: ["E251", "Nitrate"]
  },
  {
    name: "Disodium Inosinate",
    harmfulTag: "Flavor Enhancer",
    effectOnBody: "May cause allergic reactions in people with gout or those taking certain medications. Can increase uric acid levels.",
    swapSuggestion: "Choose products without added flavor enhancers or use natural umami sources like mushrooms or seaweed.",
    regulatoryStatus: "Approved",
    category: "Flavor Enhancer",
    riskLevel: "caution",
    commonSources: ["Chips", "Soups", "Seasoning mixes", "Frozen meals"],
    alternativeNames: ["E631", "Inosinic acid disodium salt"]
  },
  {
    name: "Disodium Guanylate",
    harmfulTag: "Flavor Enhancer",
    effectOnBody: "May cause allergic reactions in people with gout or those taking certain medications. Can increase uric acid levels.",
    swapSuggestion: "Choose products without added flavor enhancers or use natural umami sources like mushrooms or seaweed.",
    regulatoryStatus: "Approved",
    category: "Flavor Enhancer",
    riskLevel: "caution",
    commonSources: ["Chips", "Soups", "Seasoning mixes", "Frozen meals"],
    alternativeNames: ["E627", "Guanosine monophosphate disodium salt"]
  },
  {
    name: "Calcium Silicate",
    harmfulTag: "Anti-caking Agent",
    effectOnBody: "Generally safe but may cause digestive discomfort in large amounts. Can interfere with nutrient absorption.",
    swapSuggestion: "Choose products with natural anti-caking agents like rice flour or silica from natural sources.",
    regulatoryStatus: "Approved",
    category: "Anti-caking Agent",
    riskLevel: "caution",
    commonSources: ["Salt", "Powdered drinks", "Spice mixes", "Supplements"],
    alternativeNames: ["E552", "Silicic acid calcium salt"]
  },
  {
    name: "Silicon Dioxide",
    harmfulTag: "Anti-caking Agent",
    effectOnBody: "Generally safe but may accumulate in organs over time. Fine particles may cause respiratory issues if inhaled.",
    swapSuggestion: "Choose products with natural anti-caking agents like rice flour or corn starch.",
    regulatoryStatus: "Approved",
    category: "Anti-caking Agent",
    riskLevel: "caution",
    commonSources: ["Salt", "Powdered drinks", "Spice mixes", "Supplements"],
    alternativeNames: ["E551", "Silica", "Quartz"]
  },
  {
    name: "Polysorbate 80",
    harmfulTag: "Emulsifier",
    effectOnBody: "May disrupt gut bacteria and increase intestinal permeability. Linked to inflammatory bowel disease in animal studies.",
    swapSuggestion: "Look for products using natural emulsifiers like lecithin or gum arabic.",
    regulatoryStatus: "Approved",
    category: "Emulsifier",
    riskLevel: "caution",
    commonSources: ["Ice cream", "Salad dressings", "Mayonnaise", "Baked goods"],
    alternativeNames: ["E433", "Tween 80"]
  },
  {
    name: "Propylene Glycol",
    harmfulTag: "Humectant",
    effectOnBody: "Generally safe in small amounts but can cause allergic reactions. Industrial grade is toxic.",
    swapSuggestion: "Choose products with natural humectants like glycerin from vegetable sources or honey.",
    regulatoryStatus: "Approved",
    category: "Humectant",
    riskLevel: "caution",
    commonSources: ["Baked goods", "Frostings", "Cosmetics", "E-liquids"],
    alternativeNames: ["E1520", "1,2-propanediol"]
  },
  {
    name: "Butylated Hydroxyanisole (BHA)",
    harmfulTag: "Antioxidant",
    effectOnBody: "Possible human carcinogen. May disrupt hormone function.",
    swapSuggestion: "Look for products using natural antioxidants like vitamin E (tocopherols) or rosemary extract.",
    regulatoryStatus: "Approved with restrictions",
    category: "Preservative",
    riskLevel: "caution",
    commonSources: ["Chips", "Packaged nuts", "Cereals", "Packaged baked goods"],
    alternativeNames: ["E320", "Butylated hydroxyanisole"]
  },
  {
    name: "Tertiary Butylhydroquinone (TBHQ)",
    harmfulTag: "Antioxidant",
    effectOnBody: "May cause nausea, vomiting, and delirium in large amounts. Potential carcinogen.",
    swapSuggestion: "Look for products using natural antioxidants like vitamin E (tocopherols) or rosemary extract.",
    regulatoryStatus: "Approved with restrictions",
    category: "Preservative",
    riskLevel: "caution",
    commonSources: ["Instant noodles", "Packaged snacks", "Microwave popcorn", "Frozen foods"],
    alternativeNames: ["E319", "TBHQ"]
  },
  {
    name: "Sodium Sulfite",
    harmfulTag: "Preservative",
    effectOnBody: "May cause severe allergic reactions and asthma attacks in sensitive individuals.",
    swapSuggestion: "Choose products labeled as sulfite-free or with natural preservatives like vitamin E.",
    regulatoryStatus: "Approved with restrictions",
    category: "Preservative",
    riskLevel: "caution",
    commonSources: ["Dried fruits", "Wine", "Shrimp", "Packaged potatoes"],
    alternativeNames: ["E221", "Sulfurous acid sodium salt"]
  },
  {
    name: "Sodium Bisulfite",
    harmfulTag: "Preservative",
    effectOnBody: "May cause severe allergic reactions and asthma attacks in sensitive individuals.",
    swapSuggestion: "Choose products labeled as sulfite-free or with natural preservatives like vitamin E.",
    regulatoryStatus: "Approved with restrictions",
    category: "Preservative",
    riskLevel: "caution",
    commonSources: ["Dried fruits", "Wine", "Shrimp", "Packaged potatoes"],
    alternativeNames: ["E222", "Sulfurous acid sodium bisulfite"]
  },
  {
    name: "Potassium Bisulfite",
    harmfulTag: "Preservative",
    effectOnBody: "May cause severe allergic reactions and asthma attacks in sensitive individuals.",
    swapSuggestion: "Choose products labeled as sulfite-free or with natural preservatives like vitamin E.",
    regulatoryStatus: "Approved with restrictions",
    category: "Preservative",
    riskLevel: "caution",
    commonSources: ["Dried fruits", "Wine", "Shrimp", "Packaged potatoes"],
    alternativeNames: ["E224", "Sulfurous acid potassium bisulfite"]
  },
  {
    name: "Calcium Disodium EDTA",
    harmfulTag: "Chelating Agent",
    effectOnBody: "May interfere with absorption of essential minerals like zinc and iron. Can cause digestive upset.",
    swapSuggestion: "Look for products using natural chelating agents like citric acid from citrus fruits.",
    regulatoryStatus: "Approved",
    category: "Chelating Agent",
    riskLevel: "caution",
    commonSources: ["Salad dressings", "Mayonnaise", "Fruit drinks", "Canned vegetables"],
    alternativeNames: ["E385", "EDTA calcium disodium salt"]
  },
  {
    name: "Sodium Stearoyl Lactylate",
    harmfulTag: "Emulsifier",
    effectOnBody: "May cause allergic reactions in people with milk allergies. Can interfere with nutrient absorption.",
    swapSuggestion: "Look for products using natural emulsifiers like lecithin from sunflower or soy.",
    regulatoryStatus: "Approved",
    category: "Emulsifier",
    riskLevel: "caution",
    commonSources: ["Bread", "Cake mixes", "Whipped toppings", "Frozen desserts"],
    alternativeNames: ["E481", "SSL"]
  },
  {
    name: "Mono- and Diglycerides",
    harmfulTag: "Emulsifier",
    effectOnBody: "Generally safe but may be derived from animal sources. Can contribute to inflammation in sensitive individuals.",
    swapSuggestion: "Look for products using plant-based emulsifiers like sunflower lecithin or guar gum.",
    regulatoryStatus: "Approved",
    category: "Emulsifier",
    riskLevel: "caution",
    commonSources: ["Bread", "Cake mixes", "Whipped toppings", "Frozen desserts"],
    alternativeNames: ["E471", "Glycerol monostearate", "Glycerol distearate"]
  },
  {
    name: "Sodium Aluminum Phosphate",
    harmfulTag: "Leavening Agent",
    effectOnBody: "May contribute to aluminum accumulation in the body. Aluminum has been linked to neurological issues.",
    swapSuggestion: "Choose products with aluminum-free baking powders or natural leavening agents like yeast.",
    regulatoryStatus: "Approved",
    category: "Leavening Agent",
    riskLevel: "caution",
    commonSources: ["Self-rising flour", "Baking powder", "Cake mixes", "Frozen dough"],
    alternativeNames: ["E541", "SALP"]
  },
  {
    name: "Aluminum Sulfate",
    harmfulTag: "Leavening Agent",
    effectOnBody: "May contribute to aluminum accumulation in the body. Aluminum has been linked to neurological issues.",
    swapSuggestion: "Choose products with aluminum-free baking powders or natural leavening agents like yeast.",
    regulatoryStatus: "Approved",
    category: "Leavening Agent",
    riskLevel: "caution",
    commonSources: ["Self-rising flour", "Baking powder", "Cake mixes", "Frozen dough"],
    alternativeNames: ["E521", "Aluminum potassium sulfate"]
  },
  {
    name: "Calcium Sulfate",
    harmfulTag: "Anti-caking Agent",
    effectOnBody: "Generally safe but may cause digestive discomfort in large amounts. Can interfere with nutrient absorption.",
    swapSuggestion: "Choose products with natural anti-caking agents like rice flour or corn starch.",
    regulatoryStatus: "Approved",
    category: "Anti-caking Agent",
    riskLevel: "caution",
    commonSources: ["Salt", "Powdered drinks", "Spice mixes", "Supplements"],
    alternativeNames: ["E516", "Gypsum"]
  },
  {
    name: "Magnesium Stearate",
    harmfulTag: "Lubricant",
    effectOnBody: "Generally safe but may interfere with absorption of medications and nutrients. Can cause laxative effects in large amounts.",
    swapSuggestion: "Look for supplements with plant-based lubricants like vegetable stearate or silica.",
    regulatoryStatus: "Approved",
    category: "Lubricant",
    riskLevel: "caution",
    commonSources: ["Vitamins", "Supplements", "Pharmaceuticals", "Cosmetics"],
    alternativeNames: ["E572", "Stearic acid magnesium salt"]
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
  },
  {
    name: "Potassium Benzoate",
    harmfulTag: "Preservative",
    effectOnBody: "May cause hyperactivity in children. Can form benzene (carcinogen) when combined with vitamin C.",
    swapSuggestion: "Choose products with natural preservatives like rosemary extract or vitamin E.",
    regulatoryStatus: "Approved with restrictions",
    category: "Preservative",
    riskLevel: "caution",
    commonSources: ["Sodas", "Juices", "Pickles", "Condiments"],
    alternativeNames: ["E212", "Benzoic acid potassium salt"]
  }
];

// Function to populate the database
function populateDatabase() {
  console.log('[POPULATE] Starting to populate ingredient database');
  
  let addedCount = 0;
  
  additionalIngredients.forEach(ingredientData => {
    try {
      IngredientService.addIngredient(ingredientData);
      addedCount++;
    } catch (error) {
      console.error(`[POPULATE] Error adding ingredient ${ingredientData.name}:`, error.message);
    }
  });
  
  console.log(`[POPULATE] Successfully added ${addedCount} ingredients to the database`);
  console.log(`[POPULATE] Total ingredients in database: ${IngredientService.getAllIngredients().length}`);
  
  return addedCount;
}

// Run the population script if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  populateDatabase();
}

// Always run the populate function
populateDatabase();

export { populateDatabase, additionalIngredients };