describe("Sécurité – Injection XSS dans le formulaire d’avis", () => {
  it("ne doit pas exécuter de script malveillant", () => {
    const xssPayload = `<script>alert("XSS")</script>`;

    cy.visit("http://localhost:8080");
    cy.get('[data-cy="nav-link-reviews"]').click();

    cy.on("window:alert", () => {
      throw new Error("⚠️ Script exécuté ! Faille XSS");
    });

    cy.get('[data-cy="review-input-title"]').type("test");
    cy.get('[data-cy="review-input-comment"]').type(xssPayload);

    cy.get('[data-cy="review-submit"]').click();

    // Soit affiché brut
    cy.contains('<script>alert("XSS")</script>').should("exist");

    // Ou encodé
    // cy.contains('&lt;script&gt;alert("XSS")&lt;/script&gt;').should("exist");
  });
});
