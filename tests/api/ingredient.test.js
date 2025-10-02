// API Tests for Ingredient Service
const request = require('supertest');
const app = require('../../server.cjs');

describe('Ingredient API Tests', () => {
  describe('GET /api/ingredients', () => {
    it('TC-008: Should return all ingredients', async () => {
      const response = await request(app)
        .get('/api/ingredients')
        .expect(200);
      
      expect(response.body).to.have.property('success', true);
      expect(response.body).to.have.property('ingredients');
      expect(response.body.ingredients).to.be.an('array');
      expect(response.body.ingredients.length).to.be.greaterThan(0);
    });
  });

  describe('GET /api/ingredients/:name', () => {
    it('TC-015: Should return specific ingredient by name', async () => {
      const response = await request(app)
        .get('/api/ingredients/High Fructose Corn Syrup')
        .expect(200);
      
      expect(response.body).to.have.property('success', true);
      expect(response.body).to.have.property('ingredient');
      expect(response.body.ingredient).to.have.property('name', 'High Fructose Corn Syrup');
      expect(response.body.ingredient).to.have.property('riskLevel', 'warning');
    });

    it('TC-015: Should return 404 for non-existent ingredient', async () => {
      const response = await request(app)
        .get('/api/ingredients/NonExistentIngredient')
        .expect(404);
      
      expect(response.body).to.have.property('success', false);
      expect(response.body).to.have.property('error');
    });
  });

  describe('GET /api/ingredients/risk/:riskLevel', () => {
    it('TC-015: Should return ingredients by risk level', async () => {
      const response = await request(app)
        .get('/api/ingredients/risk/warning')
        .expect(200);
      
      expect(response.body).to.have.property('success', true);
      expect(response.body).to.have.property('ingredients');
      expect(response.body.ingredients).to.be.an('array');
      
      // Check that all returned ingredients have the correct risk level
      response.body.ingredients.forEach(ingredient => {
        expect(ingredient).to.have.property('riskLevel', 'warning');
      });
    });
  });

  describe('GET /api/flagged-ingredients', () => {
    it('TC-015: Should return all flagged ingredients', async () => {
      const response = await request(app)
        .get('/api/flagged-ingredients')
        .expect(200);
      
      expect(response.body).to.have.property('success', true);
      expect(response.body).to.have.property('ingredients');
      expect(response.body.ingredients).to.be.an('array');
      
      // Check that all returned ingredients are flagged (caution or warning)
      response.body.ingredients.forEach(ingredient => {
        expect(['caution', 'warning']).to.include(ingredient.riskLevel);
      });
    });
  });
});// API Tests for Ingredient Service
const request = require('supertest');
const app = require('../../server.cjs');

describe('Ingredient API Tests', () => {
  describe('GET /api/ingredients', () => {
    it('TC-008: Should return all ingredients', async () => {
      const response = await request(app)
        .get('/api/ingredients')
        .expect(200);
      
      expect(response.body).to.have.property('success', true);
      expect(response.body).to.have.property('ingredients');
      expect(response.body.ingredients).to.be.an('array');
      expect(response.body.ingredients.length).to.be.greaterThan(0);
    });
  });

  describe('GET /api/ingredients/:name', () => {
    it('TC-015: Should return specific ingredient by name', async () => {
      const response = await request(app)
        .get('/api/ingredients/High Fructose Corn Syrup')
        .expect(200);
      
      expect(response.body).to.have.property('success', true);
      expect(response.body).to.have.property('ingredient');
      expect(response.body.ingredient).to.have.property('name', 'High Fructose Corn Syrup');
      expect(response.body.ingredient).to.have.property('riskLevel', 'warning');
    });

    it('TC-015: Should return 404 for non-existent ingredient', async () => {
      const response = await request(app)
        .get('/api/ingredients/NonExistentIngredient')
        .expect(404);
      
      expect(response.body).to.have.property('success', false);
      expect(response.body).to.have.property('error');
    });
  });

  describe('GET /api/ingredients/risk/:riskLevel', () => {
    it('TC-015: Should return ingredients by risk level', async () => {
      const response = await request(app)
        .get('/api/ingredients/risk/warning')
        .expect(200);
      
      expect(response.body).to.have.property('success', true);
      expect(response.body).to.have.property('ingredients');
      expect(response.body.ingredients).to.be.an('array');
      
      // Check that all returned ingredients have the correct risk level
      response.body.ingredients.forEach(ingredient => {
        expect(ingredient).to.have.property('riskLevel', 'warning');
      });
    });
  });

  describe('GET /api/flagged-ingredients', () => {
    it('TC-015: Should return all flagged ingredients', async () => {
      const response = await request(app)
        .get('/api/flagged-ingredients')
        .expect(200);
      
      expect(response.body).to.have.property('success', true);
      expect(response.body).to.have.property('ingredients');
      expect(response.body.ingredients).to.be.an('array');
      
      // Check that all returned ingredients are flagged (caution or warning)
      response.body.ingredients.forEach(ingredient => {
        expect(['caution', 'warning']).to.include(ingredient.riskLevel);
      });
    });
  });
});