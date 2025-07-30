describe("Test XSS sur le formulaire d'adresse", () => {
  const payload = `<script>alert("XSS")</script>`;

  beforeEach(() => {
    cy.login();
    cy.visit("/#/cart");
  });

  it("ne doit pas exécuter de script injecté dans les champs adresse ou ville", () => {
    cy.on("window:alert", () => {
      throw new Error("Faille XSS détectée dans les champs adresse ou ville");
    });

    cy.get('[data-cy="cart-input-address"]')
      .should("be.visible")
      .clear()
      .type(payload);

    cy.get('[data-cy="cart-input-zipcode"]')
      .should("be.visible")
      .clear()
      .type("75001");

    cy.get('[data-cy="cart-input-city"]')
      .should("be.visible")
      .clear()
      .type(payload);

    cy.get('[data-cy="cart-submit"]').click();

    cy.get("body").should("exist");
  });
});
