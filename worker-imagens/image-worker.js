import { workerData, parentPort } from 'node:worker_threads';
import { createClient } from '@supabase/supabase-js';
import sharp from 'sharp';

const supabase = createClient(workerData.supabaseUrl, workerData.serviceRoleKey);

async function baixarImagem(bucket, path) {
  const { data, error } = await supabase.storage.from(bucket).download(path);
  if (error) throw error;

  const arrayBuffer = await data.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

async function enviarImagem(bucket, path, buffer) {
  const { error } = await supabase.storage
    .from(bucket)
    .upload(path, buffer, {
      contentType: 'image/jpeg',
      upsert: true
    });

  if (error) throw error;
  return path;
}

async function main() {
  const bucket = 'imoveis-imagens';
  const original = await baixarImagem(bucket, workerData.caminhoOriginal);

  const thumbBuffer = await sharp(original)
    .resize(300, 200, { fit: 'cover' })
    .jpeg({ quality: 75 })
    .toBuffer();

  const cardBuffer = await sharp(original)
    .resize(800, 600, { fit: 'cover' })
    .jpeg({ quality: 80 })
    .toBuffer();

  const fullBuffer = await sharp(original)
    .resize(1600, 1200, { fit: 'inside', withoutEnlargement: true })
    .jpeg({ quality: 85 })
    .toBuffer();

  const base = `processadas/imovel_${workerData.imovelId}`;

  const thumbPath = await enviarImagem(bucket, `${base}_thumb.jpg`, thumbBuffer);
  const cardPath = await enviarImagem(bucket, `${base}_card.jpg`, cardBuffer);
  const fullPath = await enviarImagem(bucket, `${base}_full.jpg`, fullBuffer);

  parentPort.postMessage({
    thumb: thumbPath,
    card: cardPath,
    full: fullPath
  });
}

main().catch(err => {
  throw err;
});