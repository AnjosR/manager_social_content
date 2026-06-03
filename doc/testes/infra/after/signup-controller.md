# Plano de Testes: SignUpController (TDD)

---

## 1. Objetivo do controller

Adaptador HTTP do `SignUpUseCase`. Recebe a requisição de cadastro de administrador (Admin ou Editor), delega ao use case e traduz o resultado em resposta HTTP.

Responsabilidades específicas:

- Encaminhar `name`, `email`, `password` e `role` ao `SignUpUseCase` (a validação de presença/tipo é do schema Zod da rota; a semântica fica nos VOs).
- Retornar `201 Created` com `{ id, name, createdAt }` no sucesso.
- Nunca vazar `password`, `passwordHash` ou metadados sensíveis.
- Deixar o mapeamento de erros para o `error-handler` central (não tratar `try/catch` localmente).

---

## 2. Dependências (Mocks)

- **`SignUpUseCase`** (`MockProxy<SignUpUseCase>`): simular sucesso e propagação dos erros (`EmailAlreadyExistsError`, `InvalidRoleError`, `InvalidEmailError`, `InvalidNameError`, `InvalidPasswordError`).

---

## 3. Massa base

```ts
const validBody = {
  name: 'João da Silva',
  email: 'joao@cerac.org',
  password: 'SenhaForte1!',
  role: 'Editor',
}

const useCaseOutput = {
  id: '9a11f510-56c7-41f3-b5c0-6fc52a6d4fd4',
  name: 'João da Silva',
  createdAt: new Date('2026-05-14T12:00:00Z'),
}
```

---

## 4. Casos de Teste

### 4.1. Fluxo Principal (HTTP 201)

- [ ] Deve invocar `SignUpUseCase.execute` exatamente uma vez.
- [ ] Deve invocar `SignUpUseCase.execute` com `name`, `email`, `password` e `role` exatamente como recebidos no `body`.
- [ ] Deve retornar `statusCode: 201` no sucesso.
- [ ] Deve retornar `id`, `name` e `createdAt` no corpo da resposta.
- [ ] Deve garantir que o corpo de sucesso **não** contém `password`, `passwordHash` ou `role` (output do use case já segue essa regra; o controller não pode reintroduzi-los).

### 4.2. Propagação de erros (delegada ao error-handler)

> O controller **não deve** capturar nenhum desses erros — apenas propagar. Estes testes garantem propagação correta; o mapeamento status↔erro é coberto em [error-handler.md](./error-handler.md).

- [ ] Deve propagar `EmailAlreadyExistsError` quando lançado pelo use case (mapa esperado: 409).
- [ ] Deve propagar `InvalidRoleError` (mapa esperado: 400).
- [ ] Deve propagar `InvalidEmailError`, `InvalidNameError`, `InvalidPasswordError` (mapa esperado: 400).
- [ ] Deve propagar qualquer `Error` desconhecido (mapa esperado: 500).
- [ ] Deve garantir que o controller **não** captura nenhuma exceção (não envolve a chamada em `try/catch`).

### 4.3. Garantias de segurança

- [ ] `password` em texto plano **nunca** aparece em payload de resposta de sucesso.
- [ ] `passwordHash` **nunca** aparece em payload de resposta de sucesso.
- [ ] `role` (decisão de design): se exposto, deve ser apenas o valor canônico do enum, sem detalhes internos.

### 4.4. Idempotência e efeitos colaterais

- [ ] Múltiplas chamadas com o mesmo `body` invocam o use case **n** vezes (idempotência é responsabilidade do use case, não do controller).
- [ ] O controller não faz I/O direto: nenhuma escrita em log/banco fora da chamada ao use case.

---

## 5. Ordem TDD sugerida

1. CT01 — Retorna `201` com `{ id, name, createdAt }` no sucesso.
2. CT02 — Invoca o use case com `name`, `email`, `password`, `role` exatos.
3. CT03 — Não inclui `password`/`passwordHash` na resposta de sucesso.
4. CT04 — Propaga `EmailAlreadyExistsError`.
5. CT05 — Propaga `InvalidRoleError` e demais `Invalid*Error`.
6. CT06 — Propaga `Error` genérico.

---

## 6. Checklist final

- [ ] Sucesso retorna `201` (não `200`) — é criação.
- [ ] Sucesso devolve `{ id, name, createdAt }` (exatamente o `SignUpOutput`).
- [ ] Nunca vaza `password`/`passwordHash`.
- [ ] Não captura erros; sempre propaga.
- [ ] Use case é chamado com os mesmos campos recebidos no body (sem transformação).

---

## 7. Referências

- [Caso de uso `SignUpUseCase`](../../feature/uc/sign-up.md)
- [Plano de testes `SignUpUseCase`](../use-cases/signup-usecase-teste.md)
- [Error handler](./error-handler.md)
- [HTTP schemas (Zod)](./http-schemas.md)
