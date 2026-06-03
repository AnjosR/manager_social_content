# Plano de Testes: HTTP Server (E2E)

> Projeto: Sistema ONG CERAC
> Camada: Infraestrutura / Bootstrap
> Componente: aplicação Fastify completa (`buildApp()`)
> Tipo de teste: **End-to-end** (via `app.inject(...)`, com Postgres real)

---

## 1. Objetivo do componente

Validar o **caminho completo** — rota → schema Zod → middleware → controller → use case → repositório (real) → response — para cada endpoint do CMS. Esses testes pegam regressões que escapam aos unit/integration:

- Erros de wiring na DI.
- Decoração incorreta de plugins (auth, error-handler).
- Schemas Zod que não bloqueiam o que deveriam.
- Status code do error-handler errado em produção real.

> Decisão: a app expõe uma factory `buildApp({ deps }): FastifyInstance`. Em testes, injetamos a `PostgresConnection` apontando para um schema de teste; em produção, vem da composition root real.

---

## 2. Dependências

- Fastify (real).
- Postgres (real, Testcontainers ou Docker Compose dedicado).
- Use cases reais.
- Repositórios reais.
- Adapters reais (`BcryptHasher`, `JwtTokenGenerator`, `PinoLogger`).
- Configuração de teste isolada (env próprio, schema próprio).

---

## 3. Massa base

Seed por teste:

```ts
const editor = await seedUser({ role: 'Editor', email: 'editor@cerac.org', password: 'SenhaForte1!' })
const admin = await seedUser({ role: 'Admin', email: 'admin@cerac.org', password: 'SenhaForte1!' })
```

---

## 4. Casos de Teste por endpoint

### 4.1. `POST /auth/sign-up`

- [ ] `201` com `{ id, name, createdAt }` para body válido.
- [ ] `400` com `issues` para body sem `email`.
- [ ] `400` para `password` que não atende ao VO.
- [ ] `409` quando o e-mail já existe.
- [ ] Resposta nunca contém `password`/`passwordHash`.
- [ ] Após sucesso, `SELECT` confirma usuário persistido com `passwordHash` (não plaintext).

### 4.2. `POST /auth/sign-in`

- [ ] `200` com `{ accessToken }` para credenciais válidas.
- [ ] `accessToken` é verificável pelo `JwtTokenVerifier` e contém `sub`/`role` corretos.
- [ ] `401` com mensagem genérica para usuário inexistente.
- [ ] `401` com mensagem genérica para senha incorreta.
- [ ] `401` para `email` em formato inválido (anti-enumeração).
- [ ] Tempo de resposta entre "e-mail inexistente" e "senha errada" é comparável (timing oracle — opcional, smoke).

### 4.3. `POST /contents` (autenticada)

- [ ] `201` com o conteúdo criado quando o JWT é válido.
- [ ] `authorId` persistido é o `sub` do JWT, **mesmo** que o body contenha outro `authorId` (que é proibido pelo schema).
- [ ] `400` quando o body não passa pelo schema Zod.
- [ ] `400` quando algum VO rejeita (título curto, data futura, sem imagens, etc.).
- [ ] `401` sem header `Authorization`.
- [ ] `401` com token expirado.
- [ ] `409` quando já existe conteúdo com mesmo título.

### 4.4. `DELETE /contents/:contentId` (autenticada)

- [ ] `200` quando o autor remove o próprio conteúdo.
- [ ] `200` quando ADMIN remove conteúdo de outro autor.
- [ ] `403` quando Editor tenta remover conteúdo de outro autor.
- [ ] `404` quando o `contentId` não existe.
- [ ] `400` quando `contentId` não é UUID válido.
- [ ] `401` sem header `Authorization`.

### 4.5. Erros transversais

- [ ] `Content-Type: application/json` em todas as respostas.
- [ ] Header `X-Powered-By` **não** está presente.
- [ ] `500` não vaza stack/mensagem interna em nenhuma rota.
- [ ] Em qualquer falha 5xx, o `PinoLogger` registra (verificável via stream de teste).

### 4.6. Schema do banco (sanity)

- [ ] Migrations rodam até o head antes da suite.
- [ ] Cada teste limpa as tabelas (`TRUNCATE ... CASCADE`) ou usa transação isolada.

---

## 5. Ordem TDD sugerida

1. CT01 — `POST /auth/sign-up` `201`.
2. CT02 — `POST /auth/sign-in` `200` com `accessToken` válido.
3. CT03 — `POST /contents` `201` com `authorId = sub`.
4. CT04 — `DELETE /contents/:id` `200` autor.
5. CT05 — `DELETE /contents/:id` `200` admin.
6. CT06 — `DELETE /contents/:id` `403` outro editor.
7. CT07 — Sem `Authorization` → `401` nas rotas protegidas.
8. CT08 — `500` não vaza internals.
9. CT09 — `409` no `sign-up` para e-mail duplicado.
10. CT10 — `409` no `register-content` para título duplicado.

---

## 6. Checklist final

- [ ] Todos os endpoints têm cobertura E2E.
- [ ] Banco real é usado, isolado por suite.
- [ ] Autorização (sem token / token expirado / role insuficiente) testada em cada rota protegida.
- [ ] `error-handler` validado em ambiente real.
- [ ] Schemas Zod validados em ambiente real.
- [ ] Nenhuma resposta vaza segredo.

---

## 7. Referências

- [SignUpController](./signup-controller.md)
- [SignInController](./signin-controller.md)
- [RegisterContentController](./register-content-controller.md)
- [RemoveContentController](./remove-content-controller.md)
- [AuthMiddleware](./auth-middleware.md)
- [Error handler](./error-handler.md)
- [HTTP schemas](./http-schemas.md)
- [env.ts](./env.md)
