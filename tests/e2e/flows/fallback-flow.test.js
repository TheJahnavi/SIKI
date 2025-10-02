// Cypress E2E Tests for Fallback Flow in SIKI Application

describe('Fallback Flow', () => {
  beforeEach(() => {
    cy.visit('http://localhost:3000');
  });

  it('shows fallback message when OCR fails', () => {
    // Intercept OCR API to simulate failure
    cy.intercept('POST', '/api/extract-text', {
      statusCode: 500,
      body: {
        success: false,
        error: 'OCR failed'
      }
    }).as('failedOCR');
    
    // Simulate image upload
    cy.get('#gallery-button').click();
    
    // Submit the form
    cy.get('#analyze-button').click();
    
    // Wait for the API call to complete
    cy.wait('@failedOCR');
    
    // Verify fallback message is displayed
    cy.get('.fallback-message').should('be.visible');
    cy.get('.fallback-message').should('contain.text', 'We couldn\'t extract text');
  });

  it('shows fallback when AI analysis fails but OCR succeeds', () => {
    // Intercept OCR API to simulate success
    cy.intercept('POST', '/api/extract-text', {
      statusCode: 200,
      body: {
        success: true,
        extractedText: 'Some product text'
      }
    }).as('successfulOCR');
    
    // Intercept AI analysis API to simulate failure
    cy.intercept('POST', '/api/analyze-text', {
      statusCode: 500,
      body: {
        success: false,
        error: 'AI analysis failed'
      }
    }).as('failedAI');
    
    // Simulate image upload
    cy.get('#gallery-button').click();
    
    // Submit the form
    cy.get('#analyze-button').click();
    
    // Wait for the API calls to complete
    cy.wait('@successfulOCR');
    cy.wait('@failedAI');
    
    // Verify fallback message is displayed
    cy.get('.fallback-message').should('be.visible');
    cy.get('.fallback-message').should('contain.text', 'We couldn\'t analyze this product');
  });

  it('allows manual input when automatic analysis fails', () => {
    // Intercept all APIs to simulate failures
    cy.intercept('POST', '/api/extract-text', {
      statusCode: 500,
      body: {
        success: false,
        error: 'OCR failed'
      }
    }).as('failedOCR');
    
    // Simulate image upload
    cy.get('#gallery-button').click();
    
    // Submit the form
    cy.get('#analyze-button').click();
    
    // Wait for the API call to complete
    cy.wait('@failedOCR');
    
    // Verify manual input option is available
    cy.get('.manual-input').should('be.visible');
    
    // Fill in manual input
    cy.get('#manual-product-name').type('Test Product');
    cy.get('#manual-ingredients').type('Water, Sugar, Salt');
    
    // Submit manual input
    cy.get('#submit-manual-input').click();
    
    // Verify we're redirected to results page with manual data
    cy.url().should('include', '/result');
    cy.get('.product-name').should('contain.text', 'Test Product');
  });
});