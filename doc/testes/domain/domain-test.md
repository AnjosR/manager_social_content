# Plano de Testes — Camada de Domínio (Sistema ONG CERAC)

Este documento descreve o plano de testes da camada de domínio do CMS, seguindo a Clean Architecture do projeto. São testados os **Value Objects**, que encapsulam as regras de validação e normalização de dados primitivos, garantindo que um objeto inválido nunca chegue a existir.

## Índice

### Value Objects

- [Email](#email) — Normaliza e valida endereços de e-mail. Detalhe: [`email.test.md`](./email.test.md).
- [Name](#name) — Valida o nome de usuário (tamanho mínimo útil). Detalhe: [`name.test.md`](./name.test.md).
- [Password](#password) — Valida tamanho e complexidade da senha. Detalhe: [`password.test.md`](./password.test.md).

---

## Convenções dos Testes

- **Framework**: [Vitest](https://vitest.dev/).
- **SUT**: a instância do value object sob teste é nomeada `sut`.
- **Tabelas de casos (`it.each`)**: as entradas inválidas são exercidas em lote com `it.each([...])`, cobrindo várias variações de uma mesma regra em um único teste parametrizado.
- **Construtor como validador**: a validação ocorre no construtor; portanto, criar uma instância inválida deve lançar — `expect(() => new VO(valor)).toThrow(ErroEspecifico)`.
- **Normalização**: a entrada é normalizada antes da validação (`trim`, e `toLowerCase` no caso do `Email`). O caminho feliz assevera o valor já normalizado via `getValue()`.
- **Erros de domínio**: cada value object lança um erro próprio e específico (`InvalidEmailError`, `InvalidNameError`, `InvalidPasswordError`).

---

## Email

> Arquivo: [`test/domain/Email.spec.ts`](../../../test/domain/Email.spec.ts) · Código-fonte: [`src/domain/value-objects/email.ts`](../../../src/domain/value-objects/email.ts)

**Regra**: a entrada sofre `trim()` + `toLowerCase()` e é validada contra a regex de e-mail. Em caso de falha, lança `InvalidEmailError`.

### Cenários inválidos (`it.each`)

Cada entrada abaixo deve lançar `InvalidEmailError`:

| Entrada | Motivo da rejeição |
| :------ | :----------------- |
| `joedoe@.com` | domínio começa com ponto |
| `@domain.com` | sem parte local |
| `joe@doe` | sem TLD |
| `joe doe@test.com` | espaço na parte local |
| `joe@.com.` | domínio inválido / ponto final |
| `joe@doe..com` | pontos consecutivos no domínio |
| `joe@doe.c` | TLD com 1 caractere (mínimo 2) |
| `plainaddress` | sem `@` nem domínio |
| `joe@doe@test.com` | dois `@` |
| `` (string vazia) | entrada vazia |

### Caminho feliz

| Cenário | Asserção |
| :------ | :------- |
| E-mail válido (`joe@doe.com`) | cria a instância e `sut.getValue()` retorna o e-mail |

---

## Name

> Arquivo: [`test/domain/Name.spec.ts`](../../../test/domain/Name.spec.ts) · Código-fonte: [`src/domain/value-objects/name.ts`](../../../src/domain/value-objects/name.ts)

**Regra**: a entrada sofre `trim()` e deve ter pelo menos **3 caracteres** (`MIN_CHARACTERS`). Caso contrário, lança `InvalidNameError`.

### Cenários inválidos (`it.each`)

Cada entrada abaixo deve lançar `InvalidNameError`:

| Entrada | Motivo da rejeição |
| :------ | :----------------- |
| `` (string vazia) | 0 caracteres |
| `  ` (apenas espaços) | após `trim`, fica vazio |
| `ab` | apenas 2 caracteres (abaixo do mínimo) |

### Caminho feliz

| Cenário | Asserção |
| :------ | :------- |
| Nome válido (`Joe Doe`) | cria a instância e `sut.getValue()` retorna o nome |

---

## Password

> Arquivo: [`test/domain/Password.spec.ts`](../../../test/domain/Password.spec.ts) · Código-fonte: [`src/domain/value-objects/password.ts`](../../../src/domain/value-objects/password.ts)

**Regra**: a entrada sofre `trim()` e é validada por regex que exige **7 a 72 caracteres** e a presença de, no mínimo, uma letra minúscula, uma maiúscula, um dígito e um caractere especial. Caso contrário, lança `InvalidPasswordError`.

### Cenários inválidos (`it.each`)

Cada entrada abaixo deve lançar `InvalidPasswordError`:

| Entrada | Motivo da rejeição |
| :------ | :----------------- |
| `` (string vazia) | tamanho abaixo do mínimo |
| `1234567` | sem letras nem caractere especial |
| `a`.repeat(73) | acima do tamanho máximo (72) |
| `senhasemletramaiuscula1!` | sem letra maiúscula |
| `SENHASEMLETRAMINUSCULA1!` | sem letra minúscula |
| `SenhaSemNumero!` | sem dígito |
| `SenhaSemEspecial123` | sem caractere especial |
| `        ` (apenas espaços) | após `trim`, fica vazio |
| `   aB3!   ` | após `trim`, fica abaixo do mínimo |

### Caminho feliz

| Cenário | Asserção |
| :------ | :------- |
| Senha no tamanho mínimo (`J0eDo3.`) | cria a instância; `getValue()` retorna o valor |
| Senha no tamanho máximo (72 caracteres) | cria a instância; `getValue()` retorna o valor |
| Senha com espaço válido no meio (`J0eD@3 example`) | cria a instância; `getValue()` preserva o espaço interno |

---

## Referências do Projeto

- [PRD — Product Requirements Document](../../PRD.md)
- [Plano de Testes dos Casos de Uso](../use-cases/test-use-case.md)
- Testes da camada de domínio: [`test/domain/`](../../../test/domain/)
- Detalhamento por value object: [`email.test.md`](./email.test.md), [`name.test.md`](./name.test.md), [`password.test.md`](./password.test.md)
