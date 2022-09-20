
describe('musira', () => {
  beforeEach(() => cy.visit('/'));

  it('should display welcome message', () => {
    cy.get('h1').contains('Prends part à la fête !');
  });
});
