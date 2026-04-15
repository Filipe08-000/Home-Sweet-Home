import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import { Worker } from 'node:worker_threads';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Você vai rodar assim:
// node index.js 1
// node index.js 2
// node index.js 4
const WORKERS = Number(process.argv[2] || 1);

if (![1, 2, 4].includes(WORKERS)) {
  console.error('Uso: node index.js 1 | 2 | 4');
  process.exit(1);
}

let encerrar = false;
let ativosLocais = 0;

const stats = {
  workers: WORKERS,
  inicio: Date.now(),
  fim: null,
  totalSucesso: 0,
  totalErro: 0,
  porWorker: {}
};

for (let i = 1; i <= WORKERS; i++) {
  stats.porWorker[`W${i}`] = {
    sucesso: 0,
    erro: 0,
    jobs: []
  };
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function agora() {
  return new Date().toLocaleString('pt-BR');
}

function processarEmThread(payload) {
  return new Promise((resolve, reject) => {
    const worker = new Worker(new URL('./image-worker.js', import.meta.url), {
      workerData: payload
    });

    worker.on('message', resolve);
    worker.on('error', reject);
    worker.on('exit', code => {
      if (code !== 0) {
        reject(new Error(`Thread finalizada com código ${code}`));
      }
    });
  });
}

async function pegarJob() {
  const { data, error } = await supabase.rpc('pegar_proximo_job_imagem');
  if (error) throw error;
  return data;
}

async function contarJobsRestantes() {
  const { count, error } = await supabase
    .from('jobs_imagem')
    .select('id', { count: 'exact', head: true })
    .in('status', ['pendente', 'processando']);

  if (error) throw error;
  return count || 0;
}

async function marcarJobConcluido(jobId) {
  const { error } = await supabase
    .from('jobs_imagem')
    .update({
      status: 'concluido',
      finalizado_em: new Date().toISOString()
    })
    .eq('id', jobId);

  if (error) throw error;
}

async function marcarJobErro(jobId, mensagem) {
  const { error } = await supabase
    .from('jobs_imagem')
    .update({
      status: 'erro',
      erro: mensagem,
      finalizado_em: new Date().toISOString()
    })
    .eq('id', jobId);

  if (error) {
    console.error(`Erro ao marcar job ${jobId} como erro: ${error.message}`);
  }
}

async function atualizarImovelConcluido(imovelId, resultado) {
  const { error } = await supabase
    .from('imoveis')
    .update({
      imagem_thumb: resultado.thumb,
      imagem_card: resultado.card,
      imagem_full: resultado.full,
      status_processamento_imagem: 'concluido'
    })
    .eq('id', imovelId);

  if (error) throw error;
}

async function atualizarImovelErro(imovelId) {
  const { error } = await supabase
    .from('imoveis')
    .update({
      status_processamento_imagem: 'erro'
    })
    .eq('id', imovelId);

  if (error) {
    console.error(`Erro ao marcar imóvel ${imovelId} como erro: ${error.message}`);
  }
}

async function consumerLoop(workerNumero) {
  const nomeWorker = `W${workerNumero}`;

  console.log(`[${agora()}] ${nomeWorker} iniciado.`);

  while (!encerrar) {
    try {
      const job = await pegarJob();

      if (!job || !job.id) {
        await sleep(800);
        continue;
      }

      ativosLocais++;

      const inicioJob = Date.now();
      console.log(
        `[${agora()}] ${nomeWorker} pegou job ${job.id} | imóvel ${job.imovel_id}`
      );

      try {
        const resultado = await processarEmThread({
          jobId: job.id,
          imovelId: job.imovel_id,
          caminhoOriginal: job.caminho_original,
          supabaseUrl: process.env.SUPABASE_URL,
          serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY
        });

        await atualizarImovelConcluido(job.imovel_id, resultado);
        await marcarJobConcluido(job.id);

        const duracaoMs = Date.now() - inicioJob;

        stats.totalSucesso++;
        stats.porWorker[nomeWorker].sucesso++;
        stats.porWorker[nomeWorker].jobs.push({
          jobId: job.id,
          imovelId: job.imovel_id,
          duracaoMs,
          status: 'concluido'
        });

        console.log(
          `[${agora()}] ${nomeWorker} concluiu job ${job.id} em ${duracaoMs} ms`
        );
      } catch (err) {
        const duracaoMs = Date.now() - inicioJob;

        await marcarJobErro(job.id, err.message);
        await atualizarImovelErro(job.imovel_id);

        stats.totalErro++;
        stats.porWorker[nomeWorker].erro++;
        stats.porWorker[nomeWorker].jobs.push({
          jobId: job.id,
          imovelId: job.imovel_id,
          duracaoMs,
          status: 'erro',
          mensagem: err.message
        });

        console.error(
          `[${agora()}] ${nomeWorker} falhou no job ${job.id} em ${duracaoMs} ms | ${err.message}`
        );
      } finally {
        ativosLocais--;
      }
    } catch (err) {
      console.error(`[${agora()}] Erro geral em ${nomeWorker}: ${err.message}`);
      await sleep(1000);
    }
  }

  console.log(`[${agora()}] ${nomeWorker} encerrado.`);
}

async function monitorarFila() {
  let ciclosFilaVazia = 0;

  while (!encerrar) {
    try {
      const restantes = await contarJobsRestantes();

      console.log(
        `[${agora()}] MONITOR | restantes=${restantes} | ativosLocais=${ativosLocais}`
      );

      if (restantes === 0 && ativosLocais === 0) {
        ciclosFilaVazia++;
      } else {
        ciclosFilaVazia = 0;
      }

      // Espera 3 verificações seguidas com fila vazia
      if (ciclosFilaVazia >= 3) {
        encerrar = true;
        break;
      }
    } catch (err) {
      console.error(`[${agora()}] Erro no monitor: ${err.message}`);
    }

    await sleep(2000);
  }
}

function imprimirResumoFinal() {
  stats.fim = Date.now();
  const tempoTotalMs = stats.fim - stats.inicio;
  const tempoTotalSeg = (tempoTotalMs / 1000).toFixed(2);

  console.log('\n================ RESUMO FINAL ================');
  console.log(`Workers utilizados: ${stats.workers}`);
  console.log(`Tempo total: ${tempoTotalSeg} s`);
  console.log(`Jobs concluídos com sucesso: ${stats.totalSucesso}`);
  console.log(`Jobs com erro: ${stats.totalErro}`);

  for (const [worker, dados] of Object.entries(stats.porWorker)) {
    const mediaMs =
      dados.jobs.length > 0
        ? (
            dados.jobs.reduce((acc, item) => acc + item.duracaoMs, 0) /
            dados.jobs.length
          ).toFixed(2)
        : '0.00';

    console.log(`\n${worker}`);
    console.log(`- sucesso: ${dados.sucesso}`);
    console.log(`- erro: ${dados.erro}`);
    console.log(`- jobs processados: ${dados.jobs.length}`);
    console.log(`- tempo médio por job: ${mediaMs} ms`);
  }

  console.log('=============================================\n');
}

async function main() {
  console.log(`\n[${agora()}] Iniciando benchmark com ${WORKERS} worker(s)...\n`);

  const consumers = [];
  for (let i = 1; i <= WORKERS; i++) {
    consumers.push(consumerLoop(i));
  }

  await monitorarFila();
  await Promise.all(consumers);

  imprimirResumoFinal();
  process.exit(0);
}

process.on('SIGINT', async () => {
  console.log('\nEncerramento manual solicitado...');
  encerrar = true;
  await sleep(1500);
  imprimirResumoFinal();
  process.exit(0);
});

main().catch(err => {
  console.error('Erro fatal:', err.message);
  process.exit(1);
});