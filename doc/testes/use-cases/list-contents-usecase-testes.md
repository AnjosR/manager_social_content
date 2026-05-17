# Plano de Testes: ListContentsUseCase (TDD)

## Dependências Necessárias (Mocks)

- **ContentRepository**: Para retornar a página de conteúdos e o total.

---

## Regras de Validação

- `page` deve ser um inteiro `>= 1`.
- `limit` deve ser um inteiro `>= 1` e `<= 100`.

---

## Casos de Teste

## Fluxo Principal (Sucesso)

- [x] Deve garantir que `ContentRepository.findAll` é chamado com `page` e `limit` recebidos no input.
- [x] Deve garantir que o sistema retorna `items`, `total`, `page` e `limit`.
- [x] Deve garantir que o sistema retorna uma lista vazia quando não há conteúdos.

## Fluxos de Exceção (Regras de Negócio)

- [x] Deve garantir que o sistema lança `InvalidPaginationError` quando `page < 1`.
- [x] Deve garantir que o sistema lança `InvalidPaginationError` quando `page` não é inteiro.
- [x] Deve garantir que o sistema lança `InvalidPaginationError` quando `limit < 1`.
- [x] Deve garantir que o sistema lança `InvalidPaginationError` quando `limit` excede o máximo permitido (`100`).
- [x] Deve garantir que `ContentRepository.findAll` **não** é chamado quando a paginação é inválida.

## Tratamento de Erros (Infraestrutura)

- [x] Deve garantir que o caso de uso repassa a exceção se `ContentRepository.findAll` falhar.

---
