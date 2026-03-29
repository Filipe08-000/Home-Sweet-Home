import http from 'k6/http';
import { sleep } from 'k6';

export const options = {
  stages: [
    { duration: '30s', target: 10 }, // Sobe de 0 para 10 usuários em 30 segundos
    { duration: '1m', target: 10 },  // Mantém 10 usuários por 1 minuto (Carga)
    { duration: '30s', target: 50 }, // Sobe para 50 usuários rápido (Estresse)
    { duration: '20s', target: 0 },  // Desce para 0 (Resfriamento)
  ],
};

export default function () {
  // Testa a home do seu projeto
  const res = http.get('https://filipe08-000.github.io/Home-Sweet-Home/index.html');
  
  // Simula o tempo que o usuário leva para interagir
  sleep(1); 
}