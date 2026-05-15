# Plano de Testes: env.ts (Config) (TDD)

> Projeto: Sistema ONG CERAC
> Camada: Infraestrutura / Configuração
> Componente: `env.ts` (schema Zod sobre `process.env`)
> Tipo de teste: **Unit** (puro)

---

## 1. Objetivo do componente

Validar e tipar variáveis de ambiente no boot. Falha rápido (fail-fast) se alguma var obrigatória está ausente ou inválida — evita que o app suba em estado inconsistente.

Responsabilidades específicas:

- Schema Zod cobrindo todas as envs do projeto.
- Coerções (`PORT` → number, `BCRYPT_COST` → number, `LOG_LEVEL` → enum).
- Defaults seguros (ex: `LOG_LEVEL` default `info`).
- Exporta objeto `env` tipado.

---

## 2. Massa base — variáveis esperadas

| Var            | Tipo                                      | Obrigatória | Default                 |
| -------------- | ----------------------------------------- | ----------- | ----------------------- |
| `NODE_ENV`     | `'production' \| 'development' \| 'test'` | sim         | —                       |
| `PORT`         | `number`                                  | não         | `3333`                  |
| `DATABASE_URL` | `string` (URL Postgres)                   | sim         | —                       |
| `JWT_SECRET`   | `string` (≥ 32 bytes)                     | sim         | —                       |
| `JWT_TTL`      | `string` (ex: `'15m'`)                    | não         | `'15m'`                 |
| `JWT_ISSUER`   | `string`                                  | sim         | —                       |
| `JWT_AUDIENCE` | `string`                                  | sim         | —                       |
| `BCRYPT_COST`  | `number` (4–14)                           | não         | `10` (prod), `4` (test) |
| `LOG_LEVEL`    | `enum`                                    | não         | `'info'`                |

---

## 3. Casos de Teste

### 3.1. Sucesso

- [ ] Deve retornar objeto tipado com todas as vars presentes.
- [ ] Deve aplicar defaults quando opcionais estão ausentes.
- [ ] Deve coercir `PORT` string para number.
- [ ] Deve coercir `BCRYPT_COST` string para number.

### 3.2. Falhas (fail-fast)

- [ ] Deve lançar erro descritivo quando `DATABASE_URL` está ausente.
- [ ] Deve lançar erro quando `JWT_SECRET` é menor que 32 bytes.
- [ ] Deve lançar erro quando `NODE_ENV` não é um valor do enum.
- [ ] Deve lançar erro quando `PORT` não é um inteiro positivo.
- [ ] Deve lançar erro quando `BCRYPT_COST` está fora do range (`<4` ou `>14`).
- [ ] Deve lançar erro quando `LOG_LEVEL` não é um valor válido.

### 3.3. Mensagens de erro

- [ ] Mensagem de erro inclui o nome da var inválida.
- [ ] Mensagem de erro **não** inclui o valor recebido (especialmente para `JWT_SECRET`, `DATABASE_URL` que podem conter credenciais).
- [ ] Em caso de múltiplas falhas, lista todas (não para na primeira).

### 3.4. Segurança

- [ ] O módulo **não** loga as vars no console ao validar.
- [ ] `JWT_SECRET` e `DATABASE_URL` nunca aparecem em mensagens de erro nem em logs (de boot ou de teste).

### 3.5. Imutabilidade

- [ ] O objeto `env` exportado é `Object.freeze`d (ou `as const`) — mutações lançam em strict mode.

---

## 4. Ordem TDD sugerida

1. CT01 — Sucesso com todas as vars válidas.
2. CT02 — `DATABASE_URL` ausente → erro com nome da var.
3. CT03 — `JWT_SECRET` curto → erro descritivo.
4. CT04 — `PORT` não-numérica → erro.
5. CT05 — Defaults aplicados quando opcionais ausentes.
6. CT06 — Múltiplas falhas listadas em conjunto.
7. CT07 — Valores sensíveis não vazam em mensagem de erro.

---

## 5. Checklist final

- [ ] Schema Zod cobre todas as vars.
- [ ] Fail-fast no boot.
- [ ] Defaults seguros e documentados.
- [ ] Mensagens de erro descritivas, sem vazar valor.
- [ ] Objeto exportado imutável e tipado.

---

## 6. Referências

- Consumidores: [JwtTokenGenerator](./jwt-token-generator.md), [BcryptHasher](./bcrypt-hasher.md), [PostgresConnection](./postgres-connection.md), [PinoLogger](./pino-logger.md), [HTTP Server](./http-server.md)
