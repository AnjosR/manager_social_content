# Plano de Testes: PinoLogger (TDD)

> Projeto: Sistema ONG CERAC
> Camada: Infraestrutura / Observabilidade
> Componente: `PinoLogger` — implementa porta `Logger`
> Tipo de teste: **Unit** (com `pino` real em modo silent + spy nas saídas)

---

## 1. Objetivo do componente

Padronizar logging do projeto através de uma porta `Logger`, evitando que o resto do código importe `pino` diretamente. Provê:

- Níveis: `debug`, `info`, `warn`, `error`.
- Sanitização automática: redaction de campos sensíveis.
- Compatibilidade com o `error-handler`, `AuthMiddleware` e qualquer adapter futuro.

> Decisão: criar a porta `Logger` em `src/application/interfaces/logger.ts` (ou `src/infrastructure/interfaces/logger.ts` — debater se logging é cross-cutting "aplicação" ou puramente "infra"). **Recomendação**: `src/infrastructure/interfaces/logger.ts`, pois logging é detalhe de infra; use cases não devem logar.

---

## 2. Dependências

- `pino` (real, em modo `silent` ou direcionado a buffer/transport de teste).

---

## 3. Massa base

```ts
const logs: object[] = []
const stream = { write: (chunk: string) => logs.push(JSON.parse(chunk)) }
const sut = new PinoLogger({ level: 'debug', stream })
```

---

## 4. Casos de Teste

### 4.1. Níveis

- [ ] `info(message, meta?)` produz um registro com `level: 30` (`info`).
- [ ] `warn(...)` produz `level: 40`.
- [ ] `error(message, error?, meta?)` produz `level: 50`.
- [ ] `debug(...)` produz `level: 20`.
- [ ] Em nível configurado `info`, `debug` **não** produz registro.

### 4.2. Estrutura do registro

- [ ] Cada registro contém `time`, `level`, `msg`.
- [ ] `meta` passado é mesclado ao registro (top-level ou em `ctx`, conforme convenção do projeto — definir).
- [ ] `error(message, error)` inclui `err.name`, `err.message`, `err.stack` quando `error` é instância de `Error`.

### 4.3. Redaction (anti-vazamento)

- [ ] Campos `password`, `passwordHash`, `authorization`, `Authorization`, `accessToken`, `token`, `secret` são automaticamente substituídos por `[REDACTED]` em qualquer profundidade do `meta`.
- [ ] Redaction funciona em arrays e objetos aninhados.
- [ ] Mensagem (`msg`) **não** sofre redaction — quem chama é responsável por não passar segredo em string crua. Documentar.

### 4.4. Performance / integração

- [ ] Múltiplos `info` consecutivos não bloqueiam o event loop (smoke test).
- [ ] Em modo `silent`/test, nenhum byte é escrito em `process.stdout`.

### 4.5. Configuração

- [ ] Nível configurado via env (`LOG_LEVEL`).
- [ ] Default seguro quando `LOG_LEVEL` ausente (ex: `info` em produção, `silent` em teste).

---

## 5. Ordem TDD sugerida

1. CT01 — `info(msg)` produz registro com `msg` correto.
2. CT02 — `error(msg, error)` inclui `err.stack`.
3. CT03 — `password` em `meta` é redacted.
4. CT04 — `Authorization` header em `meta` é redacted.
5. CT05 — Nível configurado filtra `debug`.

---

## 6. Checklist final

- [ ] Porta `Logger` definida.
- [ ] Implementa `debug`, `info`, `warn`, `error`.
- [ ] Redaction automática dos campos sensíveis.
- [ ] Nível configurável por env.
- [ ] Sem leak de segredos.

---

## 7. Referências

- Consumidor principal: [Error handler](./error-handler.md)
- Decisão: porta vai em `src/infrastructure/interfaces/logger.ts`.
