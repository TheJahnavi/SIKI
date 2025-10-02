// API Tests for Product Analysis
const request = require('supertest');
const app = require('../../server.cjs');
const fs = require('fs');
const path = require('path');

describe('Product Analysis API Tests', () => {
  describe('POST /api/analyze-product', () => {
    it('TC-001: Should analyze product image and return results', async () => {
      // Create a mock image file
      const testImagePath = path.join(__dirname, '..', '..', 'tests', 'test-image.jpg');
      
      // If test image doesn't exist, create a simple mock
      if (!fs.existsSync(testImagePath)) {
        // Create a simple buffer to represent an image
        const imageBuffer = Buffer.from('data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAMCAgMCAgMDAwMEAwMEBQgFBQQEBQoHBwYIDAoMDAsKCwsNDhIQDQ4RDgsLEBYQERMUFRUVDA8XGBYUGBIUFRT/2wBDAQMEBAUEBQkFBQkUDQsNFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBT/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=', 'base64');
        fs.writeFileSync(testImagePath, imageBuffer);
      }
      
      const response = await request(app)
        .post('/api/analyze-product')
        .attach('image', testImagePath)
        .expect(200);
      
      expect(response.body).to.have.property('success', true);
      expect(response.body).to.have.property('product');
      expect(response.body.product).to.have.property('name');
      expect(response.body.product).to.have.property('score');
      expect(response.body.product).to.have.property('ingredients');
      expect(response.body.product).to.have.property('nutrition');
    }).timeout(10000);

    it('TC-011: Should return error for missing image', async () => {
      const response = await request(app)
        .post('/api/analyze-product')
        .expect(400);
      
      expect(response.body).to.have.property('success', false);
      expect(response.body).to.have.property('error');
      expect(response.body.error).to.include('No image file uploaded');
    });

    it('TC-002: Should handle different types of image analysis', async () => {
      // Test with a different mock image
      const testImagePath = path.join(__dirname, '..', '..', 'tests', 'test-image2.jpg');
      
      // Create another mock image
      const imageBuffer = Buffer.from('data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAMCAgMCAgMDAwMEAwMEBQgFBQQEBQoHBwYIDAoMDAsKCwsNDhIQDQ4RDgsLEBYQERMUFRUVDA8XGBYUGBIUFRT/2wBDAQMEBAUEBQkFBQkUDQsNFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBT/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAf/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAABv/EABQRAQAAAAAAAAAAAAAAAAAAAAD/2gAMAwEAAhEDEQA/AJwADL//2Q==', 'base64');
      fs.writeFileSync(testImagePath, imageBuffer);
      
      const response = await request(app)
        .post('/api/analyze-product')
        .attach('image', testImagePath)
        .expect(200);
      
      expect(response.body).to.have.property('success', true);
      expect(response.body).to.have.property('product');
      
      // Verify the product has the expected structure
      expect(response.body.product).to.have.property('cvData');
      expect(response.body.product.cvData).to.have.property('objects');
      expect(response.body.product.cvData).to.have.property('text');
    }).timeout(10000);
  });

  describe('POST /api/chat', () => {
    it('TC-005: Should process chat message with product context', async () => {
      // Create a mock product data
      const mockProduct = {
        name: "ChocoFit Protein Bar",
        score: 72,
        ingredients: [
          { name: "Whey Protein Isolate", risk: "safe" },
          { name: "Sugar", risk: "caution" }
        ],
        nutrition: {
          calories: "210",
          sugar: "12g"
        }
      };
      
      const response = await request(app)
        .post('/api/chat')
        .send({
          product: mockProduct,
          query: "Is this keto-friendly?"
        })
        .expect(200);
      
      expect(response.body).to.have.property('success', true);
      expect(response.body).to.have.property('reply');
      expect(response.body.reply).to.be.a('string');
      expect(response.body.reply.length).to.be.greaterThan(0);
    });

    it('TC-007: Should handle chat message without product context', async () => {
      const response = await request(app)
        .post('/api/chat')
        .send({
          query: "Is sugar bad for health?"
        })
        .expect(400);
      
      expect(response.body).to.have.property('success', false);
      expect(response.body).to.have.property('error');
      expect(response.body.error).to.include('Product data is required');
    });

    it('TC-013: Should handle missing query', async () => {
      const response = await request(app)
        .post('/api/chat')
        .send({
          product: { name: "Test Product" }
        })
        .expect(400);
      
      expect(response.body).to.have.property('success', false);
      expect(response.body).to.have.property('error');
      expect(response.body.error).to.include('Query is required');
    });
  });
});