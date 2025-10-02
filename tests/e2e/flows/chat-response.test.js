// Cypress E2E Tests for Chat Response Flow in SIKI Application

describe('Chat Response Flow', () => {
  beforeEach(() => {
    // Visit the result page directly to test chat functionality
    cy.visit('http://localhost:3000');
    // Navigate to result page by mocking analysis
    cy.intercept('POST', '/api/analyze-product', {
      statusCode: 200,
      body: {
        success: true,
        product: {
          name: 'Test Product',
          ingredients: [{ name: 'Water', risk: 'safe' }],
          nutrition: {
            calories: 100,
            fat: 0,
            carbs: 25,
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
    
    cy.get('#gallery-button').click();
    cy.get('#analyze-button').click();
    cy.wait('@analyzeProduct');
  });

  it('successfully sends a message and receives a response', () => {
    // Intercept the chat API call
    cy.intercept('POST', '/api/chat', {
      statusCode: 200,
      body: {
        success: true,
        reply: 'This is a test response from the AI.'
      }
    }).as('chatResponse');
    
    // Type a message in the chat input
    cy.get('.outlined-text-field').type('Is this product healthy?');
    
    // Submit the chat message
    cy.get('.send-button').click();
    
    // Wait for the API call to complete
    cy.wait('@chatResponse');
    
    // Verify the response is displayed
    cy.get('.chat-bubble').should('contain.text', 'This is a test response from the AI.');
  });

  it('handles chat API failure gracefully', () => {
    // Intercept the chat API call to simulate failure
    cy.intercept('POST', '/api/chat', {
      statusCode: 500,
      body: {
        success: false,
        error: 'Chat service unavailable'
      }
    }).as('failedChat');
    
    // Type a message in the chat input
    cy.get('.outlined-text-field').type('Is this product healthy?');
    
    // Submit the chat message
    cy.get('.send-button').click();
    
    // Wait for the API call to complete
    cy.wait('@failedChat');
    
    // Verify error message is displayed
    cy.get('.chat-error').should('be.visible');
    cy.get('.chat-error').should('contain.text', 'Unable to get response');
  });

  it('maintains chat history across sessions', () => {
    // Intercept the chat API call
    cy.intercept('POST', '/api/chat', {
      statusCode: 200,
      body: {
        success: true,
        reply: 'This is a test response from the AI.'
      }
    }).as('chatResponse');
    
    // Type and send a message
    cy.get('.outlined-text-field').type('Is this product healthy?');
    cy.get('.send-button').click();
    cy.wait('@chatResponse');
    
    // Verify message and response are in the chat history
    cy.get('.chat-bubble').eq(0).should('contain.text', 'Hello! I\'m your product analysis assistant');
    cy.get('.chat-bubble').eq(1).should('contain.text', 'Is this product healthy?');
    cy.get('.chat-bubble').eq(2).should('contain.text', 'This is a test response from the AI.');
    
    // Refresh the page
    cy.reload();
    
    // Verify chat history persists
    cy.get('.chat-bubble').eq(0).should('contain.text', 'Hello! I\'m your product analysis assistant');
    cy.get('.chat-bubble').eq(1).should('contain.text', 'Is this product healthy?');
    cy.get('.chat-bubble').eq(2).should('contain.text', 'This is a test response from the AI.');
  });
});