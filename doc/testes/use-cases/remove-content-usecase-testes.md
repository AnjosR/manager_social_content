# Plano de Testes: RemoveContentUseCase (TDD)

## Dependências Necessárias (Mocks)

Para testar o `RemoveContentUseCase` isoladamente, precisamos de mocks para:

- **UserRepository**: Para buscar o usuário (editor) que está solicitando a remoção.
- **ContentRepository**: Para buscar e remover o conteúdo.

---

## Regra de Autorização

- Somente quem **publicou** o conteúdo pode removê-lo (`userId === content.authorId`).
- O usuário precisa ter a role **`ADMIN`**.
- **Ambas** as condições devem ser verdadeiras simultaneamente. Caso contrário, lança `NotAllowedError`.

---

## Casos de Teste

## Fluxo Principal (Sucesso)

- [x] Deve garantir que o `UserRepository.findById` é chamado com o `userId` normalizado.
- [x] Deve garantir que o `ContentRepository.findById` é chamado com o `contentId` normalizado.
- [x] Deve garantir que o `ContentRepository.delete` é chamado com o `contentId` normalizado quando o usuário é ADMIN e autor.
- [x] Deve garantir que o sistema retorna `removedContent`, `deletedBy` e `deletedAt` quando a remoção ocorre com sucesso.

## Fluxos de Exceção (Regras de Negócio)

- [x] Deve garantir que o sistema lança `EditorNotExistsError` quando o usuário não é encontrado.
- [x] Deve garantir que o sistema lança `ContentNotFoundError` quando o conteúdo não é encontrado.
- [x] Deve garantir que o sistema lança `NotAllowedError` quando o usuário é o autor mas **não** é ADMIN.
- [x] Deve garantir que o sistema lança `NotAllowedError` quando o usuário é ADMIN mas **não** é o autor.
- [x] Deve garantir que o sistema lança `NotAllowedError` quando o usuário não é ADMIN nem é o autor.
- [x] Deve garantir que o `ContentRepository.delete` **não** é chamado quando a autorização falha.

## Tratamento de Erros (Infraestrutura)

- [x] Deve garantir que o caso de uso repassa a exceção se o `UserRepository.findById` falhar (ex: erro de conexão com banco).
- [x] Deve garantir que o caso de uso repassa a exceção se o `ContentRepository.findById` falhar.
- [x] Deve garantir que o caso de uso repassa a exceção se o `ContentRepository.delete` falhar.

---
