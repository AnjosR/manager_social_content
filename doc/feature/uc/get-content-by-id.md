# Caso de Uso: GetContentByIdUseCase

## 1. Visão Geral

Retorna os detalhes de uma ação (`Content`) a partir do seu identificador. É consumido pela vitrine pública para exibir a página de detalhes da ação.

## 2. Atores

- **Visitante (público)**: leitura aberta, sem autenticação.

## 3. Pré-condições

- O `contentId` precisa corresponder a um conteúdo existente.

## 4. Contrato

### Input

```ts
type GetContentByIdInput = {
  contentId: string
}
```

### Output

```ts
type GetContentByIdOutput = {
  content: Content
}
```

## 5. Dependências

| Porta               | Responsabilidade             |
| :------------------ | :--------------------------- |
| `ContentRepository` | Buscar o conteúdo pelo `id`. |

## 6. Fluxo Principal

1. Consulta `ContentRepository.findById(new UniqueEntityId(contentId))`.
2. Se retornar `null`, lança `ContentNotFoundError`.
3. Retorna `{ content }`.

## 7. Fluxos de Exceção

| Cenário                 | Erro                   |
| :---------------------- | :--------------------- |
| Conteúdo não encontrado | `ContentNotFoundError` |

## 8. Regras de Negócio

- Leitura pública, sem regra de autorização.

## 9. Pós-condições

- Nenhum estado é alterado no repositório.

## 10. Referências

- Código-fonte: [`src/application/use-cases/get-content-by-id/get-content-by-id-use-case.ts`](../../../src/application/use-cases/get-content-by-id/get-content-by-id-use-case.ts)
- Testes: [`test/application/get-content-by-id-use-case.spec.ts`](../../../test/application/get-content-by-id-use-case.spec.ts)
- Plano de testes: [`doc/testes/use-cases/get-content-by-id-usecase-testes.md`](../../testes/use-cases/get-content-by-id-usecase-testes.md)
