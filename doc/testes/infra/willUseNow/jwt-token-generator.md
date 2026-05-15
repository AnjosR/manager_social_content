# Plano de Testes: JwtTokenGenerator / JwtTokenVerifier (TDD)

---

## 1. Objetivo do adapter

Adaptador que assina JWTs (HS256) a partir do payload `{ sub, role }` e verifica tokens recebidos pelo `AuthMiddleware`.

Responsabilidades específicas:

- `generate(payload)` — emite JWT assinado com o segredo do env e TTL configurado.
- `verify(token)` — valida assinatura, `exp`, `iss`/`aud` e retorna payload normalizado.
- Lançar `TokenGenerationError` para falhas inesperadas.
- Lançar `InvalidTokenError` (a criar) em falhas de verificação — tratada como 401 no error-handler.

> Decisão: duas implementações no mesmo arquivo (`JwtTokenGenerator` e `JwtTokenVerifier`) compartilhando configuração. Cada classe implementa uma porta separada (ISP).

---

## 2. Dependências

- `jose` (real, não mockado).
- Configuração:
  - `JWT_SECRET` (env, string mínima de 32 bytes para HS256).
  - `JWT_TTL` (env, ex: `'15m'`).
  - `JWT_ISSUER` (env, ex: `'cerac-cms'`).
  - `JWT_AUDIENCE` (env, ex: `'cerac-cms-clients'`).

---

## 3. Massa base

```ts
const userId = new UniqueEntityId('9a11f510-56c7-41f3-b5c0-6fc52a6d4fd4')
const payload = { sub: userId, role: userRole.EDITOR }
const config = { secret: 'a'.repeat(64), ttl: '15m', issuer: 'cerac-cms', audience: 'cerac-cms-clients' }
```

---

## 4. Casos de Teste

### 4.1. `generate(payload)`

- [ ] Deve retornar uma string não-vazia.
- [ ] Deve retornar um JWT com 3 segmentos (`header.payload.signature`).
- [ ] Deve retornar tokens diferentes para chamadas consecutivas (devido ao `iat`).
- [ ] Token decodado contém `sub` igual a `userId.toValue()`.
- [ ] Token decodado contém `role` igual ao role passado.
- [ ] Token decodado contém `iss` e `aud` da config.
- [ ] Token decodado contém `exp` consistente com `ttl`.
- [ ] **Não** contém `passwordHash`, `email` ou outros dados do usuário.
- [ ] Deve lançar `TokenGenerationError` quando a assinatura falha (ex: secret inválido).

### 4.2. `verify(token)`

- [ ] Deve retornar `{ sub, role }` para token válido.
- [ ] Deve normalizar `sub` para string (caso o `jose` devolva outros tipos).
- [ ] Deve lançar `InvalidTokenError` quando o token está com assinatura inválida.
- [ ] Deve lançar `InvalidTokenError` quando o token está expirado.
- [ ] Deve lançar `InvalidTokenError` quando o token foi assinado com **outro** segredo.
- [ ] Deve lançar `InvalidTokenError` quando o `iss` não bate.
- [ ] Deve lançar `InvalidTokenError` quando o `aud` não bate.
- [ ] Deve lançar `InvalidTokenError` quando o token está malformado.
- [ ] Deve lançar `InvalidTokenError` quando o payload **não** contém `sub` ou `role`.
- [ ] Deve lançar `InvalidTokenError` quando `role` não pertence ao enum `userRole`.

### 4.3. Algoritmo

- [ ] O header do token gerado contém `alg: 'HS256'`.
- [ ] `verify` **recusa** tokens com `alg: 'none'` (ataque clássico).
- [ ] `verify` **recusa** tokens com outro algoritmo que não o configurado.

### 4.4. Round-trip

- [ ] `verify(generate(payload))` retorna um payload equivalente ao original (`sub.toValue()` e `role`).

### 4.5. Garantias de segurança

- [ ] `generate` **não** loga o token gerado nem o secret.
- [ ] `verify` **não** loga o token recebido em texto plano.
- [ ] O secret nunca aparece em nenhum erro ou log.

---

## 5. Ordem TDD sugerida

1. CT01 — `generate` retorna string com 3 segmentos.
2. CT02 — Payload decodado contém `sub` e `role`.
3. CT03 — Token contém `exp` consistente com TTL.
4. CT04 — `verify(generate(p))` retorna `{ sub, role }`.
5. CT05 — `verify` lança `InvalidTokenError` para token expirado.
6. CT06 — `verify` lança `InvalidTokenError` para assinatura inválida.
7. CT07 — `verify` recusa `alg: 'none'`.
8. CT08 — `verify` recusa `iss`/`aud` errados.
9. CT09 — `generate` lança `TokenGenerationError` em falha interna.

---

## 6. Checklist final

- [ ] HS256 forçado (sem aceitar `none` ou outros algoritmos).
- [ ] TTL, issuer e audience aplicados.
- [ ] Round-trip preserva `sub` e `role`.
- [ ] `InvalidTokenError` para qualquer falha de verificação.
- [ ] `TokenGenerationError` para falha de assinatura.
- [ ] Secret nunca exposto.

---

## 7. Referências

- Porta `TokenGenerator`: [`src/application/interfaces/token-generator.ts`](../../../src/application/interfaces/token-generator.ts)
- Erro: [`src/application/erros/token-generator-error.ts`](../../../src/application/erros/token-generator-error.ts)
- Consumidor: [`AuthMiddleware`](./auth-middleware.md)
