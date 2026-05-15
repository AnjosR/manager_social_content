# Plano de Testes: ContentMapper (TDD)

---

## 1. Objetivo do mapper

Conversão bidirecional entre `Content` (entidade) e a linha persistida. Isola o schema do banco do domínio.

---

## 2. Dependências

- Nenhuma. Teste puro.

---

## 3. Massa base

```ts
const validRow = {
  id: 'cc1b0a35-2d3f-4ec6-a3a8-0c0a7d1f0e10',
  author_id: '9a11f510-56c7-41f3-b5c0-6fc52a6d4fd4',
  title: 'Mutirão de Páscoa 2026',
  description: 'Distribuição de cestas no Centro-Sul.',
  action_date: new Date('2026-04-10'),
  images_url: ['https://cdn.cerac.org/img/pascoa-1.jpg'],
}
```

---

## 4. Casos de Teste

### 4.1. `toEntity(row)`

- [ ] Deve retornar uma instância de `Content`.
- [ ] Deve preservar o `id` em `content.id.toValue()`.
- [ ] Deve preservar `authorId`, `title`, `description`, `Actiondate`, `imagesUrl`.
- [ ] `images_url` deve ser hidratado como `string[]`.
- [ ] **Não** deve invocar a validação dos VOs ao reidratar (já foram validados na escrita) — a entidade aceita os valores diretos.

### 4.2. `toPersistence(content)`

- [ ] Deve retornar objeto com todas as chaves do schema (`id`, `author_id`, `title`, `description`, `action_date`, `images_url`).
- [ ] `id` é serializado via `content.id.toValue()`.
- [ ] `action_date` é serializado como `Date` (driver converte para timestamptz).
- [ ] `images_url` é serializado como array de strings (jsonb ou `text[]`, conforme schema).
- [ ] **Não** inclui chaves além das esperadas (`props`, `_id`).

### 4.3. Round-trip

- [ ] `toEntity(toPersistence(content))` é equivalente ao original.
- [ ] `toPersistence(toEntity(row))` é equivalente à row original.

### 4.4. Edge cases

- [ ] `images_url` vazio (`[]`) é preservado em ambos os sentidos.
- [ ] Caracteres especiais e UTF-8 em `title`/`description` sobrevivem ao round-trip.

---

## 5. Ordem TDD sugerida

1. CT01 — `toEntity(row)` produz `Content` com `id` correto.
2. CT02 — `toEntity` preserva `images_url` como array.
3. CT03 — `toPersistence(content)` produz shape do schema.
4. CT04 — Round-trip equivalente.
5. CT05 — `images_url` vazio sobrevive ao round-trip.

---

## 6. Checklist final

- [ ] Conversão bidirecional sem perda.
- [ ] `id` flui via `UniqueEntityId`.
- [ ] `images_url` sempre array.
- [ ] Datas como `Date` na persistência.
- [ ] Schema do banco não vaza para o domínio.

---

## 7. Referências

- Entidade: [`src/domain/entity/content.ts`](../../../src/domain/entity/content.ts)
- Repositório: [PostgresContentRepository](./postgres-content-repository.md)
