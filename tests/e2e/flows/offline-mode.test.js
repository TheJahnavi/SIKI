// Cypress E2E Tests for Offline Mode in SIKI Application

describe('Offline Mode', () => {
  beforeEach(() => {
    cy.visit('http://localhost:3000');
  });

  it('shows offline notification when network is unavailable', () => {
    // Simulate offline mode
    cy.window().then((win) => {
      win.dispatchEvent(new Event('offline'));
    });
    
    // Verify offline notification is displayed
    cy.get('.offline-notification').should('be.visible');
    cy.get('.offline-notification').should('contain.text', 'You are currently offline');
  });

  it('allows scanning in offline mode using cached data', () => {
    // First, simulate a successful scan to cache data
    cy.intercept('POST', '/api/analyze-product', {
      statusCode: 200,
      body: {
        success: true,
        product: {
          name: 'Cached Product',
          ingredients: [{ name: 'Water', risk: 'safe' }, { name: 'Sugar', risk: 'caution' }],
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
    
    // Simulate image upload and analysis
    cy.get('#gallery-button').click();
    cy.get('#analyze-button').click();
    cy.wait('@analyzeProduct');
    
    // Now simulate offline mode
    cy.window().then((win) => {
      win.dispatchEvent(new Event('offline'));
    });
    
    // Try to scan another product while offline
    cy.get('#gallery-button').click();
    
    // In offline mode, the app should either:
    // 1. Use cached analysis if available
    // 2. Show appropriate offline message
    cy.get('.offline-message').should('be.visible');
  });

  it('queues actions for sync when back online', () => {
    // Simulate offline mode
    cy.window().then((win) => {
      win.dispatchEvent(new Event('offline'));
    });
    
    // Try to save a preference while offline
    cy.get('#preferences-button').click();
    cy.get('.save-button').click();
    
    // Verify action is queued
    cy.get('.sync-queue').should('exist');
    
    // Simulate coming back online
    cy.window().then((win) => {
      win.dispatchEvent(new Event('online'));
    });
    
    // Verify queued actions are synced
    cy.get('.sync-queue').should('not.exist');
  });

  it('works with PWA features in offline mode', () => {
    // Verify PWA install prompt can be triggered
    cy.window().then((win) => {
      // Mock beforeinstallprompt event
      const promptEvent = new Event('beforeinstallprompt');
      win.dispatchEvent(promptEvent);
    });
    
    // Verify install button is visible
    cy.get('#install-pwa').should('be.visible');
    
    // Simulate offline mode
    cy.window().then((win) => {
      win.dispatchEvent(new Event('offline'));
    });
    
    // Verify app still functions with basic features
    cy.get('#home-page').should('be.visible');
    cy.get('#theme-toggle').should('be.visible');
  });
});