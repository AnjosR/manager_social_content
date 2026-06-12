# Plano de Testes — Casos de Uso (Sistema ONG CERAC)

Este documento descreve o plano de testes da camada de aplicação do CMS, seguindo a Clean Architecture do projeto. Cada caso de uso é testado de forma isolada (unitária), com as portas (interfaces) substituídas por mocks.

## Índice

### Módulo de Acesso (Administradores)

- [SignUpUseCase](#signupusecase) — Cadastro de novo administrador no CMS.
- [SignInUseCase](#signinusecase) — Autenticação de administrador e geração de token de acesso.
- [SignOutUseCase](#signoutusecase) — Encerramento de sessão e invalidação do token.
- [RemoveUserUseCase](#removeuserusecase) — Remoção (soft delete) de um usuário por um administrador.

### Módulo de Conteúdo (Ações da ONG)

- [RegisterContentUseCase](#registercontentusecase) — Cadastro de uma nova ação publicada por um editor.
- [GetContentByIdUseCase](#getcontentbyidusecase) — Recupera os detalhes de uma ação pelo `id`.
- [ListContentsUseCase](#listcontentsusecase) — Lista paginada de ações para a vitrine pública.
- [UpdateContentUseCase](#updatecontentusecase) — Edição parcial de uma ação por autor ou administrador.
- [RemoveContentUseCase](#removecontentusecase) — Remoção de uma ação por um administrador autor.

---

## Convenções dos Testes

- **Framework**: [Vitest](https://vitest.dev/) com mocks gerados por [`vitest-mock-extended`](https://www.npmjs.com/package/vitest-mock-extended) (`mock<T>()` / `MockProxy<T>`).
- **SUT**: a instância do caso de uso sob teste é nomeada `sut`.
- **`beforeEach`**: monta o cenário do caminho feliz — `input` válido, mocks com retornos padrão de sucesso e instanciação do `sut`. Cada teste sobrescreve apenas o necessário (`mockResolvedValueOnce`, `mockImplementation`, etc.).
- **Agrupamento (`describe`)**: os testes são organizados em dois grupos quando aplicável:
  - **Behavior** — regras de negócio, autorização, validações, contrato de chamadas às portas e formato do retorno.
  - **Infrastructure** — propagação de falhas das portas (ex.: `DataBaseConnectionError`), garantindo que o caso de uso não as engole.
- **Tipos de asserção**:
  - _Interação_: `toHaveBeenCalledWith` / `toHaveBeenLastCalledWith` e `not.toHaveBeenCalled()` para verificar contrato com as portas.
  - _Retorno_: validação do `Output` (campos, tipos e valores).
  - _Exceção_: `rejects.toThrow(ErroEspecifico)`.
- **Normalização**: argumentos de entrada (e-mail, ids) são comparados já normalizados em seus value objects (`new Email(...)`, `new UniqueEntityId(...)`).

---

## SignUpUseCase

> Arquivo: [`test/application/sign-up-use-case.spec.ts`](../../../test/application/sign-up-use-case.spec.ts)

**Dependências mockadas**: `UserRepository`, `PasswordHasher`.

### Comportamento

| Cenário | Asserção |
| :------ | :------- |
| `findByEmail` é chamado com o e-mail normalizado | `userRepository.findByEmail` recebe `new Email(input.email)` |
| `PasswordHasher` é chamado com a senha em texto plano | `passwordHasher.hash` recebe `new Password(input.password)` |
| Um `id` é gerado para o novo usuário | `output.id` está definido e diferente de `''` |
| `save` é chamado com os dados corretos | `userRepository.save` recebe objeto com `name`, `email` e `passwordHash` |
| O usuário é salvo com `passwordHash`, nunca com a senha plana | `save` recebe `{ passwordHash }` e **não** `{ passwordHash: input.password }` |
| O retorno expõe `createdAt` como `Date` | `output.createdAt` é instância de `Date` |

### Exceções

| Cenário | Erro |
| :------ | :--- |
| `role` fora do enum `userRole` | `InvalidRoleError` |

---

## SignInUseCase

> Arquivo: [`test/application/sign-in-use-case.spec.ts`](../../../test/application/sign-in-use-case.spec.ts)

**Dependências mockadas**: `UserRepository`, `HashComparer`, `TokenGenerator`.

### Behavior

| Cenário | Asserção |
| :------ | :------- |
| `findByEmail` é chamado com o e-mail correto | recebe `new Email(input.email)` |
| `HashComparer` é chamado com senha plana e hash | `hashComparer.compare` recebe `(input.password, hashedPassword)` |
| `TokenGenerator` é chamado com o payload do usuário | `tokenGenerator.generate` recebe `{ sub: userId, role }` |
| Retorna `accessToken` para credenciais válidas | `output.accessToken === accessToken` |
| Usuário não encontrado | lança `InvalidCredentialsError` |
| Senha não confere | lança `InvalidCredentialsError` |

### Infrastructure

| Cenário | Erro propagado |
| :------ | :------------- |
| Falha em `userRepository.findByEmail` | `DataBaseConnectionError` |
| Falha em `hashComparer.compare` | `HashComparerError` |
| Falha em `tokenGenerator.generate` | `TokenGenerationError` |

---

## SignOutUseCase

> Arquivo: [`test/application/sign-out-use-case.spec.ts`](../../../test/application/sign-out-use-case.spec.ts)

**Dependências mockadas**: `TokenVerifier`, `TokenDisabler`.

### Behavior

| Cenário | Asserção |
| :------ | :------- |
| `TokenVerifier` é chamado com o token recebido | `tokenVerifier.verify` recebe `input.userToken` |
| `TokenDisabler` é chamado com o token quando a verificação passa | `tokenDisabler.disable` recebe `input.userToken` |
| Resolve quando o token é válido e desabilitado com sucesso | resolve `undefined` |
| Idempotência: resolve quando o token já está desabilitado | resolve `undefined` |
| Token inválido na verificação | lança `InvalidTokenError` |
| Não chama `TokenDisabler` quando o token é inválido | `tokenDisabler.disable` **não** é chamado |

### Infrastructure

| Cenário | Erro propagado |
| :------ | :------------- |
| Falha em `tokenDisabler.disable` | `DataBaseConnectionError` |

---

## RemoveUserUseCase

> Arquivo: [`test/application/remove-user-use-case.spec.ts`](../../../test/application/remove-user-use-case.spec.ts)

**Dependências mockadas**: `UserRepository`. Soft delete com `delete(id, date)`; `countActiveAdmins` protege a regra do último admin.

### Behavior

| Cenário | Asserção |
| :------ | :------- |
| `findById` é chamado com o `userId` normalizado (requester) | recebe `new UniqueEntityId(input.userId)` |
| `findById` é chamado com o `targetUserId` normalizado | recebe `new UniqueEntityId(input.targetUserId)` |
| ADMIN remove outro usuário → soft delete | `delete` recebe `(targetId, any Date)` |
| ADMIN remove a si mesmo havendo outros admins ativos | `delete` é chamado |
| Auto-remoção consulta `countActiveAdmins` | `countActiveAdmins` chamado 1 vez |
| Remoção de outro usuário **não** consulta `countActiveAdmins` | não chamado |
| Retorno em caso de sucesso | `removedUserId`, `deletedBy` e `deletedAt` (string de data válida) |
| Requester não encontrado | lança `EditorNotExistsError` |
| Requester não é ADMIN (ex.: EDITOR) | lança `NotAllowedError` |
| Target não encontrado (inexistente ou já removido) | lança `EditorNotExistsError` |
| ADMIN tenta auto-remoção sendo o último admin ativo | lança `LastAdminCannotBeRemovedError` |
| Não chama `delete` quando requester não é ADMIN | não chamado |
| Não chama `delete` quando target não existe | não chamado |
| Não chama `delete` quando a regra do último admin é violada | não chamado |

### Infrastructure

| Cenário | Erro propagado |
| :------ | :------------- |
| Falha em `userRepository.findById` | `DataBaseConnectionError` |
| Falha em `userRepository.countActiveAdmins` | `DataBaseConnectionError` |
| Falha em `userRepository.delete` | `DataBaseConnectionError` |

---

## RegisterContentUseCase

> Arquivo: [`test/application/register-content-use-case.spec.ts`](../../../test/application/register-content-use-case.spec.ts)

**Dependências mockadas**: `ContentRepository`, `UserRepository`. Título é único; autor precisa existir.

### Behavior

| Cenário | Asserção |
| :------ | :------- |
| `findById` é chamado com o `authorId` normalizado | recebe `new UniqueEntityId(input.authorId)` |
| `findByTitle` é chamado com o título (trim) | recebe `input.title` |
| `save` é chamado com o conteúdo criado | recebe objeto com `authorId`, `title`, `description`, `imagesUrl` |
| Retorno do conteúdo criado | `content.authorId`, `title`, `description`, `imagesUrl` corretos e `Actiondate` é `Date` |
| Autor não encontrado | lança `EditorNotExistsError` |
| Já existe conteúdo com o mesmo título | lança `InvalidContentError` |
| Não chama `findByTitle` quando o autor não existe | não chamado |
| Não chama `save` quando o autor não existe | não chamado |
| Não chama `save` quando o conteúdo já existe | não chamado |

### Infrastructure

| Cenário | Erro propagado |
| :------ | :------------- |
| Falha em `userRepository.findById` | `DataBaseConnectionError` |
| Falha em `contentRepository.findByTitle` | `DataBaseConnectionError` |
| Falha em `contentRepository.save` | `DataBaseConnectionError` |

---

## GetContentByIdUseCase

> Arquivo: [`test/application/get-content-by-id-use-case.spec.ts`](../../../test/application/get-content-by-id-use-case.spec.ts)

**Dependências mockadas**: `ContentRepository`.

### Behavior

| Cenário | Asserção |
| :------ | :------- |
| `findById` é chamado com o `contentId` normalizado | recebe `new UniqueEntityId(input.contentId)` |
| Retorna o conteúdo quando existe | `output.content === mockContent` |
| Conteúdo não encontrado | lança `ContentNotFoundError` |

### Infrastructure

| Cenário | Erro propagado |
| :------ | :------------- |
| Falha em `contentRepository.findById` | `DataBaseConnectionError` |

---

## ListContentsUseCase

> Arquivo: [`test/application/list-contents-use-case.spec.ts`](../../../test/application/list-contents-use-case.spec.ts)

**Dependências mockadas**: `ContentRepository`. Paginação validada (`page >= 1` inteiro; `1 <= limit <= 100`).

### Behavior

| Cenário | Asserção |
| :------ | :------- |
| `findAll` é chamado com `page` e `limit` | recebe `(input.page, input.limit)` |
| Retorno paginado | `items`, `total`, `page` e `limit` corretos |
| Lista vazia quando não há conteúdos | `items === []` e `total === 0` |
| `page < 1` | lança `InvalidPaginationError` |
| `page` não inteiro (ex.: `1.5`) | lança `InvalidPaginationError` |
| `limit < 1` | lança `InvalidPaginationError` |
| `limit` acima do máximo (100) | lança `InvalidPaginationError` |
| Não chama `findAll` quando a paginação é inválida | não chamado |

### Infrastructure

| Cenário | Erro propagado |
| :------ | :------------- |
| Falha em `contentRepository.findAll` | `DataBaseConnectionError` |

---

## UpdateContentUseCase

> Arquivo: [`test/application/update-content-use-case.spec.ts`](../../../test/application/update-content-use-case.spec.ts)

**Dependências mockadas**: `ContentRepository`, `UserRepository`. Atualização parcial; autoria ou ADMIN; título permanece único.

### Behavior

| Cenário | Asserção |
| :------ | :------- |
| `findById` (user) é chamado com o `userId` normalizado | recebe `new UniqueEntityId(input.userId)` |
| `findById` (content) é chamado com o `contentId` normalizado | recebe `new UniqueEntityId(input.contentId)` |
| Autor atualiza → `save` com conteúdo atualizado | recebe `title`, `description`, `imagesUrl` |
| `authorId` e `id` são preservados após a atualização | inalterados no retorno |
| Atualização parcial aplica apenas os campos informados | demais campos preservam o valor original |
| `findByTitle` é chamado quando o título muda | recebe o novo título |
| `findByTitle` **não** é chamado quando o título não vem no input | não chamado |
| Atualizar para o mesmo título não gera colisão consigo mesmo | resolve e **não** chama `findByTitle` |
| ADMIN edita conteúdo de outro autor | `save` chamado 1 vez |
| Usuário não encontrado | lança `EditorNotExistsError` |
| Conteúdo não encontrado | lança `ContentNotFoundError` |
| Usuário não é ADMIN nem autor | lança `NotAllowedError` |
| Novo título pertence a outro conteúdo | lança `InvalidContentError` |
| Não chama `save` quando a autorização falha | não chamado |
| Não chama `save` quando o novo título colide com outro conteúdo | não chamado |

### Infrastructure

| Cenário | Erro propagado |
| :------ | :------------- |
| Falha em `userRepository.findById` | `DataBaseConnectionError` |
| Falha em `contentRepository.findById` | `DataBaseConnectionError` |
| Falha em `contentRepository.findByTitle` | `DataBaseConnectionError` |
| Falha em `contentRepository.save` | `DataBaseConnectionError` |

---

## RemoveContentUseCase

> Arquivo: [`test/application/remove-content-use-case.spec.ts`](../../../test/application/remove-content-use-case.spec.ts)

**Dependências mockadas**: `ContentRepository`, `UserRepository`. Pode remover quem é ADMIN ou autor do conteúdo.

### Behavior

| Cenário | Asserção |
| :------ | :------- |
| `findById` (user) é chamado com o `userId` normalizado | recebe `new UniqueEntityId(input.userId)` |
| `findById` (content) é chamado com o `contentId` normalizado | recebe `new UniqueEntityId(input.contentId)` |
| ADMIN remove → `delete` com `contentId` normalizado | recebe `new UniqueEntityId(input.contentId)` |
| ADMIN remove conteúdo de outro autor | `delete` chamado |
| Autor (não ADMIN) remove o próprio conteúdo | `delete` chamado |
| Retorno em caso de sucesso | `removedContent`, `deletedBy` e `deletedAt` (string de data válida) |
| Usuário não encontrado | lança `EditorNotExistsError` |
| Conteúdo não encontrado | lança `ContentNotFoundError` |
| Usuário não é ADMIN nem autor | lança `NotAllowedError` |
| Não chama `delete` quando a autorização falha | não chamado |

### Infrastructure

| Cenário | Erro propagado |
| :------ | :------------- |
| Falha em `userRepository.findById` | `DataBaseConnectionError` |
| Falha em `contentRepository.findById` | `DataBaseConnectionError` |
| Falha em `contentRepository.delete` | `DataBaseConnectionError` |

---

## Referências do Projeto

- [PRD — Product Requirements Document](../../PRD.md)
- [Casos de Uso](../../feature/uc/use-case.md)
- Testes da camada de aplicação: [`test/application/`](../../../test/application/)
