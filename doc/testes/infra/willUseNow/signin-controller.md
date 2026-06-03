# Plano de Testes: SignInController (TDD)

> Projeto: Sistema ONG CERAC
> Camada: Infraestrutura / Adaptadores HTTP
> Controller: `SignInController`

---

## 1. Objetivo do controller

O `SignInController` é o adaptador HTTP responsável por receber a requisição de autenticação, delegar a execução ao `SignInUseCase` e traduzir o resultado (sucesso ou erro) em uma resposta HTTP adequada.

Suas responsabilidades específicas:

- Validar a presença e o formato bruto dos campos do corpo da requisição (`email` e `password`).
- Invocar o `SignInUseCase` com os dados recebidos.
- Mapear o retorno em uma resposta HTTP com status code e payload corretos.
- Traduzir erros de domínio/aplicação em respostas HTTP semânticas (`400`, `401`, `500`).
- Não vazar informações sensíveis (senha, hash, stack trace, detalhes internos) na resposta.

---

## 2. Dependências Necessárias (Mocks)

Para testar o `SignInController` isoladamente, precisamos de mocks para:

- **SignInUseCase**: para simular sucesso, falhas de credenciais e exceções inesperadas.
- **Validator / Schema de entrada** (caso exista um adaptador de validação dedicado): para simular entradas malformadas.
- **Logger** (se utilizado pelo controller): para verificar que erros inesperados são registrados, sem expor dados sensíveis.

---

## 3. Massa base para os testes

```ts
const validRequest = {
  body: {
    email: 'admin@cerac.org',
    password: 'SenhaForte123!',
  },
}
```

---

## 4. Casos de Teste

### 4.1. Fluxo Principal (Sucesso — HTTP 200)

- [ ] Deve garantir que o `SignInUseCase.execute` é chamado **exatamente uma vez**.
- [ ] Deve garantir que o `SignInUseCase.execute` é chamado com `email` e `password` exatamente como recebidos no corpo da requisição.
- [ ] Deve garantir que o controller retorna status HTTP `200` quando as credenciais são válidas.
- [ ] Deve garantir que o corpo da resposta de sucesso contém o `accessToken` retornado pelo `SignInUseCase`.
- [ ] Deve garantir que o corpo da resposta **não** contém `password`, `passwordHash`, `id` ou qualquer dado sensível do usuário.
- [ ] Deve garantir que o `Content-Type` da resposta é `application/json` (caso aplicável ao adaptador HTTP em uso).

---

### 4.2. Validação de Entrada (HTTP 400 — Bad Request)

Estes testes garantem que o controller rejeita requisições malformadas **antes** de invocar o caso de uso.

#### Campo `email`

- [ ] Deve retornar `400` quando o campo `email` está ausente do corpo.
- [ ] Deve retornar `400` quando o campo `email` é uma string vazia.
- [ ] Deve retornar `400` quando o campo `email` contém apenas espaços em branco.
- [ ] Deve retornar `400` quando o campo `email` não é do tipo `string` (ex: número, objeto, array, `null`).
- [ ] Deve retornar `400` quando o `email` está em formato inválido (ex: `admin`, `admin@`, `@cerac.org`).

#### Campo `password`

- [ ] Deve retornar `400` quando o campo `password` está ausente do corpo.
- [ ] Deve retornar `400` quando o campo `password` é uma string vazia.
- [ ] Deve retornar `400` quando o campo `password` não é do tipo `string`.

#### Corpo da requisição

- [ ] Deve retornar `400` quando o corpo da requisição está ausente.
- [ ] Deve retornar `400` quando o corpo da requisição é um objeto vazio (`{}`).

#### Garantias laterais

- [ ] Deve garantir que o `SignInUseCase.execute` **não** é chamado quando a validação de entrada falha.
- [ ] Deve garantir que o corpo da resposta `400` contém uma mensagem de erro descritiva, sem expor detalhes internos do sistema.

---

### 4.3. Falhas de Autenticação (HTTP 401 — Unauthorized)

Estes testes garantem o mapeamento correto do `InvalidCredentialsError` para resposta HTTP.

- [ ] Deve retornar `401` quando o `SignInUseCase.execute` lança `InvalidCredentialsError` (e-mail inexistente).
- [ ] Deve retornar `401` quando o `SignInUseCase.execute` lança `InvalidCredentialsError` (senha incorreta).
- [ ] Deve garantir que a mensagem de erro retornada é **genérica** (ex: "Credenciais inválidas"), sem indicar se o e-mail existe ou se foi a senha que errou.
- [ ] Deve garantir que a resposta `401` **não** contém `accessToken`, dados do usuário ou stack trace.

---

### 4.4. Erros de Domínio Mapeados como Validação (HTTP 400)

Caso o controller delegue a validação semântica do e-mail ao value object via use case:

