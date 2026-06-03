/* eslint-disable @typescript-eslint/unbound-method */
import { mock, type MockProxy } from 'vitest-mock-extended'

import { DataBaseConnectionError } from '#src/application/erros/database-connection-error'
import { EditorNotExistsError } from '#src/application/erros/editor-not-exists-error'
import { NotAllowedError } from '#src/application/erros/not-allowed-error'
import type { UserRepository } from '#src/application/interfaces/repositories/user-repository'
import { LastAdminCannotBeRemovedError } from '#src/application/use-cases/remove-user/errors/last-admin-cannot-be-removed-error'
import { RemoveUserUseCase } from '#src/application/use-cases/remove-user/remove-user-use-case'
import { userRole, type User } from '#src/domain/entity/user'
import { UniqueEntityId } from '#src/domain/value-objects/uniqueId'

type RemoveUserInput = {
  userId: string
  targetUserId: string
}

function buildUser(id: UniqueEntityId, role: userRole): User {
  return {
    id,
    name: 'any_name',
    email: 'any@email.com',
    passwordHash: 'any_hashed_password',
    role,
    createdAt: new Date(),
    deletedAt: null,
  } as unknown as User
}

describe('RemoveUser UseCase', () => {
  let input: RemoveUserInput
  let requesterId: UniqueEntityId
  let targetId: UniqueEntityId
  let requester: User
  let target: User
  let userRepository: MockProxy<UserRepository>

  let sut: RemoveUserUseCase

  beforeEach(() => {
    requesterId = new UniqueEntityId()
    targetId = new UniqueEntityId()

    requester = buildUser(requesterId, userRole.ADMIN)
    target = buildUser(targetId, userRole.EDITOR)

    userRepository = mock<UserRepository>()
    userRepository.findById.mockImplementation(async (id: UniqueEntityId) => {
      if (id.toValue() === requesterId.toValue()) return requester
      if (id.toValue() === targetId.toValue()) return target
      return null
    })
    userRepository.countActiveAdmins.mockResolvedValue(2)
    userRepository.delete.mockResolvedValue(undefined)

    input = {
      userId: requesterId.toString(),
      targetUserId: targetId.toString(),
    }

    sut = new RemoveUserUseCase(userRepository)
  })

  describe('Behavior', () => {
    it('Should call userRepository.findById with the normalized requester userId', async () => {
      await sut.execute(input)

      expect(userRepository.findById).toHaveBeenCalledWith(new UniqueEntityId(input.userId))
    })

    it('Should call userRepository.findById with the normalized targetUserId', async () => {
      await sut.execute(input)

      expect(userRepository.findById).toHaveBeenCalledWith(new UniqueEntityId(input.targetUserId))
    })

    it('Should call userRepository.softDelete with the normalized targetUserId when requester is ADMIN and target is another user', async () => {
      await sut.execute(input)

      expect(userRepository.delete).toHaveBeenCalledWith(new UniqueEntityId(input.targetUserId), expect.any(Date))
    })

    it('Should call userRepository.softDelete when ADMIN removes self and other active admins exist', async () => {
      const selfInput: RemoveUserInput = {
        userId: requesterId.toString(),
        targetUserId: requesterId.toString(),
      }
      userRepository.countActiveAdmins.mockResolvedValueOnce(2)

      await sut.execute(selfInput)

      expect(userRepository.delete).toHaveBeenCalledWith(new UniqueEntityId(selfInput.targetUserId), expect.any(Date))
    })

    it('Should call userRepository.countActiveAdmins when userId === targetUserId (self-removal)', async () => {
      const selfInput: RemoveUserInput = {
        userId: requesterId.toString(),
        targetUserId: requesterId.toString(),
      }

      await sut.execute(selfInput)

      expect(userRepository.countActiveAdmins).toHaveBeenCalledTimes(1)
    })

    it('Should NOT call userRepository.countActiveAdmins when target is another user', async () => {
      await sut.execute(input)

      expect(userRepository.countActiveAdmins).not.toHaveBeenCalled()
    })

    it('Should return removedUserId, deletedBy and deletedAt when removal succeeds', async () => {
      const output = await sut.execute(input)

      expect(output.removedUserId).toBe(input.targetUserId)
      expect(output.deletedBy).toBe(input.userId)
      expect(output.deletedAt).toStrictEqual(expect.any(String))
      expect(new Date(output.deletedAt).toString()).not.toBe('Invalid Date')
    })

    it('Should throw EditorNotExistsError when the requester is not found', async () => {
      userRepository.findById.mockImplementation(async (id: UniqueEntityId) => {
        if (id.toValue() === requesterId.toValue()) return null
        if (id.toValue() === targetId.toValue()) return target
        return null
      })

      await expect(sut.execute(input)).rejects.toThrow(EditorNotExistsError)
    })

    it('Should throw NotAllowedError when the requester is not ADMIN (e.g. EDITOR)', async () => {
      const editorRequester = buildUser(requesterId, userRole.EDITOR)
      userRepository.findById.mockImplementation(async (id: UniqueEntityId) => {
        if (id.toValue() === requesterId.toValue()) return editorRequester
        if (id.toValue() === targetId.toValue()) return target
        return null
      })

      await expect(sut.execute(input)).rejects.toThrow(NotAllowedError)
    })

    it('Should throw EditorNotExistsError when the target is not found (inexistent or already soft-deleted)', async () => {
      userRepository.findById.mockImplementation(async (id: UniqueEntityId) => {
        if (id.toValue() === requesterId.toValue()) return requester
        if (id.toValue() === targetId.toValue()) return null
        return null
      })

      await expect(sut.execute(input)).rejects.toThrow(EditorNotExistsError)
    })

    it('Should throw LastAdminCannotBeRemovedError when ADMIN tries to self-remove being the last active admin', async () => {
      const selfInput: RemoveUserInput = {
        userId: requesterId.toString(),
        targetUserId: requesterId.toString(),
      }
      userRepository.countActiveAdmins.mockResolvedValueOnce(1)

      await expect(sut.execute(selfInput)).rejects.toThrow(LastAdminCannotBeRemovedError)
    })

    it('Should NOT call userRepository.softDelete when the requester is not ADMIN', async () => {
      const editorRequester = buildUser(requesterId, userRole.EDITOR)
      userRepository.findById.mockImplementation(async (id: UniqueEntityId) => {
        if (id.toValue() === requesterId.toValue()) return editorRequester
        if (id.toValue() === targetId.toValue()) return target
        return null
      })

      await expect(sut.execute(input)).rejects.toThrow(NotAllowedError)
      expect(userRepository.delete).not.toHaveBeenCalled()
    })

    it('Should NOT call userRepository.softDelete when the target is not found', async () => {
      userRepository.findById.mockImplementation(async (id: UniqueEntityId) => {
        if (id.toValue() === requesterId.toValue()) return requester
        if (id.toValue() === targetId.toValue()) return null
        return null
      })

      await expect(sut.execute(input)).rejects.toThrow(EditorNotExistsError)
      expect(userRepository.delete).not.toHaveBeenCalled()
    })

    it('Should NOT call userRepository.softDelete when self-removal hits the last-admin rule', async () => {
      const selfInput: RemoveUserInput = {
        userId: requesterId.toString(),
        targetUserId: requesterId.toString(),
      }
      userRepository.countActiveAdmins.mockResolvedValueOnce(1)

      await expect(sut.execute(selfInput)).rejects.toThrow(LastAdminCannotBeRemovedError)
      expect(userRepository.delete).not.toHaveBeenCalled()
    })
  })

  describe('Infrastructure', () => {
    it('Should propagate the exception when userRepository.findById fails', async () => {
      userRepository.findById.mockImplementation(() => {
        throw new DataBaseConnectionError()
      })

      await expect(() => sut.execute(input)).rejects.toThrow(DataBaseConnectionError)
    })

    it('Should propagate the exception when userRepository.countActiveAdmins fails', async () => {
      const selfInput: RemoveUserInput = {
        userId: requesterId.toString(),
        targetUserId: requesterId.toString(),
      }
      userRepository.countActiveAdmins.mockImplementation(() => {
        throw new DataBaseConnectionError()
      })

      await expect(() => sut.execute(selfInput)).rejects.toThrow(DataBaseConnectionError)
    })

    it('Should propagate the exception when userRepository.softDelete fails', async () => {
      userRepository.delete.mockImplementation(() => {
        throw new DataBaseConnectionError()
      })

      await expect(() => sut.execute(input)).rejects.toThrow(DataBaseConnectionError)
    })
  })
})
