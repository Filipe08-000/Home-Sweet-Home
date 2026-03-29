import http from 'k6/http';
import { sleep, check } from 'k6';

export const options = {
  stages: [
    { duration: '20s', target: 50 }, // Sobe para 50 usuários
    { duration: '40s', target: 50 }, // Mantém a pressão
    { duration: '20s', target: 0 },  // Desce
  ],
};

export default function () {
  // A URL de autenticação do seu Supabase
  const url = 'https://drlnbbodugxkndtpomfa.supabase.co/auth/v1/token?grant_type=password';

  const payload = JSON.stringify({
    email: 'teste@email.com', // Certifique-se que este usuário existe no seu banco!
    password: '123456',
  });

  const params = {
    headers: {
      'Content-Type': 'application/json',
      'apikey': 'sb_publishable_uxQbUyjsM-DgKapQzvE32Q_ZUNBtdp1', // Sua Anon Key
    },
  };

  const res = http.post(url, payload, params);

  // Agora o check deve passar se o e-mail/senha estiverem corretos
  check(res, {
    'login realizado com sucesso': (r) => r.status === 200,
  });

  sleep(1);
}