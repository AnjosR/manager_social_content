# Planos de Testes — Camada de Infraestrutura

> Projeto: Sistema ONG CERAC
> Camada: Infrastructure (adaptadores concretos)
> Stack adotada: **Fastify** + **Zod** + **jose** (JWT) + **bcrypt** + **pino** + **Prisma _ou_ SQL puro** (a decidir)

Este índice organiza os planos de teste seguindo o roadmap de implementação acordado. Cada item deve ser implementado via TDD: o `.md` define os comportamentos esperados; o `.spec.ts` traduz cada item em teste antes da implementação.

---

## Ordem TDD recomendada

### Fase 1 — Fundações HTTP

| #   | Componente                       | Plano                                          | Tipo de teste |
| --- | -------------------------------- | ---------------------------------------------- | ------------- |
| 1   | `SignInController`               | [signin-controller.md](./signin-controller.md) | Unit          |
| 2   | `Logger` (port + PinoLogger)     | [pino-logger.md](./pino-logger.md)             | Unit          |
| 3   | `error-handler` (Fastify plugin) | [error-handler.md](./error-handler.md)         | Unit          |
| 4   | Zod schemas das rotas            | [http-schemas.md](./http-schemas.md)           | Unit          |

### Fase 2 — Adaptadores de saída (ports → tech)

| #   | Componente                   | Plano                                                              | Tipo de teste |
| --- | ---------------------------- | ------------------------------------------------------------------ | ------------- |
| 5   | `BcryptHasher`               | [bcrypt-hasher.md](./bcrypt-hasher.md)                             | Integration   |
| 6   | `JwtTokenGenerator/Verifier` | [jwt-token-generator.md](./jwt-token-generator.md)                 | Integration   |
| 7   | `PostgresConnection`         | [postgres-connection.md](./postgres-connection.md)                 | Integration   |
| 8   | `UserMapper`                 | [user-mapper.md](./user-mapper.md)                                 | Unit          |
| 9   | `ContentMapper`              | [content-mapper.md](./content-mapper.md)                           | Unit          |
| 10  | `PostgresUserRepository`     | [postgres-user-repository.md](./postgres-user-repository.md)       | Integration   |
| 11  | `PostgresContentRepository`  | [postgres-content-repository.md](./postgres-content-repository.md) | Integration   |

### Fase 3 — Restante dos controllers

| #   | Componente                  | Plano                                                              | Tipo de teste |
| --- | --------------------------- | ------------------------------------------------------------------ | ------------- |
| 12  | `SignUpController`          | [signup-controller.md](./signup-controller.md)                     | Unit          |
| 13  | `AuthMiddleware`            | [auth-middleware.md](./auth-middleware.md)                         | Unit          |
| 14  | `RegisterContentController` | [register-content-controller.md](./register-content-controller.md) | Unit          |
| 15  | `RemoveContentController`   | [remove-content-controller.md](./remove-content-controller.md)     | Unit          |

### Fase 4 — Bootstrap

| #   | Componente          | Plano                              | Tipo de teste |
| --- | ------------------- | ---------------------------------- | ------------- |
| 16  | `env.ts` (config)   | [env.md](./env.md)                 | Unit          |
| 17  | Servidor HTTP (E2E) | [http-server.md](./http-server.md) | E2E           |

---

## Convenções comuns

- **Unit**: `vitest-mock-extended` mockando portas (`UserRepository`, `HashComparer`, etc.). Sem rede, sem disco.
- **Integration**: Testcontainers (Postgres real) para repositórios; sem mocks da biblioteca alvo (`bcrypt`, `jose`, `pg`).
- **E2E**: subir Fastify in-process via `app.inject(...)`. Banco real isolado por teste.
- Cada caso de teste deve mapear 1:1 para um `it(...)` no `.spec.ts` correspondente em `test/infrastructure/...`.
- Os erros de aplicação (`InvalidCredentialsError`, `EmailAlreadyExistsError`, etc.) são **lançados pelos use cases** e **mapeados a status HTTP no `error-handler`** — não dentro do controller.
- Mensagens de resposta **nunca** vazam `password`, `passwordHash`, stack trace, nomes de dependências internas ou queries SQL.

---

## Referências

- [PRD](../../PRD.md)
- [Casos de uso](../../feature/uc/README.md)
- [AGENTS.md](../../../AGENTS.md)
