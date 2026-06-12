# Plano de Testes: SignOutUseCase (TDD)

## Dependências Necessárias (Mocks)

Para testar o `SignOutUseCase` isoladamente, precisamos de mocks para:

- **TokenVerifier**: Para validar a autenticidade do token (assinatura, formato, expiração).
- **TokenDisabler**: Para desativar o token (idempotente).

---

## Casos de Teste

## Fluxo Principal (Sucesso)

- [ ] Deve garantir que o `TokenVerifier.verify` é chamado com o token recebido.
- [ ] Deve garantir que o `TokenDisabler.disable` é chamado com o token quando a verificação passa.
- [ ] Deve garantir sucesso (não lançar) quando o token é válido e foi desativado.
- [ ] Deve garantir sucesso (não lançar) quando o token já estava desativado (idempotência).

## Fluxos de Exceção (Regras de Negócio)

- [ ] Deve garantir que o sistema lança `InvalidTokenError` quando o `TokenVerifier.verify` falha.
- [ ] Deve garantir que o `TokenDisabler.disable` não é chamado quando o token é inválido.

## Tratamento de Erros (Infraestrutura)

- [ ] Deve garantir que o caso de uso repassa (lança) a exceção se o `TokenDisabler` falhar por motivo não-idempotente (ex: erro de conexão).

---
