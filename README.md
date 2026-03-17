# 🏡 Home-Sweet-Home

Uma plataforma digital de intermediação de locação de imóveis focada em estadias por temporada, operando sob um modelo de negócio dinâmico (estilo Airbnb). 

🔗 **Acesso à Aplicação:** [Visite o Home-Sweet-Home no GitHub Pages](https://filipe08-000.github.io/Home-Sweet-Home/)

## 🚀 Arquitetura e Tecnologia
O projeto evoluiu de um monólito local para uma arquitetura **Serverless (Sem Servidor)** em nuvem, garantindo alta disponibilidade e eliminando a necessidade de configurações locais complexas.

* **Frontend:** HTML5, CSS3 (Bootstrap 5), JavaScript puro (ESModules).
* **Backend as a Service (BaaS):** [Supabase](https://supabase.com/)
* **Banco de Dados:** PostgreSQL (Hospedado na nuvem)
* **Storage:** Supabase Storage (para imagens dos imóveis)
* **Segurança e Concorrência:** Autenticação via Supabase Auth e controle nativo de *Overbooking* (condição de corrida) via Transações ACID e funções RPC no banco de dados (`SELECT FOR UPDATE`).

## ✨ Funcionalidades (Core)
- [x] Autenticação segura de usuários.
- [x] CRUD de imóveis com upload de imagens reais.
- [x] Motor de reservas com cálculo automático de diárias.
- [x] Painel de gestão exclusivo para Anfitriões e Hóspedes.
- [x] Chat em tempo real (WebSockets) entre locador e locatário.
- [x] Sistema de avaliações e notas das acomodações.

## ⚙️ Como executar localmente
A infraestrutura em nuvem simplificou o ambiente de desenvolvimento. Para testar o sistema:

1. Faça o clone deste repositório: `git clone https://github.com/Filipe08-000/Home-Sweet-Home.git`
2. Não é necessário instalar o XAMPP ou rodar scripts SQL, pois o banco de dados já está operando na nuvem.
3. Abra o arquivo `index.html` em qualquer navegador web moderno ou utilize a extensão *Live Server* do VSCode.

## 📚 Documentação
* Leia o nosso [Manual do Usuário](./MANUAL_DO_USUARIO.md) para entender como operar a plataforma.
