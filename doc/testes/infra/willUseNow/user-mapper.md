# Plano de Testes: UserMapper (TDD)

> Projeto: Sistema ONG CERAC
> Camada: Infraestrutura / Persistência / Mappers
> Componente: `UserMapper`
> Tipo de teste: **Unit** (puro, sem banco)

---

## 1. Objetivo do mapper

Conversão bidirecional entre a entidade de domínio `User` e a linha persistida no banco. Isola o domínio do schema, evitando que renomeações de colunas vazem para a regra de negócio.

Responsabilidades específicas:

- `toEntity(row): User` — recebe a linha (snake_case ou camelCase, conforme decisão de banco) e devolve a entidade reconstituída com o `UniqueEntityId` correto.
- `toPersistence(user): UserRow` — converte a entidade para o shape esperado pelo repositório.

> Decisão pendente (Prisma vs SQL puro): com Prisma, o tipo `UserRow` é o `User` gerado pelo Prisma (camelCase). Com SQL puro, define-se um tipo `UserRow` em `persistence/postgres/types.ts` (snake_case). O mapper isola essa decisão.

---

## 2. Dependências

- Nenhuma. Teste puro.

---

## 3. Massa base

```ts
const validRow = {
  id: '9a11f510-56c7-41f3-b5c0-6fc52a6d4fd4',
  name: 'João da Silva',
  email: 'joao@cerac.org',
  password_hash: '$2b$10$abc...', // ou passwordHash, conforme schema
  role: 'Editor',
  created_at: new Date('2026-05-14T12:00:00Z'),
}

const validUser = new User(
  {
    name: 'João da Silva',
    email: 'joao@cerac.org',
    passwordHash: '$2b$10$abc...',
    role: userRole.EDITOR,
    createdAt: new Date('2026-05-14T12:00:00Z'),
  },
  new UniqueEntityId('9a11f510-56c7-41f3-b5c0-6fc52a6d4fd4'),
)
```

---

## 4. Casos de Teste

### 4.1. `toEntity(row)`

- [ ] Deve retornar uma instância de `User`.
- [ ] Deve preservar o `id` do row em `user.id.toValue()`.
- [ ] Deve preservar `name`, `email`, `passwordHash`, `createdAt`.
- [ ] Deve converter `role` string para o enum `userRole` correto.
- [ ] Deve lançar erro quando `role` da row não bate com nenhum valor do enum (linha corrompida no banco).
- [ ] Deve lançar erro quando `id` da row é inválido (não-UUID) — apenas se a regra exigir UUID.
- [ ] **Não** deve invocar validação do `Email` VO ao reidratar (já foi validado na escrita).

### 4.2. `toPersistence(user)`

- [ ] Deve retornar um objeto com todas as chaves do schema (`id`, `name`, `email`, `password_hash`/`passwordHash`, `role`, `created_at`/`createdAt`).
- [ ] `id` é serializado via `user.id.toValue()`.
- [ ] `role` é serializado como string (`'Admin'` / `'Editor'`).
- [ ] `createdAt` é um `Date` (não string ISO — driver converte).
- [ ] **Não** inclui chaves além das esperadas pelo schema (`props`, `_id`).

### 4.3. Round-trip

- [ ] `toEntity(toPersistence(user))` produz uma entidade equivalente (mesmo `id`, mesmos campos).
- [ ] `toPersistence(toEntity(row))` produz uma row equivalente.

### 4.4. Edge cases

- [ ] `toEntity` rejeita row com chaves obrigatórias ausentes (`name`, `email`, etc.).
- [ ] `toEntity` aceita `createdAt` como string ISO (caso o driver não converta) — opcional.

---

## 5. Ordem TDD sugerida

1. CT01 — `toEntity(row)` produz `User` com `id` correto.
2. CT02 — `toEntity(row)` mapeia `role` string → enum.
3. CT03 — `toPersistence(user)` produz objeto com chaves do schema.
4. CT04 — Round-trip `toEntity(toPersistence(user))` é equivalente.
5. CT05 — `toEntity` rejeita `role` inválido.

---

## 6. Checklist final

- [ ] Conversão bidirecional sem perda.
- [ ] `id` flui via `UniqueEntityId` em ambos os sentidos.
- [ ] `role` é enum no domínio, string na persistência.
- [ ] Schema do banco não vaza para o domínio.
- [ ] Sem efeitos colaterais; teste puro.

---

## 7. Referências

- Entidade: [`src/domain/entity/user.ts`](../../../src/domain/entity/user.ts)
- Repositório: [PostgresUserRepository](./postgres-user-repository.md)
