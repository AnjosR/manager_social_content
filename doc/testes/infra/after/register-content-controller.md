# Plano de Testes: RegisterContentController (TDD)

---

## 1. Objetivo do controller

Adaptador HTTP do `RegisterContentUseCase`. Recebe os dados de uma nova ação da ONG e a persiste por meio do use case.

Responsabilidades específicas:

- Obter `authorId` **do payload do JWT** (`req.user.sub`), **nunca** do body. Isso evita que um usuário publique em nome de outro.
- Encaminhar `title`, `description`, `actionDate`, `imagesURL` ao use case.
- Retornar `201 Created` com o conteúdo criado.
- Não tratar erros localmente — propagar ao `error-handler`.

---

## 2. Dependências (Mocks)

- **`RegisterContentUseCase`** (`MockProxy<RegisterContentUseCase>`): simular sucesso e propagar `EditorNotExistsError`, `InvalidContentError`, `InvalidTitleError`, `InvalidDescriptionError`, `InvalidActionDateError`, `InvalidImageUrlError`.

---

## 3. Massa base

```ts
const authedUser = { sub: '9a11f510-56c7-41f3-b5c0-6fc52a6d4fd4', role: 'Editor' }

const validBody = {
  title: 'Mutirão de Páscoa 2026',
  description: 'Distribuição de cestas no Centro-Sul.',
  actionDate: '2026-04-10',
  imagesURL: ['https://cdn.cerac.org/img/pascoa-1.jpg'],
}
```

---

## 4. Casos de Teste

### 4.1. Fluxo Principal (HTTP 201)

- [ ] Deve invocar `RegisterContentUseCase.execute` exatamente uma vez.
- [ ] Deve invocar o use case com `authorId` igual a `req.user.sub` — **não** a um valor vindo do body.
- [ ] Deve invocar o use case com `title`, `description`, `actionDate`, `imagesURL` exatamente como no body.
- [ ] Deve retornar `statusCode: 201` no sucesso.
- [ ] Deve retornar uma representação serializável do `Content` no corpo (ex: `{ id, title, description, actionDate, imagesUrl, authorId }`).

### 4.2. Autorização e identidade (acoplamento ao AuthMiddleware)

- [ ] Se `req.user` não estiver presente, deve falhar antes de invocar o use case (na prática isso é garantido pelo middleware; o controller pode assumir `req.user` definido, mas o teste documenta o contrato).
- [ ] Se o body trouxer um campo `authorId`, ele deve ser **ignorado** — o controller usa apenas `req.user.sub`.

### 4.3. Propagação de erros

- [ ] Deve propagar `EditorNotExistsError` (mapa esperado: 404).
- [ ] Deve propagar `InvalidContentError` (mapa esperado: 409).
- [ ] Deve propagar `InvalidTitleError`, `InvalidDescriptionError`, `InvalidActionDateError`, `InvalidImageUrlError` (mapa esperado: 400).
- [ ] Deve propagar `Error` genérico (mapa esperado: 500).

### 4.4. Serialização do `Content`

- [ ] O `Content` retornado pelo use case é uma **entidade**; o controller deve serializá-lo (id como string via `.toValue()`, datas em ISO 8601, etc.) — definir um `ContentPresenter` se necessário.
- [ ] A resposta **não** vaza propriedades internas (`props`, `_id` privado) — apenas o shape público definido.

### 4.5. Garantias laterais

- [ ] O use case **não** é chamado quando a validação do schema Zod falha (responsabilidade do hook de validação da rota, mas verificável em E2E).
- [ ] Múltiplas chamadas com o mesmo body invocam o use case **n** vezes (idempotência fica com o use case via `findByTitle`).

---

## 5. Ordem TDD sugerida

1. CT01 — Retorna `201` com o `Content` criado.
2. CT02 — Use case é chamado com `authorId = req.user.sub`.
3. CT03 — `authorId` do body é ignorado.
4. CT04 — Use case é chamado com `title/description/actionDate/imagesURL` exatos.
5. CT05 — Propaga `EditorNotExistsError`.
6. CT06 — Propaga `InvalidContentError`.
7. CT07 — Propaga `Invalid*Error` (VOs).
8. CT08 — Serializa o `Content` sem expor internals.

---

## 6. Checklist final

- [ ] `authorId` vem do JWT, nunca do body.
- [ ] Sucesso retorna `201` com a representação do `Content`.
- [ ] Não captura erros.
- [ ] Não expõe `passwordHash`, `props`, nem propriedades privadas do `Content`.
- [ ] Schema Zod cobre presença/tipo de cada campo (cf. [http-schemas.md](./http-schemas.md)).

---

## 7. Referências

- [Caso de uso `RegisterContentUseCase`](../../feature/uc/register-content.md)
- [Plano de testes `RegisterContentUseCase`](../use-cases/register-content-usecase-testes.md)
- [Auth middleware](./auth-middleware.md)
- [Error handler](./error-handler.md)
- [HTTP schemas (Zod)](./http-schemas.md)
