# Caso de Uso: ListContentsUseCase

## 1. Visão Geral

Retorna a lista paginada de ações (`Content`) registradas no CMS para consumo pela vitrine pública.

## 2. Atores

- **Visitante (público)**: leitura aberta, sem autenticação.

## 3. Pré-condições

- `page` deve ser um inteiro `>= 1`.
- `limit` deve ser um inteiro `>= 1` e `<= 100`.

## 4. Contrato

### Input

```ts
type ListContentsInput = {
  page: number
  limit: number
}
```

### Output

```ts
type ListContentsOutput = {
  items: Content[]
  total: number
  page: number
  limit: number
}
```

## 5. Dependências

| Porta               | Responsabilidade                          |
| :------------------ | :---------------------------------------- |
| `ContentRepository` | Retornar a página de conteúdos e o total. |

## 6. Fluxo Principal

1. Valida `page` (inteiro `>= 1`) e `limit` (inteiro entre `1` e `100`).
2. Consulta `ContentRepository.findAll(page, limit)`.
3. Retorna `{ items, total, page, limit }`.

## 7. Fluxos de Exceção

| Cenário                                                    | Erro                     |
| :--------------------------------------------------------- | :----------------------- |
| `page` ou `limit` inválido (não inteiro, fora dos limites) | `InvalidPaginationError` |

## 8. Regras de Negócio

- Paginação por `page + limit` (offset-based). Limite máximo de `100` por página protege contra consultas pesadas.
- Leitura pública, sem regra de autorização.

## 9. Pós-condições

- Nenhum estado é alterado no repositório.

## 10. Referências

- Código-fonte: [`src/application/use-cases/list-contents/list-contents-use-case.ts`](../../../src/application/use-cases/list-contents/list-contents-use-case.ts)
- Testes: [`test/application/list-contents-use-case.spec.ts`](../../../test/application/list-contents-use-case.spec.ts)
- Plano de testes: [`doc/testes/use-cases/list-contents-usecase-testes.md`](../../testes/use-cases/list-contents-usecase-testes.md)
