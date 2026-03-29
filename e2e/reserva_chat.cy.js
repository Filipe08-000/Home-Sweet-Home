describe('Fluxo Completo: Cadastro, Login e Reserva', () => {
  const baseUrl = 'https://filipe08-000.github.io/Home-Sweet-Home';
  // Gera um e-mail único para evitar erro de "usuário já existe"
  const emailNovo = `teste${Date.now()}@cypress.com`;
  const senhaPadrao = '123456';

  it('Deve cadastrar um novo usuário, logar e realizar uma reserva com mensagem', () => {
    // --- PASSO 1: CADASTRO ---
    cy.visit(`${baseUrl}/index.html`);
    cy.contains('Entrar').click();
    cy.contains('Cadastre-se').click();

    // Preenche os campos de cadastro
    cy.get('input').eq(0).type('Teste Usuario');
    cy.get('input[type="email"]').type(emailNovo);
    cy.get('input[type="password"]').type(senhaPadrao);

    // Intercepta a chamada para garantir que o Cypress espere o banco responder
    cy.intercept('POST', '**/auth/v1/signup').as('apiCadastro');
    cy.contains('button', 'Cadastrar').click();
    cy.wait('@apiCadastro');

    // --- PASSO 2: LOGIN ---
    // Após cadastro, o sistema deve ir para a tela de login
    cy.url().should('include', 'login.html');
    cy.get('#email').type(emailNovo);
    cy.get('#senha').type(senhaPadrao);
    cy.contains('button', 'Entrar').click();

    // Valida o login: o botão "Sair" deve aparecer
    cy.contains('Sair', { timeout: 10000 }).should('be.visible');

    // --- PASSO 3: RESERVA ---
    cy.visit(`${baseUrl}/index.html`);
    cy.contains('Casa Massex', { timeout: 10000 }).should('be.visible');
    cy.contains('Ver Detalhes').click();

    // Espera o loader sumir para garantir que o JS carregou os preços
    cy.get('#loader', { timeout: 10000 }).should('have.class', 'd-none');

    // Preenchimento das datas (conforme seu detalhes.html atualizado)
    cy.get('#checkin').type('2026-05-10{enter}', { force: true });
    cy.get('body').click(0,0); // Garante que o calendário feche para não tampar o próximo campo
    cy.get('#checkout').type('2026-05-12{enter}', { force: true });

    // Clica no botão de reserva
    cy.get('#btn-reservar').should('not.be.disabled').click();

    // --- PASSO 4: CHAT ---
    // Verifica se redirecionou para as viagens
    cy.url({ timeout: 10000 }).should('include', 'minhas_viagens.html');
    cy.contains('Casa Massex').should('be.visible');
    
    // Clica no botão azul de Chat da reserva
    cy.contains('Chat').click();

    // Envia a mensagem no chat
    cy.get('input[placeholder="Digite sua mensagem..."]', { timeout: 10000 })
      .type('Fala chefe dono do palácio{enter}');
    
    // Validação final
    cy.contains('Fala chefe dono do palácio').should('be.visible');
  });
}); // Fechamento correto do describe