# Caso de Uso: SignInUseCase

## 1. Visão Geral

Autentica um administrador previamente cadastrado e gera um token de acesso para uso nas rotas protegidas do CMS. Em caso de credenciais inválidas, devolve um erro genérico para evitar enumeração de usuários.

## 2. Atores

- **Colaborador (não autenticado)**: informa e-mail e senha para obter o token.

## 3. Pré-condições

- O usuário deve estar previamente cadastrado (via `SignUpUseCase`).
- O e-mail informado deve possuir formato válido.

## 4. Contrato

### Input

```ts
type SignInInput = {
  email: string
  password: string
}
```

### Output

```ts
type SignInOutput = {
  accessToken: string
}
```

## 5. Dependências

| Porta            | Responsabilidade                                              |
| :--------------- | :------------------------------------------------------------ |
| `UserRepository` | Buscar usuário pelo e-mail.                                   |
| `HashComparer`   | Comparar a senha em texto plano com o hash armazenado.        |
| `TokenGenerator` | Gerar o token de acesso a partir do `id` e `role` do usuário. |

## 6. Fluxo Principal

1. Normaliza o e-mail instanciando o value object `Email`.
2. Consulta `UserRepository.findByEmail` com o e-mail normalizado.
3. Compara a senha informada com `user.passwordHash` via `HashComparer.compare`.
4. Gera o token via `TokenGenerator.generate({ sub: user.id, role: user.role })`.
5. Retorna `{ accessToken }`.

## 7. Fluxos de Exceção

| Cenário                              | Erro                      |
| :----------------------------------- | :------------------------ |
| E-mail inválido (regras do `Email`)  | `InvalidEmailError`       |
| Usuário não encontrado para o e-mail | `InvalidCredentialsError` |
| Senha não confere com `passwordHash` | `InvalidCredentialsError` |

> Tanto "usuário inexistente" quanto "senha incorreta" lançam o **mesmo** erro (`InvalidCredentialsError`) para não revelar quais e-mails estão cadastrados.

## 8. Regras de Negócio

- **RN08** — A senha nunca trafega ou é armazenada em texto plano; a comparação é feita exclusivamente contra o `passwordHash`.

## 9. Pós-condições

- Em caso de sucesso, o usuário recebe um `accessToken` válido contendo `sub` (id do usuário) e `role`.
- Nenhum estado é alterado no `UserRepository`.

## 10. Referências

- Código-fonte: [`src/application/use-cases/sign-in/sign-in-use-case.ts`](../../../src/application/use-cases/sign-in/sign-in-use-case.ts)
- Testes: [`test/application/sign-in-use-case.spec.ts`](../../../test/application/sign-in-use-case.spec.ts)
- Plano de testes: [`doc/testes/use-cases-testes/signin-usecase-testes.md`](../../testes/use-cases-testes/signin-usecase-testes.md)
