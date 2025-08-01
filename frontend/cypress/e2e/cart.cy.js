// cypress/e2e/cart.cy.js
describe("Panier – scénarios essentiels", () => {
  it("accès aux produits depuis la page d'accueil et navigation vers le détail", () => {
    cy.login();

    cy.intercept("GET", "**/products").as("getProducts");

    cy.url().should("include", "/#/");

    cy.contains("button", "Voir les produits").should("be.visible").click();

    cy.url().should("include", "/#/products");

    cy.wait("@getProducts").its("response.statusCode").should("eq", 200);

    cy.get('[data-cy="product-link"]').should("have.length.greaterThan", 0);

    //boutton consulter
    cy.get('[data-cy="product-link"]').first().click();

    cy.url().should("match", /\/#\/products\/\d+/);

    cy.get('[data-cy="detail-product-name"]').should("be.visible");
    cy.get('[data-cy="detail-product-img"]').should("be.visible");

    cy.get('[data-cy="detail-product-form"]').should("exist");

    let stockInitial = 0;
    //le stock doit être > 1
    cy.get('[data-cy="detail-product-stock"]')
      .should("exist")
      .invoke("text")
      .should("match", /\d+/)
      .then((text) => {
        stockInitial = parseInt(text.match(/\d+/)[0]);
        expect(stockInitial).to.be.greaterThan(1);
      });

    cy.get('[data-cy="detail-product-quantity"]').clear().type("1").blur();

    //Vérification boutton activé
    cy.get('[data-cy="detail-product-add"]').should("not.be.disabled");

    cy.get('[data-cy="detail-product-add"]').click();

    cy.visit("/#/cart");

    cy.get('[data-cy="cart-line"]').should("have.length.at.least", 1);
  });

  it("désactive le bouton si la quantité saisie est invalide", () => {
    cy.login();

    cy.intercept("GET", "**/products").as("getProducts");

    cy.url().should("include", "/#/");
    cy.contains("button", "Voir les produits").should("be.visible").click();
    cy.url().should("include", "/#/products");

    cy.wait("@getProducts").its("response.statusCode").should("eq", 200);
    cy.get('[data-cy="product-link"]').should("have.length.greaterThan", 0);

    cy.get('[data-cy="product-link"]').first().click();
    cy.url().should("match", /\/#\/products\/\d+/);
    cy.get('[data-cy="detail-product-name"]').should("be.visible");
    cy.get('[data-cy="detail-product-img"]').should("be.visible");
    cy.get('[data-cy="detail-product-form"]').should("exist");

    const inputSelector = '[data-cy="detail-product-quantity"]';
    const buttonSelector = '[data-cy="detail-product-add"]';

    cy.get(inputSelector).clear().type("-1").blur();
    cy.get(buttonSelector).should("be.disabled");
  });

  it("valide les limites de quantité (min, max)", () => {
    cy.login();

    cy.intercept("GET", "**/products").as("getProducts");

    cy.contains("button", "Voir les produits").click();
    cy.wait("@getProducts");

    cy.get('[data-cy="product-link"]').first().click();
    cy.url().should("match", /\/#\/products\/\d+$/);

    const inputSelector = '[data-cy="detail-product-quantity"]';
    const buttonSelector = '[data-cy="detail-product-add"]';

    // Cas limite autorisé : 20
    cy.get(inputSelector).clear().type("20").blur();
    cy.get(buttonSelector).should("not.be.disabled");

    // Cas refusé : 21 = TEST KO
    cy.get(inputSelector).clear().type("21").blur();
    cy.get(buttonSelector).should("be.disabled");
  });

  it("ajout au panier et décrément du stock vérifié", () => {
    cy.login();

    cy.intercept("GET", "**/products").as("getProducts");
    cy.intercept("GET", "**/products/*").as("getProduct");
    cy.intercept("PUT", "**/orders/add").as("addToCart");

    cy.contains("button", "Voir les produits").click();
    cy.wait("@getProducts");

    cy.get('[data-cy="product-link"]')
      .filter('[ng-reflect-router-link="/products,10"]')
      .should("be.visible")
      .click();
    cy.wait("@getProduct");

    cy.url().should("match", /\/#\/products\/10$/);

    cy.get('[data-cy="detail-product-stock"]')
      .should("be.visible")
      .should(($el) => {
        //vérifie que le contenu text contien au moins un chiffre
        expect($el.text()).to.match(/\d+/);
      })
      .invoke("text")
      .then((txtBefore) => {
        //utilise match pour extraire le nombre trouvé
        const match = txtBefore.match(/\d+/);
        if (!match) throw new Error("Aucun nombre trouvé dans : " + txtBefore);
        const nbBefore = parseInt(match[0], 10);
        expect(nbBefore, "stock avant valide").to.be.greaterThan(0);

        cy.get('[data-cy="detail-product-quantity"]')
          .should("be.visible")
          .clear()
          .type("1");

        cy.get("#add-to-cart button").should("be.visible").click();

        cy.wait("@addToCart").its("response.statusCode").should("eq", 200);
        cy.url().should("include", "/#/cart");
        cy.get('[data-cy="cart-line"]').should("exist");

        //  Retour produit
        cy.visit("http://127.0.0.1:8080/#/products/10");
        cy.wait("@getProduct");

        cy.get('[data-cy="detail-product-stock"]')
          .should("be.visible")
          .should(($el) => {
            expect($el.text()).to.match(/\d+/);
          })
          .invoke("text")
          .then((txtAfter) => {
            const matchAfter = txtAfter.match(/\d+/);
            if (!matchAfter)
              throw new Error("Aucun nombre trouvé dans : " + txtAfter);
            const nbAfter = parseInt(matchAfter[0], 10);
            expect(nbAfter, "stock décrémenté").to.equal(nbBefore - 1);
          });
      });
  });
});
