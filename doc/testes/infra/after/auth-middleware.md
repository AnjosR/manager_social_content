# Plano de Testes: AuthMiddleware (TDD)

---

## 1. Objetivo do middleware

Proteger rotas que exigem autenticação. Verifica o JWT presente no header `Authorization: Bearer <token>`, decoda o payload e injeta `req.user = { sub, role }` para uso pelos controllers.

Responsabilidades específicas:

- Extrair o token do header `Authorization`.
- Delegar a verificação ao `TokenVerifier` (porta nova, complementar ao `TokenGenerator`).
- Em caso de token válido: popular `req.user` e seguir o pipeline.
- Em caso de token inválido/ausente/expirado: lançar `UnauthorizedError` (mapeada para `401` pelo `error-handler`).
- **Nunca** vazar o motivo específico do erro (token expirado vs. assinatura inválida vs. malformado) na resposta.

---

## 2. Dependências (Mocks)

- **`TokenVerifier`** (`MockProxy<TokenVerifier>`): porta com `verify(token: string): Promise<{ sub: string; role: string }>`. Lança erro específico (a definir, ex: `InvalidTokenError`) quando inválido.

> **Decisão**: criar uma nova porta `TokenVerifier` em `src/application/interfaces/token-verifier.ts` (espelho do `TokenGenerator`). O adapter `JwtTokenGenerator` pode implementar ambas, mas a separação respeita ISP (Interface Segregation).

---

## 3. Massa base

```ts
const validToken = 'header.payload.signature'
const validPayload = { sub: '9a11f510-...', role: 'Editor' }

const validRequest = {
  headers: { authorization: `Bearer ${validToken}` },
}
```

---

## 4. Casos de Teste

### 4.1. Fluxo Principal (token válido)

- [ ] Deve extrair o token do header `Authorization`, removendo o prefixo `Bearer ` (case-sensitive).
- [ ] Deve invocar `TokenVerifier.verify` exatamente uma vez, com o token extraído.
- [ ] Deve popular `req.user` com `{ sub, role }` do payload retornado.
- [ ] Deve seguir o pipeline (`done()` no Fastify) — não envia resposta.

### 4.2. Header ausente ou malformado (HTTP 401)

- [ ] Deve lançar `UnauthorizedError` quando o header `Authorization` está ausente.
- [ ] Deve lançar `UnauthorizedError` quando o header existe mas é string vazia.
- [ ] Deve lançar `UnauthorizedError` quando o header não começa com `Bearer ` (ex: `Basic ...`, `token ...`).
- [ ] Deve lançar `UnauthorizedError` quando o header é apenas `Bearer ` (sem token).
- [ ] Deve lançar `UnauthorizedError` quando o header tem múltiplos espaços (`Bearer  token`) — comportamento estrito.

### 4.3. Token inválido (HTTP 401)

- [ ] Deve lançar `UnauthorizedError` quando `TokenVerifier.verify` lança por assinatura inválida.
- [ ] Deve lançar `UnauthorizedError` quando `TokenVerifier.verify` lança por token expirado.
- [ ] Deve lançar `UnauthorizedError` quando `TokenVerifier.verify` lança por payload malformado (sem `sub` ou `role`).
- [ ] Deve garantir que a mensagem do erro é **genérica** — nunca expõe "expired"/"signature mismatch" ao cliente (o `error-handler` faz esse achatamento; o teste valida que o middleware **não** cria mensagens detalhadas para o cliente).

### 4.4. Erros inesperados

- [ ] Deve propagar (sem capturar) erros não previstos vindos do `TokenVerifier` (ex: falha de I/O em JWKS remoto, caso aplicável) — mapeados a `500` no `error-handler`.

### 4.5. Garantias laterais

- [ ] O middleware **nunca** consulta o `UserRepository`. A revogação de tokens (caso surja) é tema de outra camada (revocation list/short-lived tokens).
- [ ] `req.user` deve ter exatamente as chaves `sub` e `role` — propriedades extras do payload do JWT são descartadas.
- [ ] O middleware **não** loga o token em texto plano.

---

## 5. Ordem TDD sugerida

1. CT01 — Token válido popula `req.user` e segue.
2. CT02 — Header ausente → `UnauthorizedError`.
3. CT03 — Header sem prefixo `Bearer ` → `UnauthorizedError`.
4. CT04 — `TokenVerifier.verify` lança → `UnauthorizedError`.
5. CT05 — `req.user` contém apenas `sub` e `role`.
6. CT06 — Token nunca é logado.

---

## 6. Checklist final

- [ ] Extrai token apenas do esquema `Bearer`.
- [ ] Popula `req.user = { sub, role }`.
- [ ] Lança `UnauthorizedError` para qualquer falha de verificação.
- [ ] Mensagem ao cliente é sempre genérica.
- [ ] Não consulta repositórios.
- [ ] Não loga token.

---

## 7. Referências

- [Plano de testes `JwtTokenGenerator`](./jwt-token-generator.md)
- [Error handler](./error-handler.md)
- [Caso de uso `SignInUseCase`](../../feature/uc/sign-in.md)
