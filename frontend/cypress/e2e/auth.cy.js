describe("Connexion utilisateur", () => {
  const ROOT = `${Cypress.config().baseUrl}/#/`;

  it("affiche un message si les identifiants sont incorrects", () => {
    cy.visit("/#/login");

    cy.get('[data-cy="login-input-username"]').type("test2@test.fr");
    cy.get('[data-cy="login-input-password"]').type("mauvaismotdepasse");
    cy.get('[data-cy="login-submit"]').click();

    cy.get('[data-cy="login-errors"]')
      .should("be.visible")
      .and("contain", "Identifiants incorrects");
  });

  it("affiche un message si les identifiants sont corrects", () => {
    cy.visit("/#/login");

    cy.get('[data-cy="login-input-username"]').type("test2@test.fr");
    cy.get('[data-cy="login-input-password"]').type("testtest");
    cy.get('[data-cy="login-submit"]').click();

    cy.url().should("eq", ROOT);

    cy.get('[data-cy="nav-link-logout"]')
      .should("be.visible")
      .and("contain", "Déconnexion");
  });
});
