# Plano de Testes: RemoveContentController (TDD)

---

## 1. Objetivo do controller

Adaptador HTTP do `RemoveContentUseCase`.
OBS: Remove uma ação publicada quando o requisitante é **AUTOR** do conteúdo ou **ADMIN**.

Responsabilidades específicas:

- Obter `userId` do JWT (`req.user.sub`) — nunca do body/path.
- Obter `contentId` do path param (`/contents/:contentId`).
- Encaminhar ao use case.
- Retornar `200 OK` com o snapshot do conteúdo removido.
- Propagar erros ao `error-handler`.

---

## 2. Dependências (Mocks)

- **`RemoveContentUseCase`** (`MockProxy<RemoveContentUseCase>`): simular sucesso e propagar `EditorNotExistsError`, `ContentNotFoundError`, `NotAllowedError`.

---

## 3. Massa base

```ts
const authedUser = { sub: '9a11f510-56c7-41f3-b5c0-6fc52a6d4fd4', role: 'Admin' }
const contentId = 'cc1b0a35-2d3f-4ec6-a3a8-0c0a7d1f0e10'

const useCaseOutput = {
  removedContent: /* Content entity */,
  deletedBy: authedUser.sub,
  deletedAt: '2026-05-14T12:00:00.000Z',
}
```

---

## 4. Casos de Teste

### 4.1. Fluxo Principal (HTTP 200)

- [ ] Deve invocar `RemoveContentUseCase.execute` exatamente uma vez.
- [ ] Deve invocar o use case com `userId = req.user.sub` e `contentId = req.params.contentId`.
- [ ] Deve retornar `statusCode: 200` no sucesso.
- [ ] Deve retornar `{ removedContent, deletedBy, deletedAt }` no corpo (com `removedContent` serializado).

### 4.2. Autorização (mapeamento explícito)

- [ ] Deve propagar `NotAllowedError` quando o use case rejeitar (mapa esperado: 403).
- [ ] Deve propagar `EditorNotExistsError` (mapa esperado: 404).
- [ ] Deve propagar `ContentNotFoundError` (mapa esperado: 404).

> Decisão de design: `EditorNotExistsError` em rota autenticada teoricamente nunca dispara (o token foi emitido para um usuário existente). Mantemos o mapeamento por defesa em profundidade — se o usuário foi removido entre o login e a request, o 404 explicita a situação.

### 4.3. Path param

- [ ] Deve rejeitar `contentId` com formato inválido (não-UUID) — responsabilidade do schema Zod do path; o use case nem é chamado.
- [ ] Deve passar o `contentId` cru ao use case (a validação semântica acontece quando o use case cria o `UniqueEntityId`).

### 4.4. Serialização do `Content`

- [ ] `removedContent` deve ser serializado (sem expor `props`/`_id` privados).
- [ ] `deletedAt` deve sair como string ISO 8601 (já é o tipo do output do use case).

### 4.5. Garantias laterais

- [ ] O use case **não** é chamado quando o middleware rejeita a request (testar em E2E).
- [ ] Múltiplas chamadas idempotentes sobre conteúdo já removido devolvem `ContentNotFoundError` na segunda — comportamento do use case, controller só propaga.

---

## 5. Ordem TDD sugerida

1. CT01 — Retorna `200` com `{ removedContent, deletedBy, deletedAt }`.
2. CT02 — Use case é chamado com `userId = req.user.sub` e `contentId = req.params.contentId`.
3. CT03 — Propaga `NotAllowedError`.
4. CT04 — Propaga `ContentNotFoundError`.
5. CT05 — Propaga `EditorNotExistsError`.
6. CT06 — Serializa o `removedContent` sem expor internals.

---

## 6. Checklist final

- [ ] `userId` vem do JWT; `contentId` vem do path.
- [ ] Sucesso retorna `200` com snapshot do conteúdo removido.
- [ ] `403/404` saem do `error-handler`, não do controller.
- [ ] Não expõe propriedades internas do `Content`.

---

## 7. Referências

- [Caso de uso `RemoveContentUseCase`](../../feature/uc/remove-content.md)
- [Plano de testes `RemoveContentUseCase`](../use-cases/remove-content-usecase-testes.md)
- [Auth middleware](./auth-middleware.md)
- [Error handler](./error-handler.md)
