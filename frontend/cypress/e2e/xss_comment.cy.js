describe("Sécurité – Injection XSS dans le formulaire d’avis", () => {
  const xssPayload = `<script>alert("XSS")</script>`;

  beforeEach(() => {
    // Connexion
    cy.visit("/#/login");
    cy.get('[data-cy="login-input-username"]').type("test2@test.fr");
    cy.get('[data-cy="login-input-password"]').type("testtest");
    cy.get('[data-cy="login-submit"]').click();
  });

  it("ne doit pas exécuter de script injecté dans le commentaire", () => {
    cy.on("window:alert", () => {
      throw new Error("Faille XSS détectée via le champ commentaire");
    });

    // Interception de la requête réseau pour s'assurer que la page a bien chargé
    cy.intercept("GET", "**/reviews").as("getReviews");

    // Visite la page d’accueil
    cy.visit("http://127.0.0.1:8080/#/");

    cy.contains("a", "Avis", { timeout: 10000 }).should("be.visible").click();

    // Attend le chargement des avis
    cy.wait("@getReviews");

    // Attendre que le formulaire soit visible
    cy.get('[data-cy="review-form"]', { timeout: 10000 }).should("be.visible");

    // Remplir les champs avec le script XSS
    cy.get('[data-cy="review-input-title"]').type("Test XSS");
    cy.get('[data-cy="review-input-comment"]').type(xssPayload);

    // Soumettre le formulaire
    cy.get('[data-cy="review-submit"]').click();

    // Vérifie que l’application reste stable (aucune alerte déclenchée)
    cy.get("body").should("exist");
  });
});
