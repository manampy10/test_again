describe("Sécurité XSS – Injection dans le commentaire", () => {
  const login = () => {
    cy.visit("/#/login");
    cy.get('[data-cy="login-input-username"]').type("test2@test.fr");
    cy.get('[data-cy="login-input-password"]').type("testtest");
    cy.get('[data-cy="login-submit"]').click();
  };

  it("ne doit pas exécuter ni afficher le script injecté", () => {
    cy.on("window:alert", () => {
      throw new Error("❌ Faille XSS détectée : alert exécuté !");
    });

    login();

    cy.intercept("GET", "**/products/**").as("getProducts");
    cy.visit("http://127.0.0.1:8080/#/");
    cy.wait("@getProducts");

    cy.contains("Avis").click();
    cy.url().should("include", "/reviews");

    cy.get('[data-cy="review-input-rating-images"] img').eq(3).click();
    cy.get('[data-cy="review-input-title"]').type("test XSS");
    cy.get('[data-cy="review-input-comment"]').type(
      "<script>alert(1)</script>"
    );

    cy.intercept("GET", "**/reviews").as("getReviews");
    cy.get('[data-cy="review-submit"]').click();
    cy.wait(1000);
    cy.reload();
    cy.wait("@getReviews");

    cy.get('[data-cy="review-detail"]').then(($elements) => {
      const matching = [...$elements].some((el) =>
        el.innerText.includes("test XSS")
      );
      expect(matching, "Avis 'test XSS' trouvé dans la liste").to.be.true;

      const hasScript = [...$elements].some((el) =>
        el.innerText.includes("<script>")
      );
      const hasAlert = [...$elements].some((el) =>
        el.innerText.includes("alert(1)")
      );

      expect(hasScript, "Pas de balise <script>").to.be.false;
      expect(hasAlert, "Pas de alert(1)").to.be.false;
    });
  });
});
