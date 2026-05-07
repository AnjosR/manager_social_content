# Plano de Testes: SignInUseCase (TDD)

## Dependências Necessárias (Mocks)

Para testar o `SignInUseCase` isoladamente, precisamos de mocks para:

- **UserRepository**: Para buscar o usuário por e-mail.
- **HashComparer**: Para validar a senha.
- **TokenGenerator**: Para criar o token de acesso.

---

## Casos de Teste

## Fluxo Principal (Sucesso)

- [x] Deve garantir que o `UserRepository.findByEmail` é chamado com o e-mail correto.
- [x] Deve garantir que o `HashComparer.compare` é chamado com a senha em texto plano correta e a senha criptografada vinda do banco.
- [x] Deve garantir que o `TokenGenerator.generate` é chamado com o ID do usuário correto.
- [x] Deve garantir que o sistema retorna um token de acesso válido quando as credenciais estão corretas.

## Fluxos de Exceção (Regras de Negócio)

- [x] Deve garantir que o sistema retorna um erro de "Credenciais Inválidas" (ou similar) se o e-mail não existir.
- [x] Deve garantir que o sistema retorna um erro de "Credenciais Inválidas" (ou similar) se a senha estiver incorreta.

## Tratamento de Erros (Infraestrutura)

- [x] Deve garantir que o caso de uso repassa (lança) a exceção se o `UserRepository` falhar (ex: erro de conexão com banco).
- [x] Deve garantir que o caso de uso repassa (lança) a exceção se o `HashComparer` falhar.
- [xs] Deve garantir que o caso de uso repassa (lança) a exceção se o `TokenGenerator` falhar.

---
