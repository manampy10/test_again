describe("Smoke tests", () => {
  beforeEach(() => {
    cy.visit("/#/login");
  });

  it("affiche les champs et bouton de connexion", () => {
    cy.get('[data-cy="login-input-username"]').should("exist");
    cy.get('[data-cy="login-input-password"]').should("exist");
    cy.get('[data-cy="login-submit"]').should("exist");
  });

  it("affiche le bouton 'Ajouter au panier' après avoir consulté un produit", () => {
    cy.get('[data-cy="login-input-username"]').type("test2@test.fr");
    cy.get('[data-cy="login-input-password"]').type("testtest");
    cy.get('[data-cy="login-submit"]').click();

    cy.url().should("include", "/#/");

    cy.get('[data-cy="product-home-link"]').first().click();

    cy.url().should("include", "/#/products/");

    cy.get('[data-cy="detail-product-add"]', { timeout: 5000 }).should("exist");
  });
});
