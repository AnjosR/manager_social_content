# Plano de Testes: RemoveContentUseCase (TDD)

## Dependências Necessárias (Mocks)

Para testar o `RemoveContentUseCase` isoladamente, precisamos de mocks para:

- **UserRepository**: Para buscar o usuário que está solicitando a remoção.
- **ContentRepository**: Para buscar e remover o conteúdo.

---

## Regra de Autorização

A remoção é permitida quando o usuário satisfaz **pelo menos uma** das condições:

- O usuário é o **autor** do conteúdo (`user.id === content.authorId`); ou
- O usuário possui a role **`ADMIN`** (`user.role === userRole.ADMIN`).

A regra é uma **disjunção (OR)**: basta uma das condições ser verdadeira para autorizar. O erro `NotAllowedError` só é lançado quando o usuário **não é ADMIN E não é o autor**.

---

## Casos de Teste

## Fluxo Principal (Sucesso)

- [x] Deve garantir que o `UserRepository.findById` é chamado com o `userId` normalizado.
- [x] Deve garantir que o `ContentRepository.findById` é chamado com o `contentId` normalizado.
- [x] Deve garantir que o `ContentRepository.delete` é chamado com o `contentId` normalizado quando o usuário é ADMIN (sendo ou não o autor).
- [x] Deve garantir que o `ContentRepository.delete` é chamado quando o usuário é ADMIN mas **não** é o autor.
- [x] Deve garantir que o `ContentRepository.delete` é chamado quando o usuário é o autor mas **não** é ADMIN.
- [x] Deve garantir que o sistema retorna `removedContent`, `deletedBy` e `deletedAt` quando a remoção ocorre com sucesso.

## Fluxos de Exceção (Regras de Negócio)

- [x] Deve garantir que o sistema lança `EditorNotExistsError` quando o usuário não é encontrado.
- [x] Deve garantir que o sistema lança `ContentNotFoundError` quando o conteúdo não é encontrado.
- [x] Deve garantir que o sistema lança `NotAllowedError` quando o usuário **não** é ADMIN **e** **não** é o autor.
- [x] Deve garantir que o `ContentRepository.delete` **não** é chamado quando a autorização falha.

## Tratamento de Erros (Infraestrutura)

- [x] Deve garantir que o caso de uso repassa a exceção se o `UserRepository.findById` falhar (ex: erro de conexão com banco).
- [x] Deve garantir que o caso de uso repassa a exceção se o `ContentRepository.findById` falhar.
- [x] Deve garantir que o caso de uso repassa a exceção se o `ContentRepository.delete` falhar.

---
