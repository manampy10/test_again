describe("Panier – scénarios essentiels", () => {
  beforeEach(() => {
    cy.visit("/#/login");
    cy.get('[data-cy="login-input-username"]').type("test2@test.fr");
    cy.get('[data-cy="login-input-password"]').type("testtest");
    cy.get('[data-cy="login-submit"]').click();
  });

  it("affiche les produits et navigue vers le détail", () => {
    cy.intercept("GET", "**/products").as("getProducts");

    cy.url().should("include", "/#/");
    cy.contains("button", "Voir les produits").should("be.visible").click();

    cy.url().should("include", "/#/products");
    cy.wait("@getProducts").its("response.statusCode").should("eq", 200);

    cy.get('[data-cy="product-link"]')
      .should("have.length.greaterThan", 0)
      .first()
      .click();
    cy.url().should("match", /\/#\/products\/\d+/);

    cy.get('[data-cy="detail-product-name"]').should("be.visible");
    cy.get('[data-cy="detail-product-img"]').should("be.visible");
    cy.get('[data-cy="detail-product-form"]').should("exist");

    cy.get('[data-cy="detail-product-stock"]')
      .should("exist")
      .invoke("text")
      .should("match", /\d+/)
      .then((text) => {
        const stockInitial = parseInt(text.match(/\d+/)[0]);
        expect(stockInitial).to.be.greaterThan(1);
      });

    cy.get('[data-cy="detail-product-quantity"]').clear().type("1").blur();
    cy.get('[data-cy="detail-product-add"]').should("not.be.disabled").click();

    cy.url().should("include", "/#/cart");
    cy.get('[data-cy="cart-line"]').should("have.length.at.least", 1);
  });

  it("désactive le bouton pour quantité invalide", () => {
    cy.intercept("GET", "**/products").as("getProducts");

    cy.url().should("include", "/#/");
    cy.contains("button", "Voir les produits").should("be.visible").click();
    cy.url().should("include", "/#/products");

    cy.wait("@getProducts").its("response.statusCode").should("eq", 200);
    cy.get('[data-cy="product-link"]')
      .should("have.length.greaterThan", 0)
      .first()
      .click();

    cy.get('[data-cy="detail-product-name"]').should("be.visible");
    cy.get('[data-cy="detail-product-img"]').should("be.visible");

    const inputSelector = '[data-cy="detail-product-quantity"]';
    const buttonSelector = '[data-cy="detail-product-add"]';

    cy.get(inputSelector).clear().type("-1").blur();
    cy.get(buttonSelector).should("be.disabled");

    cy.get(inputSelector).clear().type("1").blur();
    cy.get(buttonSelector).should("not.be.disabled");
  });

  it("valide les limites de quantité (1-20)", () => {
    cy.intercept("GET", "**/products").as("getProducts");

    cy.contains("button", "Voir les produits").click();
    cy.wait("@getProducts");
    cy.get('[data-cy="product-link"]').first().click();
    cy.url().should("match", /\/#\/products\/\d+$/);

    const inputSelector = '[data-cy="detail-product-quantity"]';
    const buttonSelector = '[data-cy="detail-product-add"]';

    cy.get(inputSelector).clear().type("20").blur();
    cy.get(buttonSelector).should("not.be.disabled");

    cy.get(inputSelector).clear().type("21").blur();
    cy.get(buttonSelector).should("be.disabled");
  });

  it("ajoute au panier et vérifie le décrément de stock", () => {
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
      .invoke("text")
      .should("match", /\d+/)
      .then((txtBefore) => {
        const nbBefore = parseInt(txtBefore.match(/\d+/)[0]);
        expect(nbBefore).to.be.greaterThan(0);

        cy.get('[data-cy="detail-product-quantity"]')
          .should("be.visible")
          .clear()
          .type("1");

        cy.get("#add-to-cart button").should("be.visible").click();

        cy.wait("@addToCart").its("response.statusCode").should("eq", 200);
        cy.url().should("include", "/#/cart");
        cy.get('[data-cy="cart-line"]').should("exist");

        // Retour produit
        cy.visit("http://127.0.0.1:8080/#/products/10");
        cy.wait("@getProduct");

        cy.get('[data-cy="detail-product-stock"]')
          .should("be.visible")
          .invoke("text")
          .should("match", /\d+/)
          .then((txtAfter) => {
            const nbAfter = parseInt(txtAfter.match(/\d+/)[0]);
            expect(nbAfter, "stock décrémenté").to.equal(nbBefore - 1);
          });
      });
  });
});
