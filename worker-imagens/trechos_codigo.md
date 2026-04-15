# Trechos curtos do código

## 1. Criação do job no `cadastrar_imovel.html`

```js
const { data: imovel, error: dbError } = await supabase
  .from('imoveis')
  .insert([{
    titulo: document.getElementById('titulo').value,
    cidade: document.getElementById('cidade').value,
    descricao: document.getElementById('descricao').value,
    preco_diaria: parseFloat(document.getElementById('preco').value),
    imagem: nomeArquivo,
    dono_id: user.id,
    status_processamento_imagem: 'pendente'
  }])
  .select('id')
  .single();

if (dbError) throw dbError;

const { error: jobError } = await supabase
  .from('jobs_imagem')
  .insert([{
    imovel_id: imovel.id,
    caminho_original: nomeArquivo
  }]);

if (jobError) throw jobError;
```

## 2. Função `pegar_proximo_job_imagem()`

```sql
create or replace function pegar_proximo_job_imagem()
returns jobs_imagem
language plpgsql
as $$
declare
  v_job jobs_imagem;
begin
  select *
    into v_job
  from jobs_imagem
  where status = 'pendente'
  order by id
  for update skip locked
  limit 1;

  if v_job.id is not null then
    update jobs_imagem
       set status = 'processando',
           iniciado_em = now(),
           tentativas = tentativas + 1
     where id = v_job.id;

    select * into v_job
    from jobs_imagem
    where id = v_job.id;
  end if;

  return v_job;
end;
$$;
```

## 3. Trecho do `index.js` do worker

```js
const WORKERS = Number(process.argv[2] || 1);

async function pegarJob() {
  const { data, error } = await supabase.rpc('pegar_proximo_job_imagem');
  if (error) throw error;
  return data;
}

async function consumerLoop(workerNumero) {
  const nomeWorker = `W${workerNumero}`;

  while (!encerrar) {
    const job = await pegarJob();

    if (!job || !job.id) {
      await sleep(800);
      continue;
    }

    const resultado = await processarEmThread({
      jobId: job.id,
      imovelId: job.imovel_id,
      caminhoOriginal: job.caminho_original,
      supabaseUrl: process.env.SUPABASE_URL,
      serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY
    });

    await atualizarImovelConcluido(job.imovel_id, resultado);
    await marcarJobConcluido(job.id);
  }
}
```
