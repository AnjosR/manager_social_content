# Caso de Uso: SignUpUseCase

## 1. Visão Geral

Permite o cadastro de um novo administrador (Admin ou Editor) no CMS da ONG CERAC. O caso de uso valida e normaliza os dados de entrada, impede duplicidade por e-mail, transforma a senha em hash seguro e persiste o usuário.

## 2. Atores

- **Colaborador (não autenticado)**: dispara o cadastro inicial via formulário público de criação de conta.

## 3. Pré-condições

- O e-mail informado **não** pode estar cadastrado no sistema.
- Os dados (`name`, `email`, `password`, `role`) precisam ser válidos segundo as regras de domínio.

## 4. Contrato

### Input

```ts
type SignUpInput = {
  name: string
  email: string
  password: string
  role: string
}
```

### Output

```ts
type SignUpOutput = {
  id: string
  name: string
  createdAt: Date
}
```

> Observação: o retorno **não expõe** `password` nem `passwordHash`.

## 5. Dependências

| Porta            | Responsabilidade                                  |
| :--------------- | :------------------------------------------------ |
| `UserRepository` | Buscar usuário por e-mail e persistir o cadastro. |
| `PasswordHasher` | Gerar o hash seguro da senha em texto plano.      |

## 6. Fluxo Principal

1. Normaliza `name`, `email` e `password` instanciando seus value objects.
2. Consulta `UserRepository.findByEmail` com o e-mail normalizado.
3. Gera o `passwordHash` chamando `PasswordHasher.hash`.
4. Captura `createdAt` com a data atual.
5. Valida que `role` pertence ao enum `userRole`.
6. Cria a entidade `User` com os dados normalizados.
7. Persiste o usuário via `UserRepository.save`.
8. Retorna `{ id, name, createdAt }`.

## 7. Fluxos de Exceção

| Cenário                               | Erro                      |
| :------------------------------------ | :------------------------ |
| Nome inválido (regras do `Name`)      | `InvalidNameError`        |
| E-mail inválido (regras do `Email`)   | `InvalidEmailError`       |
| Senha inválida (regras do `Password`) | `InvalidPasswordError`    |
| E-mail já cadastrado                  | `EmailAlreadyExistsError` |
| Role fora dos valores de `userRole`   | `InvalidRoleError`        |

## 8. Regras de Negócio

- **RN07** — E-mail único: não permitir dois administradores com o mesmo e-mail.
- **RN08** — Senha segura: tamanho mínimo e armazenamento via hash (nunca em texto plano).
- **RN09** — Nome válido: mínimo de 3 caracteres úteis.

## 9. Pós-condições

- Um novo registro de `User` está persistido com `passwordHash` (não com a senha plana).
- O `id` retornado é único e gerado pela entidade.

## 10. Referências

- Código-fonte: [`src/application/use-cases/sign-up/sign-up-use-case.ts`](../../../src/application/use-cases/sign-up/sign-up-use-case.ts)
- Testes: [`test/application/sign-up-use-case.spec.ts`](../../../test/application/sign-up-use-case.spec.ts)
- Plano de testes: [`doc/testes/use-cases-testes/signup-usecase-teste.md`](../../testes/use-cases-testes/signup-usecase-teste.md)
