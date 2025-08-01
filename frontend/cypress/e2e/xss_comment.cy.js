describe("Sécurité XSS – Injection dans le commentaire", () => {
  it("ne doit pas exécuter ni afficher le script injecté", () => {
    cy.on("window:alert", () => {
      throw new Error("Faille XSS détectée dans le champ commentaire");
    });

    cy.intercept("GET", "**/products/**").as("getProducts");

    cy.login();
    cy.visit("http://127.0.0.1:8080/#/");
    cy.wait("@getProducts");
    // boutton Avis
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
    //Bouton publié
    cy.get('[data-cy="review-submit"]').click();

    cy.get('[data-cy="review-form"]').should("be.visible");
    cy.reload();
    //récupère les avis affichés dans la page
    cy.get('[data-cy="review-detail"]').then(($elements) => {
      //récupérer le contenu html
      const htmlList = [...$elements].map((el) => el.innerHTML);

      //est-ce qu'au moins un avis contient une balise script
      const hasComment = htmlList.some((html) => html.includes("test XSS"));
      expect(hasComment, "Avis 'test XSS' trouvé dans la liste").to.be.true;

      const hasRealScriptTag = htmlList.some((html) =>
        html.includes("<script>")
      );
      expect(hasRealScriptTag, "Pas de balise <script>").to.be.true;

      const hasUnescapedAlert = htmlList.some((html) =>
        html.includes("alert(1)")
      );
      expect(hasUnescapedAlert, "Pas de alert(1)").to.be.true;
    });
  });
});
