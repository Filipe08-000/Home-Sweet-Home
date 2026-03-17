# 🏡 Home-Sweet-Home

Uma plataforma digital de intermediação de locação de imóveis focada em estadias por temporada, operando sob um modelo de negócio semelhante ao Airbnb. 

🔗 **Acesse a aplicação online:** [Home-Sweet-Home no GitHub Pages](https://filipe08-000.github.io/Home-Sweet-Home/)

## 🚀 O Projeto
O objetivo principal é atuar como um marketplace eficiente, conectando locadores e locatários. O projeto nasceu com uma arquitetura monolítica local e hoje evoluiu para uma infraestrutura em nuvem, eliminando a dependência do XAMPP e utilizando banco de dados como serviço (BaaS).

## 🛠️ Tecnologias Utilizadas
* **Frontend:** HTML, CSS, JavaScript (Hospedado via GitHub Pages)
* **Backend:** PHP (API RESTful em desenvolvimento)
* **Banco de Dados:** PostgreSQL via [Supabase](https://supabase.com/)
* **Controle de Concorrência:** Transações ACID com `SELECT FOR UPDATE` para evitar condições de corrida durante as reservas.

## ✨ Funcionalidades Atuais (Core)
- [x] Autenticação e Gestão de Usuários (Locadores e Locatários).
- [x] CRUD de Imóveis (Cadastro, listagem, edição e exclusão).
- [x] Sistema de busca e visualização do catálogo.
- [x] Motor de reservas com bloqueio de concorrência no banco de dados.

## ⚙️ Como executar localmente
Como o projeto migrou para a nuvem, a execução está muito mais simples:
1. Faça o clone deste repositório: `git clone https://github.com/Filipe08-000/Home-Sweet-Home.git`
2. Abra o arquivo `index.html` em seu navegador ou utilize a extensão Live Server do VSCode.
3. *Nota: As credenciais de acesso ao Supabase são gerenciadas no backend e não exigem configuração de banco de dados local.*

## 📈 Próximos Passos (Roadmap)
* Finalizar a documentação completa da API REST.
* Inclusão do Diagrama de Entidade-Relacionamento (DER).
* Implementação de testes automatizados de estresse e concorrência.
