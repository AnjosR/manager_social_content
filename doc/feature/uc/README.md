# Casos de Uso — Sistema ONG CERAC

Esta pasta documenta cada caso de uso da camada de aplicação do CMS, seguindo a Clean Architecture do projeto.

## Índice

### Módulo de Acesso (Administradores)

- [SignUpUseCase](./sign-up.md) — Cadastro de novo administrador no CMS.
- [SignInUseCase](./sign-in.md) — Autenticação de administrador e geração de token de acesso.
- [RemoveUserUseCase](./remove-user.md) — Remoção (soft delete) de um usuário por um administrador.

### Módulo de Conteúdo (Ações da ONG)

- [RegisterContentUseCase](./register-content.md) — Cadastro de uma nova ação publicada por um editor.
- [RemoveContentUseCase](./remove-content.md) — Remoção de uma ação por um administrador autor.

---

## Convenções dos Documentos

Cada caso de uso é documentado com a seguinte estrutura:

- **Visão Geral**: objetivo do caso de uso.
- **Atores**: quem dispara o fluxo.
- **Pré-condições**: o que precisa ser verdade antes da execução.
- **Contrato**: tipos de `Input` e `Output`.
- **Dependências**: portas (interfaces) que o caso de uso consome.
- **Fluxo Principal**: caminho feliz, passo a passo.
- **Fluxos de Exceção**: erros possíveis e quando ocorrem.
- **Regras de Negócio**: RNs aplicáveis (ver [PRD](../../PRD.md)).
- **Pós-condições**: estado do sistema após a execução com sucesso.
- **Referências**: caminhos para o código-fonte e testes.

---

## Referências do Projeto

- [PRD — Product Requirements Document](../../PRD.md)
- [Plano de Testes dos Casos de Uso](../../testes/use-cases-testes/)
