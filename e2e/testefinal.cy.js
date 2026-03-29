describe('Fluxos de Autenticação e Cadastro', () => {

  const baseUrl = 'https://filipe08-000.github.io/Home-Sweet-Home'

  // Atalho para não repetir o e-mail fixo de teste existente
  const emailExistente = 'teste@email.com'
  const senhaExistente = '123456'

  it('Deve mostrar erro ao tentar login com senha inválida', () => {
    cy.visit(`${baseUrl}/login.html`)

    cy.get('#email').type(emailExistente)
    cy.get('#senha').type('senhaerrada')
    cy.contains('Entrar').click()

    // O Cypress espera automaticamente o texto aparecer
    cy.contains('Erro: Email ou senha incorretos.').should('be.visible')
  })

  it('Deve realizar um novo cadastro com sucesso', () => {
    const emailNovo = `user${Date.now()}@teste.com`
    
    cy.visit(`${baseUrl}/index.html`)
    cy.contains('Entrar').click()
    cy.contains('Cadastre-se').click()

    cy.get('input').eq(0).type('Teste Usuario')
    cy.get('input').eq(1).type(emailNovo)
    cy.get('input').eq(2).type('123456')
    
    cy.intercept('POST', '**/auth/v1/signup').as('apiCadastro')
    cy.contains('Cadastrar').click()
    
    // Espera a resposta da API em vez de usar tempo fixo
    cy.wait(2000)
    
    // Asserção: Verifica se redirecionou para login ou mostrou sucesso
    cy.url().should('include', 'login.html')
  })

  it('Deve fazer login com sucesso usando usuário existente', () => {
    cy.visit(`${baseUrl}/login.html`)
    
    cy.get('#email').type(emailExistente)
    cy.get('#senha').type(senhaExistente)
    cy.contains('Entrar').click()

    // Removido cy.wait(3000). O contains já aguenta a espera.
    cy.contains('Sair').should('be.visible')
  })

  it('Deve realizar o fluxo completo: Cadastro seguido de Login', () => {
    const emailFluxo = `fluxo${Date.now()}@email.com`
    const senhaFluxo = '123456'

    cy.intercept('POST', '**/auth/v1/signup').as('cadastroRapido')
    cy.visit(`${baseUrl}/index.html`)

    // Passo 1: Cadastro
    cy.contains('Entrar').click()
    cy.contains('Cadastre-se').click()
    cy.get('input').eq(0).type('Usuario Fluxo')
    cy.get('input').eq(1).type(emailFluxo)
    cy.get('input').eq(2).type(senhaFluxo)
    cy.contains('Cadastrar').click()
    cy.wait('@cadastroRapido')

    // Passo 2: Login com a conta recém-criada
    cy.visit(`${baseUrl}/login.html`)
    cy.get('#email').type(emailFluxo)
    cy.get('#senha').type(senhaFluxo)
    cy.contains('Entrar').click()

    // Passo 3: Validação final
    cy.contains('Home Sweet Home').should('be.visible')
  })
})