describe("Test XSS sur le formulaire de connexion", () => {
  const payload = `<script>alert('XSS')</script>`;

  beforeEach(() => {
    cy.visit("/#/login");
  });

  it("ne doit pas exécuter de script injecté dans le champ email", () => {
    cy.on("window:alert", () => {
      throw new Error("Faille XSS détectée via le champ email");
    });

    cy.get('[data-cy="login-input-username"]').type(payload);
    cy.get('[data-cy="login-input-password"]').type("dummy");
    cy.get('[data-cy="login-submit"]').click();

    cy.get("body").should("exist"); // Vérifie simplement que rien ne plante visuellement
  });

  it("ne doit pas exécuter de script injecté dans le champ mot de passe", () => {
    cy.on("window:alert", () => {
      throw new Error("Faille XSS détectée via le champ mot de passe");
    });

    cy.get('[data-cy="login-input-username"]').type("test2@test.fr");
    cy.get('[data-cy="login-input-password"]').type(payload);
    cy.get('[data-cy="login-submit"]').click();

    cy.get("body").should("exist");
  });
});
