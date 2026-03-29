import http from 'k6/http';
import { sleep } from 'k6';

export const options = {
  vus: 10, // Virtual Users (10 usuários acessando ao mesmo tempo)
  duration: '30s', // Durante 30 segundos
};

export default function () {
  // Ele vai ficar acessando sua página inicial sem parar por 30 segundos
  http.get('https://filipe08-000.github.io/Home-Sweet-Home/index.html');
  sleep(1); // Espera 1 segundo e tenta de novo
}