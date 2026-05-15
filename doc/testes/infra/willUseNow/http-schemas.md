# Plano de Testes: HTTP Schemas (Zod)

> Projeto: Sistema ONG CERAC
> Camada: Infraestrutura / Validação de entrada
> Componente: schemas Zod das rotas

---

## 1. Objetivo dos schemas

Validar **forma bruta** do body, params e query antes que a request chegue ao controller. Garantem que:

- Campos obrigatórios estão presentes.
- Tipos primitivos estão corretos.
- Não há campos extras (modo estrito).
- A semântica de domínio (regras de negócio) **não** é validada aqui — isso é responsabilidade dos Value Objects no use case.

Decisão de design: **schemas Zod são reaproveitados como source-of-truth do tipo TS** (`z.infer<...>`). Cada controller importa o tipo do schema correspondente.

---

## 2. Schemas por rota

| Rota                          | Schema                      | Camada validada |
| ----------------------------- | --------------------------- | --------------- |
| `POST /auth/sign-in`          | `signInBodySchema`          | body            |
| `POST /auth/sign-up`          | `signUpBodySchema`          | body            |
| `POST /contents`              | `registerContentBodySchema` | body            |
| `DELETE /contents/:contentId` | `removeContentParamsSchema` | params          |

---

## 3. Casos de Teste

### 3.1. `signInBodySchema`

- [ ] Rejeita `body` ausente.
- [ ] Rejeita `body` vazio (`{}`).
- [ ] Rejeita ausência de `email`.
- [ ] Rejeita ausência de `password`.
- [ ] Rejeita `email` não-string.
- [ ] Rejeita `password` não-string.
- [ ] Rejeita `email` em string vazia.
- [ ] Rejeita `password` em string vazia.
- [ ] **Não** valida formato semântico de `email` (regex) — isso é do `Email` VO.
- [ ] Rejeita campos extras (`strict()`).
- [ ] Aceita body válido (`{ email: 'a@b.c', password: 'x' }`).

### 3.2. `signUpBodySchema`

- [ ] Rejeita ausência de qualquer campo obrigatório: `name`, `email`, `password`, `role`.
- [ ] Rejeita tipos incorretos para cada campo.
- [ ] `role` é tipado como `z.enum(['Admin', 'Editor'])` — rejeita outros valores.
- [ ] Rejeita campos extras.
- [ ] Aceita body válido.

### 3.3. `registerContentBodySchema`

- [ ] Rejeita ausência de `title`, `description`, `actionDate`, `imagesURL`.
- [ ] `imagesURL` é `z.array(z.string())` — rejeita não-array, rejeita itens não-string.
- [ ] Aceita `imagesURL` vazio (mas a regra de negócio "mínimo 1" fica no VO `ImagesURL`).
- [ ] **Não** valida formato de URL — fica no VO.
- [ ] **Não** valida data não-futura — fica no VO.
- [ ] Rejeita `authorId` se vier no body — campo **proibido** (vem do JWT). Modo `strict()` garante.
- [ ] Aceita body válido.

### 3.4. `removeContentParamsSchema`

- [ ] Valida `contentId` como `z.string().uuid()` — UUID é formato baseado em transporte (path), aceitável validar aqui.
- [ ] Rejeita `contentId` ausente.
- [ ] Rejeita `contentId` em formato não-UUID.

---

## 4. Estratégia de testes

- Cada schema tem seu próprio `.spec.ts` em `test/infrastructure/http/schemas/`.
- Testes são puros (sem mocks) — `safeParse(...)` → assertar `success` e `data`/`error`.
- Tipos exportados são verificados via assinatura: `expectTypeOf<z.infer<typeof signInBodySchema>>().toEqualTypeOf<SignInBody>()` (opcional).

---

## 5. Ordem TDD sugerida

1. CT01 — `signInBodySchema` rejeita body vazio.
2. CT02 — `signInBodySchema` aceita body válido.
3. CT03 — `signInBodySchema` rejeita campos extras.
4. Replicar para `signUpBodySchema`.
5. Replicar para `registerContentBodySchema` — atenção ao caso `authorId` proibido.
6. `removeContentParamsSchema` — UUID.

---

## 6. Checklist final

- [ ] Cada rota tem seu schema.
- [ ] Cada schema tem `.spec.ts` cobrindo presença, tipo, extras.
- [ ] Schemas **não** validam regras de negócio.
- [ ] `registerContentBodySchema` proíbe `authorId`.
- [ ] Tipos TS são `z.infer<...>` (single source of truth).

---

## 7. Referências

- [SignInController](./signin-controller.md)
- [SignUpController](./signup-controller.md)
- [RegisterContentController](./register-content-controller.md)
- [RemoveContentController](./remove-content-controller.md)
- [Error handler](./error-handler.md)
