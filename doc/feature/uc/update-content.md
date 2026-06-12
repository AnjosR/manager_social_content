# Caso de Uso: UpdateContentUseCase

## 1. Visão Geral

Permite atualizar (parcialmente) uma ação (`Content`) já registrada. A autorização segue a mesma regra de `RemoveContentUseCase`: **autor OU ADMIN**.

## 2. Atores

- **Autor do conteúdo** (autenticado): pode editar apenas os conteúdos que publicou.
- **Administrador** (`role === ADMIN`): pode editar qualquer conteúdo.

## 3. Pré-condições

- O `userId` precisa corresponder a um usuário ativo.
- O `contentId` precisa corresponder a um conteúdo existente.
- O usuário precisa atender a **pelo menos uma** das condições:
  - `user.role === userRole.ADMIN`
  - `user.id === content.authorId`
- Cada campo fornecido deve respeitar as regras dos value objects.

## 4. Contrato

### Input

```ts
type UpdateContentInput = {
  userId: string
  contentId: string
  title?: string
  description?: string
  actionDate?: string
  imagesURL?: string[]
}
```

### Output

```ts
type UpdateContentOutput = {
  content: Content
}
```

> Update parcial: apenas os campos enviados são modificados. `authorId` e `id` nunca mudam.

## 5. Dependências

| Porta               | Responsabilidade                                                 |
| :------------------ | :--------------------------------------------------------------- |
| `ContentRepository` | Buscar conteúdo, validar unicidade do novo título e persistir.   |
| `UserRepository`    | Validar a existência do usuário e obter sua role para autorizar. |

## 6. Fluxo Principal

1. Busca o usuário via `UserRepository.findById(userId)`.
2. Busca o conteúdo via `ContentRepository.findById(contentId)`.
3. Avalia autorização: `isAdmin = user.role === ADMIN`, `isAuthor = user.id === content.authorId`. Exige `isAdmin || isAuthor`.
4. Normaliza apenas os campos enviados via seus value objects (`Title`, `Description`, `ActionDate`, `ImagesURL`); os ausentes herdam os valores atuais do conteúdo.
5. Se o título normalizado for **diferente** do atual, consulta `ContentRepository.findByTitle(newTitle)`. Se existir um conteúdo com esse título e `id` diferente, lança `InvalidContentError`.
6. Constrói novo `Content` com `id` e `authorId` preservados, demais campos atualizados.
7. Persiste via `ContentRepository.save`.
8. Retorna `{ content }`.

## 7. Fluxos de Exceção

| Cenário                                             | Erro                      |
| :-------------------------------------------------- | :------------------------ |
| Usuário não encontrado                              | `EditorNotExistsError`    |
| Conteúdo não encontrado                             | `ContentNotFoundError`    |
| Usuário não é ADMIN nem é o autor                   | `NotAllowedError`         |
| Título inválido (regras do `Title`)                 | `InvalidTitleError`       |
| Descrição inválida (regras do `Description`)        | `InvalidDescriptionError` |
| Data inválida ou no futuro (regras do `ActionDate`) | `InvalidActionDateError`  |
| URLs inválidas ou fora dos limites (`ImagesURL`)    | `InvalidImageUrlError`    |
| Novo título já em uso por outro conteúdo            | `InvalidContentError`     |

## 8. Regras de Negócio

- **RN01–RN05** — as regras de validação de `Title`, `Description`, `ActionDate` e `ImagesURL` aplicam-se aos campos enviados.
- **RN-UC01** — Edição é permitida apenas para o autor do conteúdo ou para usuários com `role === ADMIN` (mesma disjunção de `RemoveContentUseCase`).
- **RN-UC02** — Atualizar para o mesmo título atual **não** dispara verificação de unicidade.

## 9. Pós-condições

- O conteúdo é persistido com os campos atualizados; `id` e `authorId` permanecem inalterados.
- O título resultante é único no repositório.

## 10. Referências

- Código-fonte: [`src/application/use-cases/update-content/update-content-use-case.ts`](../../../src/application/use-cases/update-content/update-content-use-case.ts)
- Testes: [`test/application/update-content-use-case.spec.ts`](../../../test/application/update-content-use-case.spec.ts)
- Plano de testes: [`doc/testes/use-cases/update-content-usecase-testes.md`](../../testes/use-cases/update-content-usecase-testes.md)
