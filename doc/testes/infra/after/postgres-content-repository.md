# Plano de Testes: PostgresContentRepository (TDD)

> Projeto: Sistema ONG CERAC
> Camada: Infraestrutura / Persistência
> Componente: `PostgresContentRepository` — implementa `ContentRepository`
> Tipo de teste: **Integration** (Postgres real)

---

## 1. Objetivo do repositório

Adaptador concreto que persiste, busca e remove `Content` no Postgres. Implementa o contrato definido em [`ContentRepository`](../../../src/application/interfaces/repositories/content-repository.ts).

Responsabilidades específicas:

- `save(content)` — INSERT.
- `findById(id)` — SELECT por PK.
- `findByTitle(title)` — SELECT por título (regra de unicidade de título do PRD).
- `delete(id)` — DELETE por PK.

---

## 2. Dependências

- `PostgresConnection` (real).
- `ContentMapper` (real).
- Schema `contents` (e `users` para FK de `author_id`).

---

## 3. Massa base

```ts
const content = new Content({
  authorId: '9a11f510-56c7-41f3-b5c0-6fc52a6d4fd4',
  title: 'Mutirão de Páscoa 2026',
  description: 'Distribuição de cestas no Centro-Sul.',
  Actiondate: new Date('2026-04-10'),
  imagesUrl: ['https://cdn.cerac.org/img/pascoa-1.jpg'],
})
```

Antes de cada teste: truncar `contents` (e `users` se necessário, mantendo um usuário-âncora para satisfazer a FK).

---

## 4. Casos de Teste

### 4.1. `save(content)`

- [ ] Deve persistir a linha com `id` igual a `content.id.toValue()`.
- [ ] Deve persistir todos os campos: `authorId`, `title`, `description`, `Actiondate`, `imagesUrl`.
- [ ] Deve persistir `imagesUrl` como `text[]` ou `jsonb` (conforme schema final).
- [ ] Deve lançar `DataBaseConnectionError` em falha de I/O.
- [ ] Comportamento em violação de FK (`author_id` inexistente): propagar erro tipado. O use case já filtra via `findById` no `UserRepository`, mas o repositório protege em profundidade.

### 4.2. `findById(id)`

- [ ] Deve retornar `Content` hidratado quando existe.
- [ ] Deve retornar `null` quando não existe.
- [ ] Aceita `UniqueEntityId` como parâmetro.

### 4.3. `findByTitle(title)`

- [ ] Deve retornar `Content` quando existe.
- [ ] Deve retornar `null` quando não existe.
- [ ] Aceita `string` (não VO) — o contrato atual assim define.
- [ ] **Não** depende de case sensitivity definida no schema — alinhar com a decisão (ex: `lower(title)` index). Documentar.

### 4.4. `delete(id)`

- [ ] Deve remover a linha existente; `findById` posterior retorna `null`.
- [ ] Deletar `id` inexistente **não** lança (idempotente) — alinhar com expectativa do `RemoveContentUseCase`.
- [ ] Aceita `UniqueEntityId` como parâmetro.

### 4.5. Integridade dos dados

- [ ] `imagesUrl` retornado preserva ordem dos elementos.
- [ ] `Actiondate` retornado é equivalente à `Date` salva (até precisão do tipo de coluna).
- [ ] Caracteres especiais em `title`/`description` sobrevivem ao round-trip.

### 4.6. Concorrência

- [ ] Dois `save` paralelos com `id`s diferentes não causam deadlock.
- [ ] Dois `save` com mesmo `title` em paralelo: comportamento dependente do índice unique. Documentar.

### 4.7. Erros

- [ ] `save`, `findById`, `findByTitle`, `delete` propagam `DataBaseConnectionError` em falha de I/O.

---

## 5. Ordem TDD sugerida

1. CT01 — `save` + `findById` round-trip preserva o `Content`.
2. CT02 — `findById` retorna `null` quando não existe.
3. CT03 — `findByTitle` retorna `Content` por título.
4. CT04 — `delete(id)` remove a linha; `findById` posterior retorna `null`.
5. CT05 — `delete(idInexistente)` não lança.
6. CT06 — `imagesUrl` preserva ordem no round-trip.
7. CT07 — `save` lança `DataBaseConnectionError` em falha de I/O.

---

## 6. Checklist final

- [ ] Implementa todos os métodos de `ContentRepository`.
- [ ] Sempre devolve entidades, nunca rows.
- [ ] Aceita `UniqueEntityId` onde aplicável.
- [ ] Usa `ContentMapper`.
- [ ] `delete` é idempotente.
- [ ] Erros tipados.

---

## 7. Referências

- Porta: [`src/application/interfaces/repositories/content-repository.ts`](../../../src/application/interfaces/repositories/content-repository.ts)
- Entidade: [`src/domain/entity/content.ts`](../../../src/domain/entity/content.ts)
- Mapper: [ContentMapper](./content-mapper.md)
- Conexão: [PostgresConnection](./postgres-connection.md)
