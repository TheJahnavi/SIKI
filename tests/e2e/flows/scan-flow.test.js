// Cypress E2E Tests for Scan Flow in SIKI Application

describe('Scan Flow', () => {
  beforeEach(() => {
    cy.visit('http://localhost:3000');
  });

  it('successfully scans a product and displays results', () => {
    // Verify we're on the home page
    cy.get('#home-page').should('be.visible');
    cy.get('.logo').should('contain.text', 'Scan It Know It');
    
    // Simulate image upload
    cy.get('#gallery-button').click();
    
    // Mock file upload (in a real test, you would attach a test image)
    cy.get('#file-input').should('exist');
    
    // Wait for analysis to complete (mocking API response)
    cy.intercept('POST', '/api/analyze-product', {
      statusCode: 200,
      body: {
        success: true,
        product: {
          name: 'Test Product',
          ingredients: [{ name: 'Water', risk: 'safe' }, { name: 'Sugar', risk: 'caution' }],
          nutrition: {
            calories: 120,
            fat: 0.5,
            carbs: 28,
            protein: 0
          },
          riskAnalysis: {
            overallRisk: 'low',
            flaggedIngredients: []
          },
          redditPosts: []
        }
      }
    }).as('analyzeProduct');
    
    // Submit the form (this would trigger the analysis)
    cy.get('#analyze-button').click();
    
    // Wait for the API call to complete
    cy.wait('@analyzeProduct');
    
    // Verify we're redirected to the results page
    cy.url().should('include', '/result');
    
    // Verify results are displayed
    cy.get('.product-name').should('contain.text', 'Test Product');
    cy.get('.ingredients-list').should('be.visible');
    cy.get('.nutrition-item').should('be.visible');
  });

  it('handles scan failure gracefully', () => {
    // Intercept the API call to simulate a failure
    cy.intercept('POST', '/api/analyze-product', {
      statusCode: 500,
      body: {
        success: false,
        error: 'Analysis failed'
      }
    }).as('failedAnalysis');
    
    // Simulate image upload
    cy.get('#gallery-button').click();
    
    // Submit the form
    cy.get('#analyze-button').click();
    
    // Wait for the API call to complete
    cy.wait('@failedAnalysis');
    
    // Verify error message is displayed
    cy.get('.error-message').should('be.visible');
    cy.get('.error-message').should('contain.text', 'Analysis failed');
  });
});