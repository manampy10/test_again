describe("Sécurité XSS – Injection dans le commentaire", () => {
  it("ne doit pas exécuter ni afficher le script injecté", () => {
    // Intercepts si besoin
    cy.intercept("GET", "**/products/**").as("getProducts");

    cy.login();
    cy.visit("http://127.0.0.1:8080/#/");
    cy.wait("@getProducts");

    // Navigation vers les avis
    cy.get('[data-cy="nav-link-reviews"]').should("be.visible").click();
    cy.url().should("include", "/reviews");

    cy.get('[data-cy="review-form"]').should("be.visible");

    cy.get('[data-cy="review-input-rating-images"] img')
      .should("have.length", 5)
      .eq(3)
      .click();

    cy.get('[data-cy="review-input-title"]').type("test XSS");
    cy.get('[data-cy="review-input-comment"]').type(
      "<script>alert(1)</script>"
    );
    cy.get('[data-cy="review-submit"]').click();

    cy.get('[data-cy="review-form"]').should("be.visible");
    cy.reload();

    // Vérification du commentaire
    cy.get('[data-cy="review-detail"]').then(($elements) => {
      const matching = [...$elements].some((el) =>
        el.innerText.includes("test XSS")
      );
      expect(matching, "Avis 'test XSS' trouvé dans la liste").to.be.true;

      const hasScriptTag = [...$elements].some((el) =>
        el.innerText.includes("<script>")
      );
      const hasAlert = [...$elements].some((el) =>
        el.innerText.includes("alert(1)")
      );

      expect(hasScriptTag, "Pas de balise <script>").to.be.false;
      expect(hasAlert, "Pas de alert(1)").to.be.false;
    });
  });
});
