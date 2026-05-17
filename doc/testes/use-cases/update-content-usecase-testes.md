# Plano de Testes: UpdateContentUseCase (TDD)

## Dependências Necessárias (Mocks)

- **UserRepository**: Para validar a existência e a role do usuário.
- **ContentRepository**: Para buscar conteúdo, validar unicidade de título e persistir.

---

## Regras de Autorização

- A edição é permitida quando o usuário satisfaz **pelo menos uma** das condições:
  - O usuário é o **autor** do conteúdo (`user.id === content.authorId`).
  - O usuário possui a role **`ADMIN`**.
- Mesma regra disjuntiva (OR) usada em `RemoveContentUseCase`.

## Regras de Edição

- Update parcial: apenas os campos enviados no input são atualizados; `authorId` e `id` nunca mudam.
- Campos enviados são validados pelos value objects (`Title`, `Description`, `ActionDate`, `ImagesURL`).
- Se o novo título for diferente do atual, é checada a unicidade via `ContentRepository.findByTitle`. Conflito com outro `id` → `InvalidContentError`.
- Atualizar para o mesmo título atual **não** dispara verificação de unicidade.

---

## Casos de Teste

## Fluxo Principal (Sucesso)

- [x] Deve garantir que `UserRepository.findById` é chamado com o `userId` normalizado.
- [x] Deve garantir que `ContentRepository.findById` é chamado com o `contentId` normalizado.
- [x] Deve garantir que `ContentRepository.save` é chamado com o conteúdo atualizado quando o requester é o autor.
- [x] Deve garantir que `authorId` e `id` do conteúdo são preservados após a atualização.
- [x] Deve garantir que apenas os campos enviados são atualizados (update parcial).
- [x] Deve garantir que `ContentRepository.findByTitle` é chamado quando o título muda.
- [x] Deve garantir que `ContentRepository.findByTitle` **não** é chamado quando o título não está no input.
- [x] Deve garantir que atualizar para o mesmo título atual não dispara verificação de unicidade.
- [x] Deve garantir que um ADMIN pode editar conteúdo de outro autor.

## Fluxos de Exceção (Regras de Negócio)

- [x] Deve garantir que o sistema lança `EditorNotExistsError` quando o usuário não é encontrado.
- [x] Deve garantir que o sistema lança `ContentNotFoundError` quando o conteúdo não é encontrado.
- [x] Deve garantir que o sistema lança `NotAllowedError` quando o usuário não é ADMIN nem é o autor.
- [x] Deve garantir que o sistema lança `InvalidContentError` quando o novo título já pertence a outro conteúdo.
- [x] Deve garantir que `ContentRepository.save` **não** é chamado quando a autorização falha.
- [x] Deve garantir que `ContentRepository.save` **não** é chamado quando o novo título colide com outro conteúdo.

## Tratamento de Erros (Infraestrutura)

- [x] Deve garantir que o caso de uso repassa a exceção se `UserRepository.findById` falhar.
- [x] Deve garantir que o caso de uso repassa a exceção se `ContentRepository.findById` falhar.
- [x] Deve garantir que o caso de uso repassa a exceção se `ContentRepository.findByTitle` falhar.
- [x] Deve garantir que o caso de uso repassa a exceção se `ContentRepository.save` falhar.

---
