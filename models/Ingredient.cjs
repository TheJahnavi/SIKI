// Ingredient Model for SIKI App
// Defines the structured schema for ingredients

class Ingredient {
  constructor(data) {
    this.name = data.name || '';
    this.harmfulTag = data.harmfulTag || null; // e.g., 'High Sugar', 'Artificial', 'Allergen'
    this.effectOnBody = data.effectOnBody || '';
    this.swapSuggestion = data.swapSuggestion || '';
    this.regulatoryStatus = data.regulatoryStatus || ''; // e.g., 'Approved', 'Restricted', 'Banned'
    this.category = data.category || ''; // e.g., 'Preservative', 'Sweetener', 'Coloring'
    this.riskLevel = data.riskLevel || 'safe'; // 'safe', 'caution', 'warning'
    this.commonSources = data.commonSources || []; // Foods where this ingredient is commonly found
    this.alternativeNames = data.alternativeNames || []; // Other names this ingredient might appear as
  }

  // Get a simplified harm statement for the ingredient
  getHarmStatement() {
    if (this.riskLevel === 'safe') {
      return `${this.name} is generally considered safe for consumption.`;
    }
    return this.effectOnBody || `This ingredient may pose health risks.`;
  }

  // Get a healthier swap suggestion
  getSwapSuggestion() {
    return this.swapSuggestion || `Consider looking for products without ${this.name} or products that use natural alternatives.`;
  }

  // Check if the ingredient is flagged (caution or warning)
  isFlagged() {
    return this.riskLevel === 'caution' || this.riskLevel === 'warning';
  }

  // Get the risk level as a readable string
  getRiskLevelString() {
    switch (this.riskLevel) {
      case 'warning':
        return 'High Risk';
      case 'caution':
        return 'Medium Risk';
      case 'safe':
        return 'Low Risk';
      default:
        return 'Unknown Risk';
    }
  }

  // Convert to JSON for API responses
  toJSON() {
    return {
      name: this.name,
      harmfulTag: this.harmfulTag,
      effectOnBody: this.effectOnBody,
      swapSuggestion: this.swapSuggestion,
      regulatoryStatus: this.regulatoryStatus,
      category: this.category,
      riskLevel: this.riskLevel,
      commonSources: this.commonSources,
      alternativeNames: this.alternativeNames
    };
  }

  // Create an ingredient from JSON data
  static fromJSON(data) {
    return new Ingredient(data);
  }
}

module.exports = Ingredient;