// Basic Cypress Test to verify the setup

describe('Basic Functionality', () => {
  it('loads the home page successfully', () => {
    cy.visit('http://localhost:3000');
    cy.get('#home-page').should('be.visible');
    cy.get('.logo').should('contain.text', 'Scan It Know It');
  });

  it('can toggle theme', () => {
    cy.visit('http://localhost:3000');
    cy.get('#theme-toggle').click();
    // Add assertions for theme change if needed
  });

  it('can open preferences', () => {
    cy.visit('http://localhost:3000');
    cy.get('#preferences-button').click();
    cy.get('#preferences-modal').should('have.class', 'active');
  });
});