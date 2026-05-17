# Plano de Testes: RemoveUserUseCase (TDD)

## Dependências Necessárias (Mocks)

Para testar o `RemoveUserUseCase` isoladamente, precisamos de mocks para:

- **UserRepository**: Para buscar requester e alvo, contar administradores ativos e executar o soft delete.

---

## Regra de Autorização

- Somente usuários com role `userRole.ADMIN` podem remover outros usuários.
- O ADMIN pode remover qualquer outro usuário ativo, inclusive a si mesmo.
- Auto-remoção (`userId === targetUserId`) exige `UserRepository.countActiveAdmins() > 1`; do contrário lança `LastAdminCannotBeRemovedError`.
- Tentar remover um usuário inexistente ou já removido (soft-deletado) lança `EditorNotExistsError`, pois `findById` filtra `deletedAt IS NULL`.

---

## Casos de Teste

## Fluxo Principal (Sucesso)

- [x] Deve garantir que `UserRepository.findById` é chamado com o `userId` normalizado (requester).
- [x] Deve garantir que `UserRepository.findById` é chamado com o `targetUserId` normalizado.
- [x] Deve garantir que `UserRepository.softDelete` é chamado com o `targetUserId` normalizado quando o requester é ADMIN e o alvo é outro usuário.
- [x] Deve garantir que `UserRepository.softDelete` é chamado quando o ADMIN se auto-remove e existem outros admins ativos.
- [x] Deve garantir que `UserRepository.countActiveAdmins` é chamado quando há auto-remoção (`userId === targetUserId`).
- [x] Deve garantir que `UserRepository.countActiveAdmins` **não** é chamado quando o alvo é outro usuário.
- [x] Deve garantir que o sistema retorna `removedUserId`, `deletedBy` e `deletedAt` quando a remoção ocorre com sucesso.

## Fluxos de Exceção (Regras de Negócio)

- [x] Deve garantir que o sistema lança `EditorNotExistsError` quando o requester não é encontrado.
- [x] Deve garantir que o sistema lança `NotAllowedError` quando o requester não é ADMIN (ex: EDITOR).
- [x] Deve garantir que o sistema lança `EditorNotExistsError` quando o alvo não é encontrado (inexistente ou já soft-deletado).
- [x] Deve garantir que o sistema lança `LastAdminCannotBeRemovedError` quando o ADMIN tenta se auto-remover sendo o último ativo.
- [x] Deve garantir que `UserRepository.softDelete` **não** é chamado quando o requester não é ADMIN.
- [x] Deve garantir que `UserRepository.softDelete` **não** é chamado quando o alvo não é encontrado.
- [x] Deve garantir que `UserRepository.softDelete` **não** é chamado quando a auto-remoção esbarra na regra do último admin.

## Tratamento de Erros (Infraestrutura)

- [x] Deve garantir que o caso de uso repassa a exceção se `UserRepository.findById` falhar (ex: erro de conexão com banco).
- [x] Deve garantir que o caso de uso repassa a exceção se `UserRepository.countActiveAdmins` falhar.
- [x] Deve garantir que o caso de uso repassa a exceção se `UserRepository.softDelete` falhar.

---
