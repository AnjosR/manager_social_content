/* eslint-disable @typescript-eslint/unbound-method */
import { mock, type MockProxy } from 'vitest-mock-extended'

import { DataBaseConnectionError } from '#src/application/erros/database-connection-error'
import { EditorNotExistsError } from '#src/application/erros/editor-not-exists-error'
import { InvalidContentError } from '#src/application/erros/invalid-content-error'
import type { ContentRepository } from '#src/application/interfaces/repositories/content-repository'
import type { UserRepository } from '#src/application/interfaces/repositories/user-repository'
import { RegisterContentUseCase } from '#src/application/register-content-use-case'
import { userRole, type User } from '#src/domain/entity/user'
import { UniqueEntityId } from '#src/domain/value-objects/uniqueId'

type RegisterContentInput = {
  authorId: string
  title: string
  description: string
  actionDate: string
  imagesURL: string[]
}

describe('RegisterContent UseCase', () => {
  let input: RegisterContentInput
  let mockAuthorId: UniqueEntityId
  let mockAuthor: User
  let userRepository: MockProxy<UserRepository>
  let contentRepository: MockProxy<ContentRepository>

  let sut: RegisterContentUseCase

  beforeEach(() => {
    mockAuthorId = new UniqueEntityId()

    mockAuthor = {
      id: mockAuthorId,
      name: 'any_name',
      email: 'any@email.com',
      passwordHash: 'any_hashed_password',
      role: userRole.EDITOR,
      createdAt: new Date(),
    } as unknown as User

    userRepository = mock<UserRepository>()
    userRepository.findById.mockResolvedValue(mockAuthor)

    contentRepository = mock<ContentRepository>()
    contentRepository.findByTitle.mockResolvedValue(null)
    contentRepository.save.mockResolvedValue(undefined)

    input = {
      authorId: mockAuthorId.toString(),
      title: 'any_valid_title',
      description: 'any_valid_description_with_more_than_20_characters',
      actionDate: '2026-01-15',
      imagesURL: ['https://example.com/image.png'],
    }

    sut = new RegisterContentUseCase(contentRepository, userRepository)
  })

  describe('Behavior', () => {
    it('Should call userRepository.findById with normalized authorId', async () => {
      await sut.execute(input)

      expect(userRepository.findById).toHaveBeenLastCalledWith(new UniqueEntityId(input.authorId))
    })

    it('Should call contentRepository.findByTitle with the trimmed title', async () => {
      await sut.execute(input)

      expect(contentRepository.findByTitle).toHaveBeenLastCalledWith(input.title)
    })

    it('Should call contentRepository.save with the created content', async () => {
      await sut.execute(input)

      expect(contentRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          authorId: input.authorId,
          title: input.title,
          description: input.description,
          imagesUrl: input.imagesURL,
        }),
      )
    })

    it('Should return the created content with authorId set from input', async () => {
      const output = await sut.execute(input)

      expect(output.content).toBeDefined()
      expect(output.content.authorId).toBe(input.authorId)
      expect(output.content.title).toBe(input.title)
      expect(output.content.description).toBe(input.description)
      expect(output.content.imagesUrl).toStrictEqual(input.imagesURL)
      expect(output.content.Actiondate).toBeInstanceOf(Date)
    })

    it('Should throw EditorNotExistsError when author is not found', async () => {
      userRepository.findById.mockResolvedValueOnce(null)

      await expect(sut.execute(input)).rejects.toThrow(EditorNotExistsError)
    })

    it('Should throw InvalidContentError when content with the same title already exists', async () => {
      contentRepository.findByTitle.mockResolvedValueOnce({} as never)

      await expect(sut.execute(input)).rejects.toThrow(InvalidContentError)
    })

    it('Should not call contentRepository.findByTitle when author does not exist', async () => {
      userRepository.findById.mockResolvedValueOnce(null)

      await expect(sut.execute(input)).rejects.toThrow(EditorNotExistsError)
      expect(contentRepository.findByTitle).not.toHaveBeenCalled()
    })

    it('Should not call contentRepository.save when author does not exist', async () => {
      userRepository.findById.mockResolvedValueOnce(null)

      await expect(sut.execute(input)).rejects.toThrow(EditorNotExistsError)
      expect(contentRepository.save).not.toHaveBeenCalled()
    })

    it('Should not call contentRepository.save when content already exists', async () => {
      contentRepository.findByTitle.mockResolvedValueOnce({} as never)

      await expect(sut.execute(input)).rejects.toThrow(InvalidContentError)
      expect(contentRepository.save).not.toHaveBeenCalled()
    })
  })

  describe('Infrastructure', () => {
    it('Should throw DataBaseConnectionError if userRepository.findById fails', async () => {
      userRepository.findById.mockImplementation(() => {
        throw new DataBaseConnectionError()
      })

      await expect(() => sut.execute(input)).rejects.toThrow(DataBaseConnectionError)
    })

    it('Should throw DataBaseConnectionError if contentRepository.findByTitle fails', async () => {
      contentRepository.findByTitle.mockImplementation(() => {
        throw new DataBaseConnectionError()
      })

      await expect(() => sut.execute(input)).rejects.toThrow(DataBaseConnectionError)
    })

    it('Should throw DataBaseConnectionError if contentRepository.save fails', async () => {
      contentRepository.save.mockImplementation(() => {
        throw new DataBaseConnectionError()
      })

      await expect(() => sut.execute(input)).rejects.toThrow(DataBaseConnectionError)
    })
  })
})
