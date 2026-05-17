# Caso de Uso: RemoveUserUseCase

## 1. Visão Geral

Permite que um administrador remova (soft delete) um usuário do CMS — tipicamente após o desligamento de um colaborador. A remoção marca o usuário como inativo via `deletedAt`, preservando os conteúdos por ele publicados e a trilha de auditoria.

## 2. Atores

- **Administrador (autenticado, role `ADMIN`)**: único papel autorizado a remover usuários. Pode remover qualquer outro usuário ativo, inclusive a si mesmo (desde que haja outro `ADMIN` ativo).

## 3. Pré-condições

- O `userId` (requester) precisa corresponder a um usuário ativo (`deletedAt IS NULL`).
- O `targetUserId` precisa corresponder a um usuário ativo (`deletedAt IS NULL`).
- O requester precisa possuir `role === userRole.ADMIN`.
- Em caso de auto-remoção (`userId === targetUserId`), deve existir pelo menos um outro administrador ativo no sistema.

## 4. Contrato

### Input

```ts
type RemoveUserInput = {
  userId: string
  targetUserId: string
}
```

### Output

```ts
type RemoveUserOutput = {
  removedUserId: string
  deletedBy: string
  deletedAt: string
}
```

> Observação: o retorno **não expõe** dados sensíveis do usuário removido (e-mail, `passwordHash`, etc.).

## 5. Dependências

| Porta            | Responsabilidade                                                                |
| :--------------- | :------------------------------------------------------------------------------ |
| `UserRepository` | Buscar requester e alvo, contar administradores ativos, executar o soft delete. |

## 6. Fluxo Principal

1. Busca o requester via `UserRepository.findById(new UniqueEntityId(userId))`.
2. Verifica que `requester.role === userRole.ADMIN`.
3. Busca o alvo via `UserRepository.findById(new UniqueEntityId(targetUserId))`.
4. Se `userId === targetUserId`, consulta `UserRepository.countActiveAdmins()` e exige `> 1`.
5. Executa `UserRepository.softDelete(new UniqueEntityId(targetUserId), new Date())`.
6. Retorna `{ removedUserId: targetUserId, deletedBy: userId, deletedAt: new Date().toISOString() }`.

## 7. Fluxos de Exceção

| Cenário                                               | Erro                            |
| :---------------------------------------------------- | :------------------------------ |
| Requester não encontrado                              | `EditorNotExistsError`          |
| Requester não é ADMIN                                 | `NotAllowedError`               |
| Alvo não encontrado (inexistente ou já soft-deletado) | `EditorNotExistsError`          |
| ADMIN tenta se auto-remover sendo o último ativo      | `LastAdminCannotBeRemovedError` |

> `UserRepository.findById` filtra `deletedAt IS NULL`. Logo, um usuário já soft-deletado é indistinguível de inexistente sob a ótica deste caso de uso.

## 8. Regras de Negócio

Regras específicas deste caso de uso (não listadas no PRD original):

- **RN-RU01** — Apenas usuários com role `ADMIN` podem remover outros usuários.
- **RN-RU02** — A remoção é via **soft delete** (`deletedAt`). O registro permanece no banco para preservar referências (ex: `Content.authorId`) e a trilha de auditoria.
- **RN-RU03** — Um ADMIN pode se auto-remover apenas se houver outro ADMIN ativo, evitando que o sistema fique sem administrador.

## 9. Pós-condições

- O usuário alvo passa a ter `deletedAt` definido com o instante da remoção.
- Consultas via `UserRepository.findById` deixam de retornar este usuário (filtragem por `deletedAt IS NULL`).
- O `Content` publicado pelo usuário removido permanece intacto, com `authorId` apontando para o registro soft-deletado.

## 10. Referências

- Código-fonte: [`src/application/use-cases/remove-user/remove-user-use-case.ts`](../../../src/application/use-cases/remove-user/remove-user-use-case.ts)
- Testes: [`test/application/remove-user-use-case.spec.ts`](../../../test/application/remove-user-use-case.spec.ts)
- Plano de testes: [`doc/testes/use-cases/remove-user-usecase-testes.md`](../../testes/use-cases/remove-user-usecase-testes.md)
