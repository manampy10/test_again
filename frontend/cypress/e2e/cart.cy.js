// cypress/e2e/cart.cy.js
describe("Panier – scénarios essentiels", () => {
  const login = () => {
    cy.visit("/#/login");
    cy.get('[data-cy="login-input-username"]').type("test2@test.fr");
    cy.get('[data-cy="login-input-password"]').type("testtest");
    cy.get('[data-cy="login-submit"]').click();
  };

  it("accès aux produits depuis la page d'accueil et navigation vers le détail", () => {
    // 1. Connexion utilisateur (si nécessaire)
    login();

    // 2. Intercepter l'appel à l'API produits
    cy.intercept("GET", "**/products").as("getProducts");

    // 3. Je suis sur la page d’accueil
    cy.url().should("include", "/#/");

    // 4. Je clique sur le bouton "Voir les produits"
    cy.contains("button", "Voir les produits").should("be.visible").click();

    // 5. Je suis redirigé vers /#/products
    cy.url().should("include", "/#/products");

    // 6. J’attends que les produits soient chargés
    cy.wait("@getProducts").its("response.statusCode").should("eq", 200);

    // 7. Je vérifie qu’au moins un bouton "Consulter" est visible
    cy.get('[data-cy="product-link"]').should("have.length.greaterThan", 0);

    // 8. Je clique sur le bouton "Consulter" du premier produit
    cy.get('[data-cy="product-link"]').first().click();

    // 9. Je suis redirigé vers /#/products/:id
    cy.url().should("match", /\/#\/products\/\d+/);

    // 10. Je vérifie que le nom et l’image du produit sont affichés
    cy.get('[data-cy="detail-product-name"]').should("be.visible");
    cy.get('[data-cy="detail-product-img"]').should("be.visible");

    // 11. Je vérifie que le formulaire (ajouter au panier) est présent
    cy.get('[data-cy="detail-product-form"]').should("exist");
  });

  it("accès aux produits depuis la page d'accueil et navigation vers le détail", () => {
    // Connexion utilisateur
    login();

    // Interception de l'API produits
    cy.intercept("GET", "**/products").as("getProducts");

    // Page d'accueil → clic bouton produits
    cy.url().should("include", "/#/");
    cy.contains("button", "Voir les produits").should("be.visible").click();
    cy.url().should("include", "/#/products");

    // Attente des données produits
    cy.wait("@getProducts").its("response.statusCode").should("eq", 200);
    cy.get('[data-cy="product-link"]').should("have.length.greaterThan", 0);

    // Détail produit
    cy.get('[data-cy="product-link"]').first().click();
    cy.url().should("match", /\/#\/products\/\d+/);
    cy.get('[data-cy="detail-product-name"]').should("be.visible");
    cy.get('[data-cy="detail-product-img"]').should("be.visible");
    cy.get('[data-cy="detail-product-form"]').should("exist");

    const inputSelector = '[data-cy="detail-product-quantity"]';
    const buttonSelector = '[data-cy="detail-product-add"]';

    // ➤ Cas invalide : -1 → bouton désactivé
    cy.get(inputSelector).clear().type("-1").blur();
    cy.get(buttonSelector).should("be.disabled");

    // ➤ Cas valide : 1 → bouton activé
    cy.get(inputSelector).clear().type("1").blur();
    cy.get(buttonSelector).should("not.be.disabled");
  });
});
