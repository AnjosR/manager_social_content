# Plano de Testes: GetContentByIdUseCase (TDD)

## Dependências Necessárias (Mocks)

- **ContentRepository**: Para buscar o conteúdo pelo `id`.

---

## Casos de Teste

## Fluxo Principal (Sucesso)

- [x] Deve garantir que `ContentRepository.findById` é chamado com o `contentId` normalizado.
- [x] Deve garantir que o sistema retorna o conteúdo quando encontrado.

## Fluxos de Exceção (Regras de Negócio)

- [x] Deve garantir que o sistema lança `ContentNotFoundError` quando o conteúdo não é encontrado.

## Tratamento de Erros (Infraestrutura)

- [x] Deve garantir que o caso de uso repassa a exceção se `ContentRepository.findById` falhar.

---
