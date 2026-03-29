describe('Fluxo completo', () => {
  it('Cadastro + Login', () => {

    const email = `teste${Date.now()}@email.com`
    const senha = '123456'

    // Intercepta cadastro no Supabase
    cy.intercept('POST', '**/auth/v1/signup').as('cadastro')

    cy.visit('https://filipe08-000.github.io/Home-Sweet-Home/index.html')

    cy.contains('Entrar').click()
    cy.contains('Cadastre-se').click()

    // Cadastro
    cy.get('input').eq(0).type('Teste Usuario')
    cy.get('input').eq(1).type(email)
    cy.get('input').eq(2).type(senha)
    cy.contains('Cadastrar').click()

    // ESPERA o cadastro terminar
    cy.wait('@cadastro')

    // Vai para login
    cy.visit('https://filipe08-000.github.io/Home-Sweet-Home/login.html')

    // Login
    cy.get('input').eq(0).type(email)
    cy.get('input').eq(1).type(senha)
    cy.contains('Entrar').click()

    // Validação
    cy.contains('Home Sweet Home')

  })
})