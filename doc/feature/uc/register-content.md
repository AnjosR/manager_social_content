# Caso de Uso: RegisterContentUseCase

## 1. Visão Geral

Permite que um colaborador autenticado registre uma nova ação da ONG (conteúdo) no CMS. O caso de uso valida a existência do autor, normaliza os dados de entrada, impede duplicidade de título e persiste o conteúdo associado ao seu autor.

## 2. Atores

- **Colaborador autenticado** (Admin ou Editor): autor do conteúdo a ser publicado.

## 3. Pré-condições

- O `authorId` precisa corresponder a um usuário existente no sistema.
- Os dados de entrada precisam ser válidos segundo as regras dos value objects (`Title`, `Description`, `ActionDate`, `ImagesURL`).
- Não pode existir outro conteúdo com o mesmo `title`.

## 4. Contrato

### Input

```ts
type RegisterContentInput = {
  authorId: string
  title: string
  description: string
  actionDate: string
  imagesURL: string[]
}
```

### Output

```ts
type RegisterContentOutput = {
  content: Content
}
```

## 5. Dependências

| Porta               | Responsabilidade                                        |
| :------------------ | :------------------------------------------------------ |
| `ContentRepository` | Verificar duplicidade de título e persistir o conteúdo. |
| `UserRepository`    | Validar a existência do autor pelo `authorId`.          |

## 6. Fluxo Principal

1. Verifica se o autor existe via `UserRepository.findById(new UniqueEntityId(authorId))`.
2. Normaliza `title`, `description`, `actionDate` e `imagesURL` instanciando seus value objects.
3. Consulta `ContentRepository.findByTitle` com o título normalizado.
4. Cria a entidade `Content` com `authorId` e os valores normalizados.
5. Persiste o conteúdo via `ContentRepository.save`.
6. Retorna `{ content }`.

## 7. Fluxos de Exceção

| Cenário                                             | Erro                      |
| :-------------------------------------------------- | :------------------------ |
| Autor não encontrado pelo `authorId`                | `EditorNotExistsError`    |
| Título inválido (regras do `Title`)                 | `InvalidTitleError`       |
| Descrição inválida (regras do `Description`)        | `InvalidDescriptionError` |
| Data inválida ou no futuro (regras do `ActionDate`) | `InvalidActionDateError`  |
| URLs inválidas ou fora dos limites (`ImagesURL`)    | `InvalidImageUrlError`    |
| Já existe conteúdo com o mesmo título               | `InvalidContentError`     |

> A verificação do autor ocorre **antes** das normalizações: se o autor não existe, o fluxo é abortado imediatamente (fail-fast).

## 8. Regras de Negócio

- **RN01** — Título obrigatório com mínimo de 5 caracteres.
- **RN02** — Descrição obrigatória, sem ser apenas espaços.
- **RN03** — Data válida e não futura.
- **RN04** — Mínimo de 1 imagem.
- **RN05** — Máximo de 6 imagens (limite atual da `ImagesURL`).

## 9. Pós-condições

- Um novo registro de `Content` está persistido com `authorId` apontando para o usuário criador.
- O título do conteúdo é único no repositório.

## 10. Referências

- Código-fonte: [`src/application/use-cases/register-content/register-content-use-case.ts`](../../../src/application/use-cases/register-content/register-content-use-case.ts)
- Testes: [`test/application/register-content-use-case.spec.ts`](../../../test/application/register-content-use-case.spec.ts)
- Plano de testes: [`doc/testes/use-cases-testes/register-content-usecase-testes.md`](../../testes/use-cases-testes/register-content-usecase-testes.md)
- Diagrama: [`doc/diagrams/Register-Content-use-case.jpeg`](../../diagrams/Register-Content-use-case.jpeg)
