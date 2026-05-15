# Plano de Testes: PostgresConnection (TDD)

---

## 1. Objetivo do componente

Abstrair o ciclo de vida da conexão com o Postgres em um único ponto. Provê:

- Pool de conexões (`pg.Pool` ou `Prisma Client` — depende da decisão final).
- Lazy init com configuração via env (`DATABASE_URL`).
- `query(...)` / `getClient()` (caso SQL puro) **ou** `getClient(): PrismaClient` (caso Prisma).
- `close()` para shutdown gracioso.

> Decisão pendente (Prisma vs SQL puro): se Prisma, este componente vira um wrapper finíssimo do `PrismaClient`; se SQL puro, encapsula o `pg.Pool`. Os testes abaixo cobrem o comportamento mínimo comum a ambos.

---

## 2. Dependências

- Postgres real (Docker Compose ou Testcontainers).
- Cliente: `pg` **ou** `@prisma/client`.
- Env: `DATABASE_URL`.

---

## 3. Massa base

```ts
const sut = new PostgresConnection({ url: process.env.DATABASE_URL_TEST })
```

---

## 4. Casos de Teste

### 4.1. Inicialização

- [ ] Deve conectar com sucesso ao banco usando `DATABASE_URL`.
- [ ] Deve falhar (com `DataBaseConnectionError`) quando `DATABASE_URL` é inválida.
- [ ] Deve falhar (com `DataBaseConnectionError`) quando o banco está inacessível (host/porta errados).
- [ ] Init lazy: a conexão só é estabelecida na primeira query, não no `new`.

### 4.2. Reuso do pool / cliente (singleton local)

- [ ] Múltiplas chamadas a `getClient()` retornam a mesma instância de pool.
- [ ] Concorrência: múltiplas queries paralelas usam conexões diferentes do pool sem deadlock.

### 4.3. Execução de queries (SQL puro)

> Aplicável apenas ao caminho **SQL puro**. Se Prisma for adotado, ajustar para chamadas via cliente gerado.

- [ ] `query('SELECT 1')` retorna resultado com `rows[0]`.
- [ ] `query` com parâmetros (`$1`, `$2`) faz binding correto (defesa contra SQL injection).
- [ ] `query` lança `DataBaseConnectionError` quando a conexão cai durante a execução.

### 4.4. Shutdown

- [ ] `close()` libera o pool e bloqueia novas queries.
- [ ] Chamar `close()` duas vezes não lança erro.
- [ ] Após `close()`, qualquer `query` lança `DataBaseConnectionError`.

### 4.5. Configuração

- [ ] Respeita `max` (tamanho do pool) configurado por env quando aplicável.
- [ ] Respeita `idleTimeoutMillis` quando configurado.

---

## 5. Ordem TDD sugerida

1. CT01 — Conecta com sucesso.
2. CT02 — `SELECT 1` retorna resultado.
3. CT03 — Lazy init.
4. CT04 — `DATABASE_URL` inválida → `DataBaseConnectionError`.
5. CT05 — `close()` libera o pool.
6. CT06 — Query parametrizada faz binding correto.

---

## 6. Checklist final

- [ ] Conecta usando env.
- [ ] Lazy init.
- [ ] Reutiliza o pool entre chamadas.
- [ ] Fecha graciosamente.
- [ ] Lança `DataBaseConnectionError` em falhas (não `Error` cru).
- [ ] Faz binding parametrizado em SQL puro (anti-injection).

---

## 7. Referências

- Erro: [`src/application/erros/database-connection-error.ts`](../../../src/application/erros/database-connection-error.ts)
- Consumidores: [PostgresUserRepository](./postgres-user-repository.md), [PostgresContentRepository](./postgres-content-repository.md)
