import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import { Worker } from 'node:worker_threads';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Uso: node index.js 1 | 2 | 4
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
  stats.porWorker[`W${i}`] = { sucesso: 0, erro: 0, jobs: [] };
}

const CORES = {
  reset:   '\x1b[0m',
  bold:    '\x1b[1m',
  dim:     '\x1b[2m',
  cyan:    '\x1b[36m',
  green:   '\x1b[32m',
  yellow:  '\x1b[33m',
  red:     '\x1b[31m',
  magenta: '\x1b[35m',
  blue:    '\x1b[34m',
  white:   '\x1b[37m',
};

const WORKER_CORES = [
  CORES.cyan,
  CORES.magenta,
  CORES.yellow,
  CORES.blue,
];

function cor(texto, ...estilos) {
  return estilos.join('') + texto + CORES.reset;
}

function agora() {
  return new Date().toLocaleTimeString('pt-BR');
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function linha(char = '─', tamanho = 52) {
  return char.repeat(tamanho);
}

function imprimirCabecalho() {
  console.log('');
  console.log(cor(linha('═'), CORES.bold, CORES.white));
  console.log(cor(`  HOME-SWEET-HOME — Processador de Imagens`, CORES.bold, CORES.white));
  console.log(cor(`  Workers ativos: ${WORKERS}  |  Iniciado: ${agora()}`, CORES.dim));
  console.log(cor(linha('═'), CORES.bold, CORES.white));
  console.log('');

  for (let i = 1; i <= WORKERS; i++) {
    const corW = WORKER_CORES[(i - 1) % WORKER_CORES.length];
    console.log(cor(`  ▶  W${i} online e aguardando jobs na fila...`, corW, CORES.bold));
  }

  console.log('');
  console.log(cor(linha(), CORES.dim));
  console.log('');
}

function logWorker(workerNumero, mensagem, tipo = 'info') {
  const corW = WORKER_CORES[(workerNumero - 1) % WORKER_CORES.length];
  const prefixo = cor(`[W${workerNumero}]`, corW, CORES.bold);
  const hora = cor(`[${agora()}]`, CORES.dim);

  let icone = '';
  let corMensagem = CORES.white;

  if (tipo === 'pegar')    { icone = '⬇'; corMensagem = CORES.yellow; }
  if (tipo === 'sucesso')  { icone = '✔'; corMensagem = CORES.green; }
  if (tipo === 'erro')     { icone = '✖'; corMensagem = CORES.red; }
  if (tipo === 'aguardar') { icone = '…'; corMensagem = CORES.dim; }

  console.log(`${hora} ${prefixo} ${cor(`${icone} ${mensagem}`, corMensagem)}`);
}

function logMonitor(restantes) {
  const barraMax = 20;
  const preenchido = Math.max(0, Math.min(barraMax, barraMax - Math.round((restantes / 24) * barraMax)));
  const barra = '█'.repeat(preenchido) + '░'.repeat(barraMax - preenchido);

  console.log('');
  console.log(cor(`  ┌─ MONITOR DE FILA ─────────────────────┐`, CORES.dim));
  console.log(cor(`  │  Jobs restantes : `, CORES.dim) + cor(`${restantes}`, CORES.bold, CORES.white) + cor(`                       │`, CORES.dim));
  console.log(cor(`  │  Workers ativos : `, CORES.dim) + cor(`${ativosLocais}`, CORES.bold, CORES.white) + cor(`                       │`, CORES.dim));
  console.log(cor(`  │  Progresso      : [`, CORES.dim) + cor(barra, CORES.green) + cor(`] │`, CORES.dim));
  console.log(cor(`  └────────────────────────────────────────┘`, CORES.dim));
  console.log('');
}

function processarEmThread(payload) {
  return new Promise((resolve, reject) => {
    const worker = new Worker(new URL('./image-worker.js', import.meta.url), {
      workerData: payload
    });
    worker.on('message', resolve);
    worker.on('error', reject);
    worker.on('exit', code => {
      if (code !== 0) reject(new Error(`Thread finalizada com código ${code}`));
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
    .update({ status: 'concluido', finalizado_em: new Date().toISOString() })
    .eq('id', jobId);
  if (error) throw error;
}

async function marcarJobErro(jobId, mensagem) {
  const { error } = await supabase
    .from('jobs_imagem')
    .update({ status: 'erro', erro: mensagem, finalizado_em: new Date().toISOString() })
    .eq('id', jobId);
  if (error) console.error(`Erro ao marcar job ${jobId} como erro: ${error.message}`);
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
    .update({ status_processamento_imagem: 'erro' })
    .eq('id', imovelId);
  if (error) console.error(`Erro ao marcar imóvel ${imovelId} como erro: ${error.message}`);
}

async function consumerLoop(workerNumero) {
  while (!encerrar) {
    try {
      const job = await pegarJob();

      if (!job || !job.id) {
        logWorker(workerNumero, 'Fila vazia, aguardando...', 'aguardar');
        await sleep(800);
        continue;
      }

      ativosLocais++;
      const inicioJob = Date.now();
      logWorker(workerNumero, `Capturou job #${job.id} → imóvel #${job.imovel_id}`, 'pegar');

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
        stats.porWorker[`W${workerNumero}`].sucesso++;
        stats.porWorker[`W${workerNumero}`].jobs.push({ jobId: job.id, imovelId: job.imovel_id, duracaoMs, status: 'concluido' });

        logWorker(workerNumero, `Job #${job.id} concluído em ${duracaoMs} ms`, 'sucesso');

      } catch (err) {
        const duracaoMs = Date.now() - inicioJob;

        await marcarJobErro(job.id, err.message);
        await atualizarImovelErro(job.imovel_id);

        stats.totalErro++;
        stats.porWorker[`W${workerNumero}`].erro++;
        stats.porWorker[`W${workerNumero}`].jobs.push({ jobId: job.id, imovelId: job.imovel_id, duracaoMs, status: 'erro', mensagem: err.message });

        logWorker(workerNumero, `Job #${job.id} falhou em ${duracaoMs} ms | ${err.message}`, 'erro');

      } finally {
        ativosLocais--;
      }

    } catch (err) {
      logWorker(workerNumero, `Erro geral: ${err.message}`, 'erro');
      await sleep(1000);
    }
  }
}

async function monitorarFila() {
  let ciclosVazios = 0;

  while (!encerrar) {
    try {
      const restantes = await contarJobsRestantes();
      logMonitor(restantes);

      if (restantes === 0 && ativosLocais === 0) {
        ciclosVazios++;
      } else {
        ciclosVazios = 0;
      }

      if (ciclosVazios >= 3) {
        encerrar = true;
        break;
      }
    } catch (err) {
      console.error(cor(`[MONITOR] Erro: ${err.message}`, CORES.red));
    }

    await sleep(2000);
  }
}

function imprimirResumoFinal() {
  stats.fim = Date.now();
  const tempoTotalSeg = ((stats.fim - stats.inicio) / 1000).toFixed(2);

  console.log('');
  console.log(cor(linha('═'), CORES.bold, CORES.green));
  console.log(cor('  RESUMO FINAL', CORES.bold, CORES.green));
  console.log(cor(linha('═'), CORES.bold, CORES.green));
  console.log(cor(`  Workers utilizados : ${stats.workers}`, CORES.white));
  console.log(cor(`  Tempo total        : ${tempoTotalSeg} s`, CORES.bold, CORES.white));
  console.log(cor(`  Sucesso            : ${stats.totalSucesso}`, CORES.green));
  console.log(cor(`  Erros              : ${stats.totalErro}`, stats.totalErro > 0 ? CORES.red : CORES.dim));
  console.log(cor(linha(), CORES.dim));

  for (const [nome, dados] of Object.entries(stats.porWorker)) {
    const numero = parseInt(nome.replace('W', ''));
    const corW = WORKER_CORES[(numero - 1) % WORKER_CORES.length];
    const media = dados.jobs.length > 0
      ? (dados.jobs.reduce((a, j) => a + j.duracaoMs, 0) / dados.jobs.length).toFixed(0)
      : '0';

    console.log('');
    console.log(cor(`  ${nome}`, corW, CORES.bold));
    console.log(cor(`  ├─ Jobs processados : ${dados.jobs.length}`, CORES.white));
    console.log(cor(`  ├─ Sucesso          : ${dados.sucesso}`, CORES.green));
    console.log(cor(`  ├─ Erros            : ${dados.erro}`, dados.erro > 0 ? CORES.red : CORES.dim));
    console.log(cor(`  └─ Tempo médio/job  : ${media} ms`, CORES.white));
  }

  console.log('');
  console.log(cor(linha('═'), CORES.bold, CORES.green));
  console.log('');
}

async function main() {
  imprimirCabecalho();

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
  console.log(cor('\n  Encerramento manual solicitado...', CORES.yellow));
  encerrar = true;
  await sleep(1500);
  imprimirResumoFinal();
  process.exit(0);
});

main().catch(err => {
  console.error(cor(`Erro fatal: ${err.message}`, CORES.red));
  process.exit(1);
});
