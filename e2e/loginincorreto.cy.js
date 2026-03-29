it('Login inválido', () => {

  cy.visit('https://filipe08-000.github.io/Home-Sweet-Home/login.html')

  cy.get('input').eq(0).type('teste@email.com')
  cy.get('input').eq(1).type('senhaerrada')
  cy.contains('Entrar').click()

  cy.contains('Erro') // ou mensagem que aparece

})