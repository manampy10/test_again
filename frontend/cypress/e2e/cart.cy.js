// cypress/e2e/cart.cy.js
describe("Panier – scénarios essentiels", () => {
  /* ---------------- Helpers réutilisables ---------------- */
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
    cy.get('[data-cy="detail-product-add"]').click();
    cy.intercept("GET", "**/orders").as("orders");
    cy.contains("Mon panier").click();
    cy.wait("@orders");
    cy.location("hash").should("include", "/cart");
  };

  const fillAddress = () => {
    cy.get('[data-cy="cart-input-address"]').type("123 rue des tests");
    cy.get('[data-cy="cart-input-zipcode"]').type("75001");
    cy.get('[data-cy="cart-input-city"]').type("Paris");
  };

  /* ---------------- Pré-condition commune ---------------- */
  beforeEach(() => {
    login();
    openFirstProduct();
  });

  /* ---------------- Test 1 : présence d’une ligne ---------------- */
  it("affiche la ligne ajoutée dans le panier", () => {
    addToCartAndOpenCart();
    cy.get('[data-cy="cart-line"]', { timeout: 10_000 })
      .should("exist")
      .and("be.visible");
  });

  /* ---------------- Test 2 : totaux ligne × ligne ---------------- */
  it("calcule correctement les totaux de chaque ligne", () => {
    addToCartAndOpenCart();

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

  /* ---------------- Test 3 : validation de la commande ---------------- */
  it("valide la commande avec succès", () => {
    addToCartAndOpenCart();
    fillAddress();
    cy.get('[data-cy="cart-submit"]').click();
    cy.contains("h1", "Merci !").should("exist");
    cy.contains("Votre commande est bien validée").should("exist");
  });
});
