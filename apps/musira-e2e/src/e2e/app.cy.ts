describe('musira', () => {
  beforeEach(() => cy.visit('/'));

  it('should display welcome message', () => {
    cy.get('h1').contains('Prends part à la fête !');
  });

  it('connect', () => {
    cy.get('input').type('quentin');
    cy.contains("C'est parti !").click();
    cy.get('h1').contains('Choisis ton emoji');
  });
});
