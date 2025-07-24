describe("Formulaire d'avis - Envoi d'un avis", () => {
  const login = () => {
    cy.visit("/#/login");
    cy.get('[data-cy="login-input-username"]').type("test2@test.fr");
    cy.get('[data-cy="login-input-password"]').type("testtest");
    cy.get('[data-cy="login-submit"]').click();
  };

  it("doit permettre de soumettre un avis avec note, titre et commentaire simples", () => {
    login();

    cy.intercept("GET", "**/products/**").as("getProducts");
    cy.visit("http://127.0.0.1:8080/#/");
    cy.wait("@getProducts");

    cy.contains("Avis").click();
    cy.url().should("include", "/reviews");

    cy.get('[data-cy="review-input-rating-images"] img').eq(3).click(); // 4 étoiles

    cy.get('[data-cy="review-input-title"]').type("test test");
    cy.get('[data-cy="review-input-comment"]').type("commentaire");

    cy.get('[data-cy="review-submit"]').click();

    // Intercepter le rechargement et forcer reload
    cy.intercept("GET", "**/reviews").as("getReviews");
    cy.reload();
    cy.wait("@getReviews");

    // Vérifier l'apparition du nouvel avis
    cy.get('[data-cy="review-detail"]')
      .should("contain", "test test")
      .and("contain", "commentaire");
  });
});
