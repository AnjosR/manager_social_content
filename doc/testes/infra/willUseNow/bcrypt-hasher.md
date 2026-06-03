# Plano de Testes: BcryptHasher (TDD)

---

## 1. Objetivo do adapter

Adaptador concreto para hashing/comparação de senhas usando `bcrypt`. Um único adapter implementa ambas as portas para evitar duplicação de configuração (cost factor) e simplificar a composição de dependências.

Responsabilidades específicas:

- `hash(password: Password): Promise<string>` — gera hash com fator de custo configurado por env.
- `compare(plainPassword: string, hashedPassword: string): Promise<boolean>` — compara em tempo constante.
- Lançar `HashComparerError` quando a biblioteca lança erro inesperado.

> Decisão: testar **integrado** contra `bcrypt` real. Mockar o `bcrypt` testaria apenas o mock. Os testes podem usar um cost factor reduzido (ex: 4) por env, para velocidade.

---

## 2. Dependências

- `bcrypt` (real, não mockado).
- `Password` VO (real, não mockado).
- Configuração: `BCRYPT_COST` (env), com default seguro de 10 em produção e 4 em ambiente de teste.

---

## 3. Massa base

```ts
const validPassword = new Password('SenhaForte1!')
const sut = new BcryptHasher({ cost: 4 })
```

---

## 4. Casos de Teste

### 4.1. `hash(password)`

- [ ] Deve retornar uma string não-vazia.
- [ ] Deve retornar string diferente do `password.getValue()` (o hash não é o plaintext).
- [ ] Deve retornar hashes diferentes para a mesma senha em chamadas distintas (salt aleatório).
- [ ] Deve usar o cost factor configurado — verificável pelo prefixo do hash bcrypt (`$2b$04$...` para cost 4).
- [ ] Deve lançar `HashComparerError` (ou erro derivado) quando `bcrypt.hash` lança internamente (forçar simulando ENV inválido ou stub interno — opcional).

### 4.2. `compare(plain, hash)`

- [ ] Deve retornar `true` para par válido (`hash(p)` e o próprio `p`).
- [ ] Deve retornar `false` para senha errada.
- [ ] Deve retornar `false` quando o hash não foi gerado por bcrypt (string aleatória).
- [ ] Deve retornar `false` quando o hash é string vazia.
- [ ] Deve lançar `HashComparerError` quando `bcrypt.compare` lança internamente.

### 4.3. Acoplamento com o `Password` VO

- [ ] `hash(password)` recebe o VO e usa `password.getValue()` — não usa `String(password)` nem `password.value` (privado).
- [ ] O retorno **não** depende de propriedades adicionadas no VO no futuro (testar apenas via API pública).

### 4.4. Performance/configuração

- [ ] Com `cost = 4`, um ciclo `hash + compare` completa em < 200ms (sanity-check; threshold ajustável).
- [ ] Em ambiente CI, o cost configurado vem do env (`process.env.BCRYPT_COST`).

### 4.5. Garantias de segurança

- [ ] `hash(p)` **não** loga a senha em texto plano.
- [ ] `compare(p, h)` **não** loga `p` ou `h`.
- [ ] O hash gerado nunca contém a senha como substring.

---

## 5. Ordem TDD sugerida

1. CT01 — `hash` retorna string diferente do plaintext.
2. CT02 — `compare(plain, hash(plain))` retorna `true`.
3. CT03 — `compare('wrong', hash(plain))` retorna `false`.
4. CT04 — Dois `hash(plain)` retornam strings diferentes (salt).
5. CT05 — `hash` lança `HashComparerError` em falha interna.
6. CT06 — Hash usa o cost factor configurado.

---

## 6. Checklist final

- [ ] Implementa `PasswordHasher` e `HashComparer` em uma única classe.
- [ ] Usa `bcrypt` real nos testes.
- [ ] Cost factor parametrizável via env.
- [ ] `HashComparerError` para falhas inesperadas.
- [ ] Senha em texto plano nunca aparece em log ou hash.

---

## 7. Referências

- Porta `PasswordHasher`: [`src/application/interfaces/password-hasher.ts`](../../../src/application/interfaces/password-hasher.ts)
- Porta `HashComparer`: [`src/application/interfaces/hash-comparer.ts`](../../../src/application/interfaces/hash-comparer.ts)
- Erro: [`src/application/erros/hash-comparer-error.ts`](../../../src/application/erros/hash-comparer-error.ts)
- VO: [`src/domain/value-objects/password.ts`](../../../src/domain/value-objects/password.ts)
