# Plano de Testes: Error Handler (TDD)

> Projeto: Sistema ONG CERAC
> Camada: Infraestrutura / Adaptadores HTTP
> Componente: `setErrorHandler` do Fastify

---

## 1. Objetivo do error-handler

Único ponto onde erros de domínio e aplicação são mapeados para respostas HTTP. Centraliza:

- Tradução `class do erro → statusCode + payload`.
- Sanitização (não vazar stack trace, mensagem interna, nomes de dependências).
- Logging de erros (especialmente `500`).
- Coerência da mensagem genérica em `401` (anti-enumeração).

Responsabilidades específicas:

- Mapear cada erro conhecido para o status correto.
- Tratar `ZodError` (entrada inválida) como `400` com mensagem amigável.
- Tratar `Error` desconhecido como `500` genérico.
- Logar com nível e dados adequados (sem `password`).

---

## 2. Dependências (Mocks)

- **`Logger`** (`MockProxy<Logger>`): para verificar que erros inesperados são registrados.
- **Fastify reply/request** (mocks ou via `app.inject()`): para verificar status e body.

---

## 3. Tabela canônica de mapeamento

| Erro                                  | Status | Mensagem ao cliente                          | Log   |
| ------------------------------------- | :----: | -------------------------------------------- | ----- |
| `ZodError`                            |  400   | "Validation failed" + detalhes campo a campo | warn  |
| `InvalidNameError`                    |  400   | mensagem do erro                             | warn  |
| `InvalidPasswordError`                |  400   | mensagem do erro                             | warn  |
| `InvalidTitleError`                   |  400   | mensagem do erro                             | warn  |
| `InvalidDescriptionError`             |  400   | mensagem do erro                             | warn  |
| `InvalidActionDateError`              |  400   | mensagem do erro                             | warn  |
| `InvalidImageUrlError`                |  400   | mensagem do erro                             | warn  |
| `InvalidRoleError`                    |  400   | mensagem do erro                             | warn  |
| `InvalidEmailError`                   |  401   | "Credenciais inválidas" (anti-enumeração)    | warn  |
| `InvalidCredentialsError`             |  401   | "Credenciais inválidas"                      | warn  |
| `UnauthorizedError` (auth middleware) |  401   | "Não autorizado"                             | warn  |
| `NotAllowedError`                     |  403   | "Operação não permitida"                     | warn  |
| `EditorNotExistsError`                |  404   | "Recurso não encontrado"                     | warn  |
| `ContentNotFoundError`                |  404   | "Recurso não encontrado"                     | warn  |
| `EmailAlreadyExistsError`             |  409   | mensagem do erro                             | warn  |
| `InvalidContentError`                 |  409   | mensagem do erro                             | warn  |
| `DataBaseConnectionError`             |  500   | "Erro interno do servidor"                   | error |
| `HashComparerError`                   |  500   | "Erro interno do servidor"                   | error |
| `TokenGenerationError`                |  500   | "Erro interno do servidor"                   | error |
| `Error` (qualquer outro)              |  500   | "Erro interno do servidor"                   | error |

> Decisão crítica: `InvalidEmailError` → **401** (e não 400). Motivo: a validação semântica de e-mail acontece dentro do `SignInUseCase`. Se vazássemos `400` ali, um atacante distinguiria "formato inválido" de "credencial inválida", abrindo enumeração lateral. Em rotas onde e-mail é só dado de cadastro (`SignUp`), o `InvalidEmailError` ainda é 401 pois cai na mesma classe — se for um problema, refatorar para erros distintos por contexto, **não** mudar o mapa.

---

## 4. Casos de Teste

### 4.1. Mapeamento por classe (200 testes? não — 1 por classe)

Para **cada** linha da tabela acima:

- [ ] Deve retornar o `statusCode` correspondente.
- [ ] Deve retornar a mensagem **canônica** (não a mensagem original quando a regra exige genérica).
- [ ] Deve respeitar o nível de log esperado (`warn` para 4xx; `error` para 5xx).

### 4.2. Sanitização (HTTP 500)

- [ ] Resposta **não** contém `stack`.
- [ ] Resposta **não** contém a mensagem original do erro.
- [ ] Resposta **não** contém o `error.name` da classe interna.
- [ ] Resposta **não** contém referências a `pg`, `bcrypt`, `jose`, `prisma` ou qualquer biblioteca.

### 4.3. Sanitização universal

- [ ] **Nenhum** payload de erro contém `password` em texto plano.
- [ ] **Nenhum** payload de erro contém `passwordHash`.
- [ ] **Nenhum** payload de erro contém tokens, chaves ou segredos.

### 4.4. ZodError

- [ ] Retorna `400`.
- [ ] Body inclui um array `issues` com `{ path, message }` por campo (sem expor o objeto Zod inteiro).
- [ ] Não inclui o valor recebido (para não ecoar payloads com `password`).

### 4.5. Logging

- [ ] `5xx` chama `logger.error` exatamente uma vez por request.
- [ ] `4xx` chama `logger.warn` exatamente uma vez por request.
- [ ] O log contém: `requestId`, `method`, `url`, `statusCode`, `errorName`, `errorMessage`.
- [ ] O log **não** contém `password`, `passwordHash`, `Authorization` header.
- [ ] Em `5xx`, o log contém `stack` (apenas no log, nunca na resposta).

### 4.6. Headers e content-type

- [ ] `Content-Type` é `application/json`.
- [ ] Nenhuma resposta de erro inclui `X-Powered-By`.

### 4.7. Erros desconhecidos

- [ ] Um `throw new Error('something internal exploded')` resulta em `500` com mensagem genérica.
- [ ] Um `throw 'string-thrown'` (não-Error) também resulta em `500` (defesa em profundidade).
- [ ] Um `throw null` ou `throw undefined` também resulta em `500`.

---

## 5. Ordem TDD sugerida

1. CT01 — `Error` genérico → `500` "Erro interno do servidor".
2. CT02 — `InvalidCredentialsError` → `401` "Credenciais inválidas".
3. CT03 — `InvalidEmailError` → `401` (anti-enumeração).
4. CT04 — `EmailAlreadyExistsError` → `409`.
5. CT05 — `EditorNotExistsError` / `ContentNotFoundError` → `404`.
6. CT06 — `NotAllowedError` → `403`.
7. CT07 — `ZodError` → `400` com `issues`.
8. CT08 — Sanitização: `500` não vaza stack/mensagem interna.
9. CT09 — Logger é chamado com nível correto.
10. CT10 — Payload de erro nunca contém `password`/`passwordHash`.

---

## 6. Checklist final

- [ ] Toda classe da tabela tem teste explícito.
- [ ] `500` nunca expõe internals.
- [ ] `401` é sempre genérico.
- [ ] Log existe, está sanitizado e tem nível adequado.
- [ ] `ZodError` não ecoa o body recebido.
- [ ] Nenhum payload contém segredo.

---

## 7. Referências

- [Plano de testes `SignInController`](./signin-controller.md) §4.5/§4.6
- [Logger](./pino-logger.md)
- [HTTP schemas (Zod)](./http-schemas.md)
