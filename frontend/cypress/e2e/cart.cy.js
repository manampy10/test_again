// cypress/e2e/cart.cy.js
describe("Panier – scénarios essentiels", () => {
  const login = () => {
    cy.visit("/#/login");
    cy.get('[data-cy="login-input-username"]').type("test2@test.fr");
    cy.get('[data-cy="login-input-password"]').type("testtest");
    cy.get('[data-cy="login-submit"]').click();
  };

  const openFirstProduct = () => {
    cy.contains("button", "Voir les produits").click();
    cy.url().should("include", "/#/products");
    cy.get('[data-cy="product-link"]', { timeout: 10_000 }).first().click();
    cy.location("hash").should("match", /#\/products/);
  };

  const addToCartAndOpenCart = () => {
    //Cible le bouton “Ajouter au panier”
    cy.get('[data-cy="detail-product-add"]').click();
    cy.intercept("GET", "**/orders").as("orders");
    cy.contains("Mon panier").click();
    //Attend que l’appel réseau GET /orders soit terminé.
    cy.wait("@orders");
    cy.location("hash").should("include", "/cart");
  };

  const fillAddress = () => {
    cy.get('[data-cy="cart-input-address"]').type("123 rue des tests");
    cy.get('[data-cy="cart-input-zipcode"]').type("75001");
    cy.get('[data-cy="cart-input-city"]').type("Paris");
  };

  beforeEach(() => {
    login();
    openFirstProduct();
  });

  it("affiche la ligne ajoutée dans le panier", () => {
    addToCartAndOpenCart();
    //Je récupère l’élément qui représente une ligne du panier, en lui laissant jusqu’à 10 secondes pour apparaître. »
    cy.get('[data-cy="cart-line"]', { timeout: 10_000 })
      //’élément est bien présent dans le DOM.
      .should("exist")
      .and("be.visible");
  });

  it("calcule correctement les totaux de chaque ligne", () => {
    addToCartAndOpenCart();
    // On traite chaque ligne une par une
    cy.get('[data-cy="cart-line"]', { timeout: 10_000 }).each(($line) => {
      cy.wrap($line).within(() => {
        cy.get('[data-cy="cart-line-quantity"]')
          .invoke("val")
          .then((q) => {
            const qty = Number(q);
            cy.get('[data-cy="cart-line-total"]')
              .invoke("text")
              .then((txt) => {
                const total = Number(
                  txt.replace(/[^\d,]/g, "").replace(",", ".")
                );
                expect(total / qty).to.be.greaterThan(0);
              });
          });
      });
    });
  });

  // stock doit être supérieur à 1 pour pouvoir être ajouté.
  
  it("valide la commande avec succès", () => {
    addToCartAndOpenCart();
    fillAddress();
    cy.get('[data-cy="cart-submit"]').click();
    cy.contains("h1", "Merci !").should("exist");
    cy.contains("Votre commande est bien validée").should("exist");
  });
});
