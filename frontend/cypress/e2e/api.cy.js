describe("Tests API", () => {
  const baseUrl = "http://localhost:8081";

  it("GET /orders sans authentification retourne 401 (au lieu de 403)", () => {
    cy.request({
      url: `${baseUrl}/orders`,
      failOnStatusCode: false,
    }).then((response) => {
      // On attend une erreur si l'utilisateur N'EST PAS connecté
      expect(response.status).to.eq(401); // devrait être 403 selon les règles métier
    });
  });

  it("GET /orders avec authentification retourne 200 et des données", () => {
    // Connexion pour obtenir un token
    cy.request("POST", `${baseUrl}/login`, {
      username: "test2@test.fr",
      password: "testtest",
    }).then((loginResponse) => {
      const token = loginResponse.body.token;

      // Accès à /orders avec le token d'authentification
      cy.request({
        method: "GET",
        url: `${baseUrl}/orders`,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body).to.have.property("orderLines");
      });
    });
  });

  it("GET /products retourne une liste de produits", () => {
    cy.request(`${baseUrl}/products`).then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body).to.be.an("array");
      expect(response.body.length).to.be.greaterThan(0);

      const firstProduct = response.body[0];
      expect(firstProduct).to.have.property("id");
      expect(firstProduct).to.have.property("name");
      expect(firstProduct).to.have.property("price");
    });
  });

  it("POST /login avec mauvais identifiants retourne 401", () => {
    cy.request({
      method: "POST",
      url: `${baseUrl}/login`,
      body: {
        username: "fake@test.fr",
        password: "wrongpass",
      },
      failOnStatusCode: false,
    }).then((response) => {
      expect(response.status).to.eq(401); // refusé : identifiants invalides
    });
  });

  it("POST /login avec bons identifiants retourne 200", () => {
    cy.request({
      method: "POST",
      url: `${baseUrl}/login`,
      body: {
        username: "test2@test.fr",
        password: "testtest",
      },
      failOnStatusCode: false,
    }).then((response) => {
      expect(response.status).to.eq(200);
    });
  });

  it("Ajout produit au panier via /orders/add (avec JWT et bon ID produit)", () => {
    cy.request({
      method: "POST",
      url: `${baseUrl}/login`,
      body: {
        username: "test2@test.fr",
        password: "testtest",
      },
      failOnStatusCode: false,
    }).then((loginResponse) => {
      const token = loginResponse.body.token;
      expect(token, "JWT attendu").to.exist;

      cy.request({
        method: "PUT",
        url: `${baseUrl}/orders/add`,
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: {
          product: 3, // utilise un ID produit valide
          quantity: 1,
        },
      }).then((response) => {
        expect(response.status).to.eq(200);
      });
    });
  });

  it("POST /reviews (ajout commentaire valide)", () => {
    cy.request({
      method: "POST",
      url: `${baseUrl}/login`,
      body: {
        username: "test2@test.fr",
        password: "testtest",
      },
      failOnStatusCode: false,
    }).then((loginResponse) => {
      const token = loginResponse.body.token;
      expect(token, "JWT attendu").to.exist;

      cy.request({
        method: "POST",
        url: `${baseUrl}/reviews`,
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: {
          title: "Excellent savon",
          comment: "Très bon produit, je recommande !",
          rating: 5,
        },
      }).then((response) => {
        expect(response.status).to.eq(200);
      });
    });
  });

  it("PUT /orders/{id}/change-quantity modifie la quantité d'un produit", () => {
    let token;
    let orderLineId;

    cy.request("POST", "http://localhost:8081/login", {
      username: "test2@test.fr",
      password: "testtest",
    }).then((loginRes) => {
      token = loginRes.body.token;

      cy.request({
        method: "PUT",
        url: "http://localhost:8081/orders/add",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: {
          product: 3,
          quantity: 1,
        },
      }).then(() => {
        cy.request({
          method: "GET",
          url: "http://localhost:8081/orders",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }).then((orderRes) => {
          const lines = orderRes.body.orderLines;
          expect(lines.length).to.be.greaterThan(0);
          orderLineId = lines[lines.length - 1].id;

          cy.request({
            method: "PUT",
            url: `http://localhost:8081/orders/${orderLineId}/change-quantity`,
            headers: {
              Authorization: `Bearer ${token}`,
            },
            body: {
              quantity: 2,
            },
          }).then((changeRes) => {
            expect(changeRes.status).to.eq(200);
          });
        });
      });
    });
  });

  it("DELETE /orders/{id}/delete supprime une ligne du panier", () => {
    let token;
    let orderLineId;

    cy.request("POST", "http://localhost:8081/login", {
      username: "test2@test.fr",
      password: "testtest",
    }).then((loginRes) => {
      token = loginRes.body.token;

      cy.request({
        method: "PUT",
        url: "http://localhost:8081/orders/add",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: {
          product: 3,
          quantity: 1,
        },
      }).then(() => {
        cy.request({
          method: "GET",
          url: "http://localhost:8081/orders",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }).then((orderRes) => {
          const lines = orderRes.body.orderLines;
          expect(lines.length).to.be.greaterThan(0);
          orderLineId = lines[lines.length - 1].id;

          cy.request({
            method: "DELETE",
            url: `http://localhost:8081/orders/${orderLineId}/delete`,
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }).then((deleteRes) => {
            expect(deleteRes.status).to.eq(200);
          });
        });
      });
    });
  });

  it("GET /reviews retourne la liste des avis", () => {
    cy.request("http://localhost:8081/reviews").then((res) => {
      expect(res.status).to.eq(200);
      expect(res.body).to.be.an("array");
    });
  });
});
