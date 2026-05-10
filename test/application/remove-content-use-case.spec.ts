/* eslint-disable @typescript-eslint/unbound-method */
import { mock, type MockProxy } from 'vitest-mock-extended'

import { ContentNotFoundError } from '#src/application/erros/content-not-found-error'
import { DataBaseConnectionError } from '#src/application/erros/database-connection-error'
import { EditorNotExistsError } from '#src/application/erros/editor-not-exists-error'
import { NotAllowedError } from '#src/application/erros/not-allowed-error'
import type { ContentRepository } from '#src/application/interfaces/repositories/content-repository'
import type { UserRepository } from '#src/application/interfaces/repositories/user-repository'
import { RemoveContentUseCase } from '#src/application/remove-content-use-case'
import type { Content } from '#src/domain/entity/content'
import { userRole, type User } from '#src/domain/entity/user'
import { UniqueEntityId } from '#src/domain/value-objects/uniqueId'

type RemoveContentInput = {
  userId: string
  contentId: string
}

describe('RemoveContent UseCase', () => {
  let input: RemoveContentInput
  let mockUserId: UniqueEntityId
  let mockContentId: UniqueEntityId
  let mockUser: User
  let mockContent: Content
  let userRepository: MockProxy<UserRepository>
  let contentRepository: MockProxy<ContentRepository>

  let sut: RemoveContentUseCase

  beforeEach(() => {
    mockUserId = new UniqueEntityId()
    mockContentId = new UniqueEntityId()

    mockUser = {
      id: mockUserId,
      name: 'any_name',
      email: 'any@email.com',
      passwordHash: 'any_hashed_password',
      role: userRole.ADMIN,
      createdAt: new Date(),
    } as unknown as User

    mockContent = {
      id: mockContentId,
      authorId: mockUserId.toString(),
      title: 'any_title',
      description: 'any_description',
      Actiondate: new Date(),
      imagesUrl: ['any_url'],
    } as unknown as Content

    userRepository = mock<UserRepository>()
    userRepository.findById.mockResolvedValue(mockUser)

    contentRepository = mock<ContentRepository>()
    contentRepository.findById.mockResolvedValue(mockContent)
    contentRepository.delete.mockResolvedValue(undefined)

    input = {
      userId: mockUserId.toString(),
      contentId: mockContentId.toString(),
    }

    sut = new RemoveContentUseCase(contentRepository, userRepository)
  })

  describe('Behavior', () => {
    it('Should call userRepository.findById with normalized userId', async () => {
      await sut.execute(input)

      expect(userRepository.findById).toHaveBeenLastCalledWith(new UniqueEntityId(input.userId))
    })

    it('Should call contentRepository.findById with normalized contentId', async () => {
      await sut.execute(input)

      expect(contentRepository.findById).toHaveBeenLastCalledWith(new UniqueEntityId(input.contentId))
    })

    it('Should call contentRepository.delete with normalized contentId when user is admin and author', async () => {
      await sut.execute(input)

      expect(contentRepository.delete).toHaveBeenLastCalledWith(new UniqueEntityId(input.contentId))
    })

    it('Should return removedContent, deletedBy and deletedAt when removal succeeds', async () => {
      const output = await sut.execute(input)

      expect(output.removedContent).toBe(mockContent)
      expect(output.deletedBy).toBe(input.userId)
      expect(output.deletedAt).toStrictEqual(expect.any(String))
      expect(new Date(output.deletedAt).toString()).not.toBe('Invalid Date')
    })

    it('Should throw EditorNotExistsError when user is not found', async () => {
      userRepository.findById.mockResolvedValueOnce(null)

      await expect(sut.execute(input)).rejects.toThrow(EditorNotExistsError)
    })

    it('Should throw ContentNotFoundError when content is not found', async () => {
      contentRepository.findById.mockResolvedValueOnce(null)

      await expect(sut.execute(input)).rejects.toThrow(ContentNotFoundError)
    })

    it('Should throw NotAllowedError when user is the author but is not ADMIN', async () => {
      const editorUser = {
        id: mockUserId,
        name: 'any_name',
        email: 'any@email.com',
        passwordHash: 'any_hashed_password',
        role: userRole.EDITOR,
        createdAt: new Date(),
      } as unknown as User
      userRepository.findById.mockResolvedValueOnce(editorUser)

      await expect(sut.execute(input)).rejects.toThrow(NotAllowedError)
    })

    it('Should throw NotAllowedError when user is ADMIN but is not the author', async () => {
      const otherAuthorContent = {
        id: mockContentId,
        authorId: new UniqueEntityId().toString(),
        title: 'any_title',
        description: 'any_description',
        Actiondate: new Date(),
        imagesUrl: ['any_url'],
      } as unknown as Content
      contentRepository.findById.mockResolvedValueOnce(otherAuthorContent)

      await expect(sut.execute(input)).rejects.toThrow(NotAllowedError)
    })

    it('Should throw NotAllowedError when user is neither ADMIN nor the author', async () => {
      const editorUser = {
        id: mockUserId,
        name: 'any_name',
        email: 'any@email.com',
        passwordHash: 'any_hashed_password',
        role: userRole.EDITOR,
        createdAt: new Date(),
      } as unknown as User
      const otherAuthorContent = {
        id: mockContentId,
        authorId: new UniqueEntityId().toString(),
        title: 'any_title',
        description: 'any_description',
        Actiondate: new Date(),
        imagesUrl: ['any_url'],
      } as unknown as Content
      userRepository.findById.mockResolvedValueOnce(editorUser)
      contentRepository.findById.mockResolvedValueOnce(otherAuthorContent)

      await expect(sut.execute(input)).rejects.toThrow(NotAllowedError)
    })

    it('Should not call contentRepository.delete when authorization fails', async () => {
      const editorUser = {
        id: mockUserId,
        name: 'any_name',
        email: 'any@email.com',
        passwordHash: 'any_hashed_password',
        role: userRole.EDITOR,
        createdAt: new Date(),
      } as unknown as User
      userRepository.findById.mockResolvedValueOnce(editorUser)

      await expect(sut.execute(input)).rejects.toThrow(NotAllowedError)
      expect(contentRepository.delete).not.toHaveBeenCalled()
    })
  })

  describe('Infrastructure', () => {
    it('Should throw DataBaseConnectionError if userRepository.findById fails', async () => {
      userRepository.findById.mockImplementation(() => {
        throw new DataBaseConnectionError()
      })

      await expect(() => sut.execute(input)).rejects.toThrow(DataBaseConnectionError)
    })

    it('Should throw DataBaseConnectionError if contentRepository.findById fails', async () => {
      contentRepository.findById.mockImplementation(() => {
        throw new DataBaseConnectionError()
      })

      await expect(() => sut.execute(input)).rejects.toThrow(DataBaseConnectionError)
    })

    it('Should throw DataBaseConnectionError if contentRepository.delete fails', async () => {
      contentRepository.delete.mockImplementation(() => {
        throw new DataBaseConnectionError()
      })

      await expect(() => sut.execute(input)).rejects.toThrow(DataBaseConnectionError)
    })
  })
})
