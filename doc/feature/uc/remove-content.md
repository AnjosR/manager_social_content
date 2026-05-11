# Caso de Uso: RemoveContentUseCase

## 1. Visão Geral

Permite a remoção de uma ação (conteúdo) da vitrine pública. A remoção é restrita: somente um usuário com role **`ADMIN`** que **também** seja o autor do conteúdo pode executá-la.

## 2. Atores

- **Administrador autor**: usuário autenticado com role `ADMIN` que originalmente publicou o conteúdo.

## 3. Pré-condições

- O `userId` precisa corresponder a um usuário existente.
- O `contentId` precisa corresponder a um conteúdo existente.
- O usuário precisa atender simultaneamente:
  - `user.role === userRole.ADMIN`
  - `user.id === content.authorId`

## 4. Contrato

### Input

```ts
type RemoveContentInput = {
  userId: string
  contentId: string
}
```

### Output

```ts
type RemoveContentOutput = {
  removedContent: Content
  deletedBy: string
  deletedAt: string
}
```

## 5. Dependências

| Porta               | Responsabilidade                                  |
| :------------------ | :------------------------------------------------ |
| `ContentRepository` | Buscar o conteúdo pelo id e executar a remoção.   |
| `UserRepository`    | Validar a existência do usuário e obter sua role. |

## 6. Fluxo Principal

1. Busca o usuário via `UserRepository.findById(new UniqueEntityId(userId))`.
2. Busca o conteúdo via `ContentRepository.findById(new UniqueEntityId(contentId))`.
3. Avalia a autorização:
   - `isAdmin` = `user.role === userRole.ADMIN`
   - `isAuthor` = `user.id.toString() === content.authorId`
4. Se **ambas** as condições forem verdadeiras, executa `ContentRepository.delete`.
5. Retorna `{ removedContent, deletedBy: userId, deletedAt: new Date().toISOString() }`.

## 7. Fluxos de Exceção

| Cenário                                           | Erro                   |
| :------------------------------------------------ | :--------------------- |
| Usuário não encontrado                            | `EditorNotExistsError` |
| Conteúdo não encontrado                           | `ContentNotFoundError` |
| Usuário é o autor mas **não** é ADMIN             | `NotAllowedError`      |
| Usuário é ADMIN mas **não** é o autor do conteúdo | `NotAllowedError`      |
| Usuário não é ADMIN nem é o autor                 | `NotAllowedError`      |

> A regra exige **conjunção** (`AND`): basta uma das condições falhar para a remoção ser proibida.

## 8. Regras de Negócio

Regra específica deste caso de uso (não listada no PRD original):

- **RN-RC01** — Apenas usuários com role `ADMIN` que também sejam autores do conteúdo podem removê-lo.

## 9. Pós-condições

- O conteúdo é removido do repositório.
- O fluxo retorna um snapshot do conteúdo removido (`removedContent`), além do `userId` que removeu (`deletedBy`) e o instante da remoção em ISO 8601 (`deletedAt`).

## 10. Referências

- Código-fonte: [`src/application/use-cases/remove-content/remove-content-use-case.ts`](../../../src/application/use-cases/remove-content/remove-content-use-case.ts)
- Testes: [`test/application/remove-content-use-case.spec.ts`](../../../test/application/remove-content-use-case.spec.ts)
- Plano de testes: [`doc/testes/use-cases-testes/remove-content-usecase-testes.md`](../../testes/use-cases-testes/remove-content-usecase-testes.md)
