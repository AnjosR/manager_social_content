import { userRole } from '#src/domain/entity/user'
import { UniqueEntityId } from '#src/domain/value-objects/uniqueId'

import { LastAdminCannotBeRemovedError } from './errors/last-admin-cannot-be-removed-error.js'
import { EditorNotExistsError } from '../../erros/editor-not-exists-error.js'
import { NotAllowedError } from '../../erros/not-allowed-error.js'
import type { UserRepository } from '../../interfaces/repositories/user-repository.js'
import type { UseCase } from '../../interfaces/use-case.js'

export type RemoveUserInput = {
  userId: string
  targetUserId: string
}

export type RemoveUserOutput = {
  removedUserId: string
  deletedBy: string
  deletedAt: string
}

export class RemoveUserUseCase implements UseCase<RemoveUserInput, RemoveUserOutput> {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(input: RemoveUserInput): Promise<RemoveUserOutput> {
    const requester = await this.userRepository.findById(new UniqueEntityId(input.userId))
    if (!requester) {
      throw new EditorNotExistsError()
    }

    if (requester.role !== userRole.ADMIN) {
      throw new NotAllowedError()
    }

    const target = await this.userRepository.findById(new UniqueEntityId(input.targetUserId))
    if (!target) {
      throw new EditorNotExistsError()
    }

    if (input.userId === input.targetUserId) {
      const activeAdmins = await this.userRepository.countActiveAdmins()
      if (activeAdmins <= 1) {
        throw new LastAdminCannotBeRemovedError()
      }
    }

    const deletedAt = new Date()
    await this.userRepository.delete(new UniqueEntityId(input.targetUserId), deletedAt)

    return {
      removedUserId: input.targetUserId,
      deletedBy: input.userId,
      deletedAt: deletedAt.toISOString(),
    }
  }
}
