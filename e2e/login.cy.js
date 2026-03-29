describe('Login', () => {
  it('Faz login', () => {
    cy.visit('https://filipe08-000.github.io/Home-Sweet-Home/login.html')

    cy.get('#email').type('teste@email.com')
    cy.get('#senha').type('123456')
    cy.get('button').click()

    cy.contains('Olá, Teste Usuario')
  })
})