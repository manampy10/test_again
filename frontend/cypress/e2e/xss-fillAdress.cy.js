const fillAddress = () => {
  const payload = `<script>alert("XSS")</script>`;

  cy.get('[data-cy="cart-input-address"]').clear().type(payload);
  cy.get('[data-cy="cart-input-zipcode"]').clear().type("75001");
  cy.get('[data-cy="cart-input-city"]').clear().type(payload);
};
