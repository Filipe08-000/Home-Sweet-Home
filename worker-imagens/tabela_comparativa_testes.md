# Tabela comparativa dos testes de paralelismo

| Configuração | Jobs processados | Sucesso | Erro | Tempo total | Tempo médio por job |
|---|---:|---:|---:|---:|---:|
| 1 worker | 24 | 24 | 0 | 41,72 s | 1489,42 ms |
| 2 workers | 24 | 24 | 0 | 25,46 s | ~1520 ms |
| 4 workers | 24 | 24 | 0 | 15,00 s | ~1512 ms |

## Ganho observado
- **2 workers vs 1 worker:** redução de aproximadamente **1,64x** no tempo total.
- **4 workers vs 1 worker:** redução de aproximadamente **2,78x** no tempo total.
- A distribuição de jobs ficou equilibrada entre os workers em 2W e 4W.