- [ ] Deve retornar `400` quando o `SignInUseCase.execute` lança `InvalidEmailError`.
- [ ] Deve garantir que o corpo da resposta contém a mensagem do `InvalidEmailError`.
- [ ] Deve garantir que a resposta de `InvalidEmailError` **não** é confundida com `401` (não pode vazar diferença entre formato inválido e credencial inválida apenas quando isso possa ser explorado para enumeração).

> Observação: caso a política do projeto seja tratar `InvalidEmailError` como `401` para evitar enumeração, este bloco deve ser ajustado para refletir essa decisão. Em qualquer cenário, o comportamento deve ser **consistente e documentado**.

---

### 4.5. Tratamento de Erros Inesperados (HTTP 500 — Internal Server Error)

Estes testes garantem a robustez do controller diante de falhas de infraestrutura.

- [ ] Deve retornar `500` quando o `SignInUseCase.execute` lança uma exceção genérica (`Error`) não prevista.
- [ ] Deve retornar `500` quando o `SignInUseCase.execute` lança um erro relacionado ao `UserRepository` (ex: falha de conexão com banco).
- [ ] Deve retornar `500` quando o `SignInUseCase.execute` lança um erro relacionado ao `HashComparer`.
- [ ] Deve retornar `500` quando o `SignInUseCase.execute` lança um erro relacionado ao `TokenGenerator`.
- [ ] Deve garantir que o corpo da resposta `500` contém uma mensagem genérica (ex: "Erro interno do servidor"), **sem expor**:
  - stack trace
  - mensagem original da exceção
  - nomes de dependências internas (banco, biblioteca de hash, etc.)
  - dados do usuário
- [ ] Deve garantir que o erro inesperado é registrado no `Logger` (caso o controller dependa de um), incluindo informações suficientes para depuração interna.
- [ ] Deve garantir que o `Logger` **não** registra a senha em texto plano.

---

### 4.6. Garantias de Segurança

- [ ] Deve garantir que a senha em texto plano **nunca** aparece em nenhum payload de resposta (sucesso ou erro).
- [ ] Deve garantir que o `passwordHash` **nunca** aparece em nenhum payload de resposta.
- [ ] Deve garantir que, em respostas de erro `401`, não é possível distinguir entre "e-mail inexistente" e "senha incorreta" a partir do payload ou do status code.
- [ ] Deve garantir que cabeçalhos sensíveis (se aplicável ao framework HTTP em uso) seguem a política do projeto (ex: ausência de `X-Powered-By`).

---

### 4.7. Idempotência e Efeitos Colaterais

- [ ] Deve garantir que múltiplas chamadas idênticas ao controller produzem o mesmo comportamento (em termos de status e estrutura de payload), considerando que o token pode variar.
- [ ] Deve garantir que requisições inválidas **não** disparam efeitos colaterais (ex: gravação em banco, geração de token, escrita em cache).

---

## 5. Ordem sugerida para implementação via TDD

Uma boa ordem para implementar os testes é começar pelo fluxo feliz e depois cobrir os fluxos de exceção, do mais simples ao mais complexo.

1. CT01 — Deve autenticar com credenciais válidas e retornar `200` com `accessToken`.
2. CT02 — Deve invocar o `SignInUseCase.execute` com os dados corretos.
3. CT03 — Deve retornar `400` quando `email` está ausente ou vazio.
4. CT04 — Deve retornar `400` quando `password` está ausente ou vazio.
5. CT05 — Deve retornar `400` quando `email` está em formato inválido.
6. CT06 — Deve retornar `401` quando `SignInUseCase` lança `InvalidCredentialsError`.
7. CT07 — Deve garantir mensagem genérica em `401` (não enumerar usuários).
8. CT08 — Deve retornar `500` quando o `SignInUseCase` lança exceção inesperada.
9. CT09 — Deve garantir que `password` nunca aparece em nenhuma resposta.
10. CT10 — Deve garantir que o `SignInUseCase` não é chamado quando a validação de entrada falha.

---

## 6. Checklist final do SignInController

- [ ] Valida presença de `email` e `password` no corpo.
- [ ] Valida tipos de `email` e `password`.
- [ ] Valida formato do `email`.
- [ ] Invoca o `SignInUseCase` apenas com entradas válidas.
- [ ] Retorna `200` com `accessToken` no sucesso.
- [ ] Retorna `400` para entradas malformadas.
- [ ] Retorna `401` para credenciais inválidas, com mensagem genérica.
- [ ] Retorna `500` para erros inesperados, sem vazar detalhes.
- [ ] Nunca expõe `password`, `passwordHash` ou dados sensíveis.
- [ ] Não revela diferença entre e-mail inexistente e senha incorreta.
- [ ] Registra erros inesperados no `Logger` (sem dados sensíveis).
- [ ] Não dispara efeitos colaterais em requisições inválidas.
- [ ] Propaga corretamente o ciclo de vida das exceções (sem engolir erros silenciosamente).

---

## 7. Referências

- [Caso de Uso: SignInUseCase](../../feature/uc/sign-in.md)
- [Plano de Testes: SignInUseCase](./signin-usecase-testes.md)
- [PRD — Product Requirements Document](../../PRD.md)
