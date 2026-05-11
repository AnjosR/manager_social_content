# Caso de Uso: RemoveContentUseCase

## 1. Visão Geral

Permite a remoção de uma ação (conteúdo) da vitrine pública. A remoção é permitida quando o usuário é **autor do conteúdo** **OU** possui role **`ADMIN`** — ou seja, basta uma das condições para autorizar.

## 2. Atores

- **Autor do conteúdo**: usuário autenticado cujo `id` corresponde ao `authorId` do conteúdo. Pode remover apenas o conteúdo que publicou.
- **Administrador**: usuário autenticado com role `ADMIN`. Pode remover qualquer conteúdo, sendo o autor ou não.

## 3. Pré-condições

- O `userId` precisa corresponder a um usuário existente.
- O `contentId` precisa corresponder a um conteúdo existente.
- O usuário precisa atender a **pelo menos uma** das condições:
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
4. Se **pelo menos uma** das condições for verdadeira, executa `ContentRepository.delete`.
5. Retorna `{ removedContent, deletedBy: userId, deletedAt: new Date().toISOString() }`.

## 7. Fluxos de Exceção

| Cenário                           | Erro                   |
| :-------------------------------- | :--------------------- |
| Usuário não encontrado            | `EditorNotExistsError` |
| Conteúdo não encontrado           | `ContentNotFoundError` |
| Usuário não é ADMIN nem é o autor | `NotAllowedError`      |

> A regra é **disjunção** (`OR`): a remoção só é proibida quando o usuário **não** é ADMIN **e** **não** é o autor do conteúdo.

## 8. Regras de Negócio

Regra específica deste caso de uso (não listada no PRD original):

- **RN-RC01** — Podem remover conteúdo: (a) o autor do conteúdo, ou (b) usuários com role `ADMIN`. O ADMIN pode remover qualquer conteúdo, sendo o autor ou não.

## 9. Pós-condições

- O conteúdo é removido do repositório.
- O fluxo retorna um snapshot do conteúdo removido (`removedContent`), além do `userId` que removeu (`deletedBy`) e o instante da remoção em ISO 8601 (`deletedAt`).

## 10. Referências

- Código-fonte: [`src/application/use-cases/remove-content/remove-content-use-case.ts`](../../../src/application/use-cases/remove-content/remove-content-use-case.ts)
- Testes: [`test/application/remove-content-use-case.spec.ts`](../../../test/application/remove-content-use-case.spec.ts)
- Plano de testes: [`doc/testes/use-cases-testes/remove-content-usecase-testes.md`](../../testes/use-cases-testes/remove-content-usecase-testes.md)
