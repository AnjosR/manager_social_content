# Plano de Testes: PostgresUserRepository (TDD)

> Projeto: Sistema ONG CERAC
> Camada: Infraestrutura / Persistência
> Componente: `PostgresUserRepository` — implementa `UserRepository`
> Tipo de teste: **Integration** (Postgres real)

---

## 1. Objetivo do repositório

Adaptador concreto que persiste e busca `User` no Postgres. Implementa o contrato definido em [`UserRepository`](../../../src/application/interfaces/repositories/user-repository.ts).

Responsabilidades específicas:

- `save(user)` — INSERT (não há `update` no contrato atual).
- `findById(userId)` — SELECT por PK.
- `findByEmail(email)` — SELECT por e-mail (já normalizado pelo VO).
- Devolve **entidades**, nunca rows.

---

## 2. Dependências

- `PostgresConnection` (real).
- `UserMapper` (real).
- Schema `users` previamente migrado.

---

## 3. Massa base

```ts
const user = new User({
  name: 'João da Silva',
  email: 'joao@cerac.org',
  passwordHash: '$2b$10$hash',
  role: userRole.EDITOR,
  createdAt: new Date('2026-05-14T12:00:00Z'),
})
```

Antes de cada teste: **truncar** `users` (ou rollback em transação por teste).

---

## 4. Casos de Teste

### 4.1. `save(user)`

- [ ] Deve persistir a linha com `id` igual a `user.id.toValue()`.
- [ ] Deve persistir todos os campos: `name`, `email`, `passwordHash`, `role`, `createdAt`.
- [ ] Deve persistir `email` normalizado (lowercase) — VO já garante; teste confirma.
- [ ] Deve lançar `DataBaseConnectionError` em falha de I/O.
- [ ] **Decisão**: comportamento em violação de unique (`email`):
  - Opção A: lança erro propagado (`DataBaseConnectionError` ou um `UniqueViolationError` específico).
  - Opção B: o use case já filtra via `findByEmail` antes de `save`, então o repositório pode propagar erro cru.
  - **Recomendação**: propagar erro tipado (`DataBaseConnectionError` ou novo `UniqueConstraintError`) para defesa em profundidade. Documentar a escolha aqui.

### 4.2. `findById(userId)`

- [ ] Deve retornar `User` quando existe.
- [ ] Deve retornar `null` quando não existe (não lançar).
- [ ] Deve retornar entidade hidratada via `UserMapper.toEntity` (com `UniqueEntityId` correto).
- [ ] Aceita `UniqueEntityId` como parâmetro (não string crua).

### 4.3. `findByEmail(email)`

- [ ] Deve retornar `User` quando o e-mail existe (case-insensitive — VO normaliza).
- [ ] Deve retornar `null` quando não existe.
- [ ] Aceita `Email` VO como parâmetro (não string crua).
- [ ] Deve usar query parametrizada (anti-injection); validar com `email = "' OR 1=1 --"` (após normalização do VO, a string entra como literal segura).

### 4.4. Integridade dos dados retornados

- [ ] `passwordHash` retornado é exatamente o que foi salvo (sem transformação).
- [ ] `role` retornado é o enum, não string crua.
- [ ] `createdAt` retornado é uma `Date` equivalente à salva (até precisão de timestamptz).

### 4.5. Concorrência

- [ ] Dois `save` em paralelo com `id`s diferentes não causam deadlock.
- [ ] Dois `save` com mesmo `email` em paralelo: um sucede, outro falha (constraint do banco).

### 4.6. Erros

- [ ] Quando `PostgresConnection.query` lança, `findById` propaga `DataBaseConnectionError`.
- [ ] Mesmo para `findByEmail` e `save`.

---

## 5. Ordem TDD sugerida

1. CT01 — `save` + `findById` round-trip preserva o `User`.
2. CT02 — `findById` retorna `null` quando não existe.
3. CT03 — `findByEmail` retorna `User` por e-mail normalizado.
4. CT04 — `findByEmail` retorna `null` quando não existe.
5. CT05 — `save` lança `DataBaseConnectionError` em falha de I/O.
6. CT06 — Violação de unique em `email` é tratada explicitamente.
7. CT07 — Queries são parametrizadas (anti-injection).

---

## 6. Checklist final

- [ ] Implementa todos os métodos de `UserRepository`.
- [ ] Sempre devolve entidades, nunca rows.
- [ ] Aceita VOs (`UniqueEntityId`, `Email`) como argumento.
- [ ] Usa `UserMapper` para round-trip.
- [ ] Erros tipados (`DataBaseConnectionError`).
- [ ] Queries parametrizadas.

---

## 7. Referências

- Porta: [`src/application/interfaces/repositories/user-repository.ts`](../../../src/application/interfaces/repositories/user-repository.ts)
- Entidade: [`src/domain/entity/user.ts`](../../../src/domain/entity/user.ts)
- Mapper: [UserMapper](./user-mapper.md)
- Conexão: [PostgresConnection](./postgres-connection.md)
