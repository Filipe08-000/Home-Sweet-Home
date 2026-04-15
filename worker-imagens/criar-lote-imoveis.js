import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const quantidade = Number(process.argv[2] || 1);
const etiqueta = process.argv[3] || 'TESTE';

const DONO_ID = process.env.DONO_ID;
const IMAGEM_TESTE_CAMINHO = process.env.IMAGEM_TESTE_CAMINHO;
const BUCKET = 'imoveis-imagens';

if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Faltam SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY no .env');
  process.exit(1);
}

if (!DONO_ID) {
  console.error('Falta DONO_ID no .env');
  process.exit(1);
}

if (!IMAGEM_TESTE_CAMINHO) {
  console.error('Falta IMAGEM_TESTE_CAMINHO no .env');
  process.exit(1);
}

if (!Number.isInteger(quantidade) || quantidade <= 0) {
  console.error('Uso: node criar-lote-imoveis.js <quantidade> <etiqueta>');
  console.error('Exemplo: node criar-lote-imoveis.js 8 1W');
  process.exit(1);
}

function agora() {
  return new Date().toLocaleString('pt-BR');
}

async function uploadImagem(buffer, extensao, nomeArquivo) {
  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(nomeArquivo, buffer, {
      contentType: extensao === '.png' ? 'image/png' : 'image/jpeg',
      upsert: false
    });

  if (error) throw error;
}

async function criarImovelComJob(indice, buffer, extensao) {
  const sufixo = crypto.randomUUID();
  const nomeArquivo = `${Date.now()}_${etiqueta}_${indice}_${sufixo}${extensao}`;

  await uploadImagem(buffer, extensao, nomeArquivo);

  const titulo = `Imóvel ${etiqueta} ${String(indice).padStart(2, '0')}`;
  const cidade = 'Brasília';
  const descricao = `Imóvel de teste gerado automaticamente para benchmark (${etiqueta}).`;
  const precoDiaria = 150 + indice;

  const { data: imovel, error: imovelError } = await supabase
    .from('imoveis')
    .insert([{
      titulo,
      cidade,
      descricao,
      preco_diaria: precoDiaria,
      imagem: nomeArquivo,
      dono_id: DONO_ID,
      status_processamento_imagem: 'pendente'
    }])
    .select('id')
    .single();

  if (imovelError) throw imovelError;

  const { error: jobError } = await supabase
    .from('jobs_imagem')
    .insert([{
      imovel_id: imovel.id,
      caminho_original: nomeArquivo
    }]);

  if (jobError) throw jobError;

  return {
    imovelId: imovel.id,
    arquivo: nomeArquivo
  };
}

async function main() {
  console.log(`[${agora()}] Criando ${quantidade} imóvel(is) para a rodada "${etiqueta}"...`);

  const buffer = await fs.readFile(IMAGEM_TESTE_CAMINHO);
  const extensao = path.extname(IMAGEM_TESTE_CAMINHO).toLowerCase() || '.jpg';

  let sucesso = 0;
  let erro = 0;

  for (let i = 1; i <= quantidade; i++) {
    try {
      const resultado = await criarImovelComJob(i, buffer, extensao);
      sucesso++;
      console.log(
        `[${agora()}] OK | imóvel ${resultado.imovelId} criado | arquivo ${resultado.arquivo}`
      );
    } catch (err) {
      erro++;
      console.error(`[${agora()}] ERRO no item ${i}: ${err.message}`);
    }
  }

  console.log('\n=========== RESUMO ===========');
  console.log(`Rodada: ${etiqueta}`);
  console.log(`Quantidade solicitada: ${quantidade}`);
  console.log(`Criados com sucesso: ${sucesso}`);
  console.log(`Com erro: ${erro}`);
  console.log('==============================\n');
}

main().catch(err => {
  console.error('Erro fatal:', err.message);
  process.exit(1);
});