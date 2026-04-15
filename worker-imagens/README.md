# worker-imagens

Worker responsável por consumir a fila `jobs_imagem`, processar as imagens em segundo plano e atualizar a tabela `imoveis` com o status e os caminhos das versões derivadas.

## Requisitos
- Node.js 20+
- Projeto Supabase configurado
- Arquivo `.env` na pasta `worker-imagens`

## Variáveis do `.env`
```env
SUPABASE_URL=https://SEU-PROJETO.supabase.co
SUPABASE_SERVICE_ROLE_KEY=SUA_SERVICE_ROLE_KEY
```

## Instalação
```bash
npm install
```

## Execução
Rodar com 1, 2 ou 4 workers:

```bash
node index.js 1
node index.js 2
node index.js 4
```

## Fluxo
1. O frontend cadastra o imóvel.
2. A imagem original é enviada ao bucket `imoveis-imagens`.
3. Um job é criado na tabela `jobs_imagem`.
4. O worker consome o job pendente.
5. O processamento gera versões da imagem.
6. O worker atualiza `imoveis` e conclui o job.

## Observações
- Não subir o arquivo `.env` para o GitHub.
- Não subir `node_modules`.
- Para benchmark, criar um lote de jobs antes de executar o worker.
