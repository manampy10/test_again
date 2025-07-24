describe("Sécurité – Injection XSS dans le formulaire d’avis", () => {
  const xssPayload = `<script>alert("XSS")</script>`;

  beforeEach(() => {
    cy.visit("/#/login");
    cy.get('[data-cy="login-input-username"]').type("test2@test.fr");
    cy.get('[data-cy="login-input-password"]').type("testtest");
    cy.get('[data-cy="login-submit"]').click();
  });

  it("ne doit pas exécuter de script injecté dans le commentaire", () => {
    // Bloque toute alerte XSS déclenchée
    cy.on("window:alert", () => {
      throw new Error("Faille XSS détectée via le champ commentaire");
    });

    cy.intercept("GET", "**/products/**").as("getProducts");
    cy.visit("http://127.0.0.1:8080/#/");
    cy.wait("@getProducts");

    // Vérification que le lien "Avis" est bien là
    cy.get("body").then(($body) => {
      if ($body.find('[data-cy="nav-link-reviews"]').length === 0) {
        throw new Error("Lien 'Avis' non trouvé dans le DOM");
      }
    });

    // Interception des avis
    cy.intercept("GET", "**/reviews").as("getReviews");

    // Clic sur "Avis"
    cy.get('[data-cy="nav-link-reviews"]', { timeout: 10000 })
      .should("be.visible")
      .click();

    // Attend le chargement des avis
    cy.wait("@getReviews");

    // Vérifie la présence du formulaire
    cy.get('[data-cy="review-form"]').should("exist");

    // Injection XSS
    cy.get('[data-cy="review-input-title"]').type("Test XSS");
    cy.get('[data-cy="review-input-comment"]').type(xssPayload);

    // Envoi du formulaire
    cy.get('[data-cy="review-submit"]').click();

    cy.get("body").should("exist");
  });
});
