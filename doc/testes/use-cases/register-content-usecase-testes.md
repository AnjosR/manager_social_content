# Plano de Testes: RegisterContentUseCase (TDD)

## Dependências Necessárias (Mocks)

Para testar o `RegisterContentUseCase` isoladamente, precisamos de mocks para:

- **UserRepository**: Para verificar se o autor (editor) realmente existe.
- **ContentRepository**: Para verificar duplicidade de título e persistir o conteúdo.

---

## Regras de Negócio

- O `authorId` informado deve corresponder a um usuário existente. Caso contrário, lança `EditorNotExistsError`.
- Não é permitido cadastrar dois conteúdos com o mesmo título. Caso contrário, lança `InvalidContentError`.
- Os value objects (`Title`, `Description`, `ActionDate`, `ImagesURL`) garantem a validação dos dados de entrada.

---

## Casos de Teste

## Fluxo Principal (Sucesso)

- [x] Deve garantir que o `UserRepository.findById` é chamado com o `authorId` normalizado.
- [x] Deve garantir que o `ContentRepository.findByTitle` é chamado com o título normalizado.
- [x] Deve garantir que o `ContentRepository.save` é chamado com o conteúdo criado contendo `authorId`, `title`, `description` e `imagesUrl`.
- [x] Deve garantir que o sistema retorna o conteúdo criado com o `authorId` recebido na entrada.

## Fluxos de Exceção (Regras de Negócio)

- [x] Deve garantir que o sistema lança `EditorNotExistsError` quando o autor não é encontrado.
- [x] Deve garantir que o sistema lança `InvalidContentError` quando já existe conteúdo com o mesmo título.
- [x] Deve garantir que o `ContentRepository.findByTitle` **não** é chamado quando o autor não existe.
- [x] Deve garantir que o `ContentRepository.save` **não** é chamado quando o autor não existe.
- [x] Deve garantir que o `ContentRepository.save` **não** é chamado quando já existe conteúdo com o mesmo título.

## Tratamento de Erros (Infraestrutura)

- [x] Deve garantir que o caso de uso repassa a exceção se o `UserRepository.findById` falhar (ex: erro de conexão com banco).
- [x] Deve garantir que o caso de uso repassa a exceção se o `ContentRepository.findByTitle` falhar.
- [x] Deve garantir que o caso de uso repassa a exceção se o `ContentRepository.save` falhar.

---
