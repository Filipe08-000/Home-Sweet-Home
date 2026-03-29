describe('Fluxos de Autenticação e Cadastro', () => {

  const baseUrl = 'https://filipe08-000.github.io/Home-Sweet-Home'

  it('Deve mostrar erro ao tentar login com senha inválida', () => {
    cy.visit(`${baseUrl}/login.html`)

    // O ideal é usar os IDs, assim como você fez no login.cy.js
    cy.get('#email').type('teste@email.com')
    cy.get('#senha').type('senhaerrada')
    cy.contains('Entrar').click()

    cy.contains('Erro: Email ou senha incorretos.') // Substitua pelo texto exato que aparece na tela
  })

  it('Deve fazer fazer um acadastro', () => {
       const email = `teste@email.com`
       const senha = '123456'
    cy.visit(`${baseUrl}/index.html`)
    cy.contains('Entrar').click()
    cy.contains('Cadastre-se').click()
    cy.get('input').eq(0).type('Teste Usuario')
    cy.get('input').eq(1).type(email)
    cy.get('input').eq(2).type(senha)
    cy.contains('Cadastrar').click()
  })

  it('Deve fazer login com sucesso usando usuário existente', () => {
    cy.visit(`${baseUrl}/index.html`)
    cy.contains('Entrar').click()
    cy.get('#email').type('teste@email.com')
    cy.get('#senha').type('123456')
    cy.contains('Entrar').click()
    cy.wait(3000)
    cy.contains('Sair')
  })

  it('Deve realizar o fluxo completo de cadastro e login com sucesso', () => {
    const email = `teste${Date.now()}@email.com`
    const senha = '123456'

    cy.intercept('POST', '**/auth/v1/signup').as('cadastro')
    cy.visit(`${baseUrl}/index.html`)

    cy.contains('Entrar').click()
    cy.contains('Cadastre-se').click()

    // Dica de melhoria: Coloque IDs nesses inputs no seu HTML (ex: id="nome_cadastro")
    // Usar eq(0), eq(1) é frágil, pois se a ordem mudar na tela, o teste quebra.
    cy.get('input').eq(0).type('Teste Usuario')
    cy.get('input').eq(1).type(email)
    cy.get('input').eq(2).type(senha)
    cy.contains('Cadastrar').click()

    cy.wait('@cadastro')

    cy.visit(`${baseUrl}/login.html`)
    cy.get('#email').type(email)
    cy.get('#senha').type(senha)
    cy.contains('Entrar').click()

    cy.contains('Home Sweet Home')
  })
})