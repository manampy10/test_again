// cypress/e2e/cart.cy.js
describe("Panier – scénarios essentiels", () => {
  const login = () => {
    cy.visit("/#/login");
    cy.get('[data-cy="login-input-username"]').type("test2@test.fr");
    cy.get('[data-cy="login-input-password"]').type("testtest");
    cy.get('[data-cy="login-submit"]').click();
  };

  it("Clique sur le bouton Produits et affiche tous les produits", () => {
    // Connexion (si login() est défini)
    login();

    // Intercepte l'appel à l'API des produits
    cy.intercept("GET", "**/products").as("getProducts");

    // Clique sur le bouton "Voir les produits"
    cy.contains("button", "Voir les produits").click();

    // Vérifie que l’URL contient "/products"
    cy.url().should("include", "/#/products");

    // Attend la réponse de l’API
    cy.wait("@getProducts").its("response.statusCode").should("eq", 200);

    // Vérifie que les produits sont bien affichés
    cy.get('[data-cy="product-link"]').should("have.length.greaterThan", 0);

    // Clic sur le bouton "Consulter" du premier produit
    cy.get('[data-cy="product-link"]').first().click();

    // Vérifie qu'on est bien redirigé vers la page du produit
    cy.url().should("include", "/#/product");
  });
});
