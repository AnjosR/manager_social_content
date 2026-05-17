/* eslint-disable @typescript-eslint/unbound-method */
import { mock, type MockProxy } from 'vitest-mock-extended'

import { ContentNotFoundError } from '#src/application/erros/content-not-found-error'
import { DataBaseConnectionError } from '#src/application/erros/database-connection-error'
import { EditorNotExistsError } from '#src/application/erros/editor-not-exists-error'
import { NotAllowedError } from '#src/application/erros/not-allowed-error'
import type { ContentRepository } from '#src/application/interfaces/repositories/content-repository'
import type { UserRepository } from '#src/application/interfaces/repositories/user-repository'
import { InvalidContentError } from '#src/application/use-cases/register-content/errors/invalid-content-error'
import { UpdateContentUseCase } from '#src/application/use-cases/update-content/update-content-use-case'
import { Content } from '#src/domain/entity/content'
import { userRole, type User } from '#src/domain/entity/user'
import { UniqueEntityId } from '#src/domain/value-objects/uniqueId'

type UpdateContentInput = {
  userId: string
  contentId: string
  title?: string
  description?: string
  actionDate?: string
  imagesURL?: string[]
}

describe('UpdateContent UseCase', () => {
  let input: UpdateContentInput
  let userId: UniqueEntityId
  let contentId: UniqueEntityId
  let user: User
  let existingContent: Content
  let userRepository: MockProxy<UserRepository>
  let contentRepository: MockProxy<ContentRepository>

  let sut: UpdateContentUseCase

  beforeEach(() => {
    userId = new UniqueEntityId()
    contentId = new UniqueEntityId()

    user = {
      id: userId,
      name: 'any_name',
      email: 'any@email.com',
      passwordHash: 'any_hashed_password',
      role: userRole.EDITOR,
      createdAt: new Date(),
    } as unknown as User

    existingContent = new Content(
      {
        authorId: userId.toString(),
        title: 'original_title',
        description: 'original description with more than 20 characters',
        Actiondate: new Date('2026-01-01'),
        imagesUrl: ['https://example.com/original.png'],
      },
      contentId,
    )

    userRepository = mock<UserRepository>()
    userRepository.findById.mockResolvedValue(user)

    contentRepository = mock<ContentRepository>()
    contentRepository.findById.mockResolvedValue(existingContent)
    contentRepository.findByTitle.mockResolvedValue(null)
    contentRepository.save.mockResolvedValue(undefined)

    input = {
      userId: userId.toString(),
      contentId: contentId.toString(),
      title: 'updated_title',
      description: 'updated description with more than 20 characters',
      actionDate: '2026-02-02',
      imagesURL: ['https://example.com/updated.png'],
    }

    sut = new UpdateContentUseCase(contentRepository, userRepository)
  })

  describe('Behavior', () => {
    it('Should call userRepository.findById with the normalized userId', async () => {
      await sut.execute(input)

      expect(userRepository.findById).toHaveBeenCalledWith(new UniqueEntityId(input.userId))
    })

    it('Should call contentRepository.findById with the normalized contentId', async () => {
      await sut.execute(input)

      expect(contentRepository.findById).toHaveBeenCalledWith(new UniqueEntityId(input.contentId))
    })

    it('Should call contentRepository.save with the updated content when the requester is the author', async () => {
      await sut.execute(input)

      expect(contentRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          title: input.title,
          description: input.description,
          imagesUrl: input.imagesURL,
        }),
      )
    })

    it('Should preserve authorId and content id after update', async () => {
      const output = await sut.execute(input)

      expect(output.content.authorId).toBe(existingContent.authorId)
      expect(output.content.id.toValue()).toBe(existingContent.id.toValue())
    })

    it('Should apply only the fields provided (partial update)', async () => {
      const partial: UpdateContentInput = {
        userId: userId.toString(),
        contentId: contentId.toString(),
        title: 'updated_title_only',
      }

      const output = await sut.execute(partial)

      expect(output.content.title).toBe('updated_title_only')
      expect(output.content.description).toBe(existingContent.description)
      expect(output.content.Actiondate).toBe(existingContent.Actiondate)
      expect(output.content.imagesUrl).toBe(existingContent.imagesUrl)
    })

    it('Should call contentRepository.findByTitle when the title changes', async () => {
      await sut.execute(input)

      expect(contentRepository.findByTitle).toHaveBeenCalledWith(input.title)
    })

    it('Should NOT call contentRepository.findByTitle when the title is not in the input', async () => {
      const noTitleChange: UpdateContentInput = {
        userId: userId.toString(),
        contentId: contentId.toString(),
        description: 'only the description changed for this content',
      }

      await sut.execute(noTitleChange)

      expect(contentRepository.findByTitle).not.toHaveBeenCalled()
    })

    it('Should allow updating to the same title (no unicity collision with itself)', async () => {
      const sameTitle: UpdateContentInput = {
        userId: userId.toString(),
        contentId: contentId.toString(),
        title: 'original_title',
      }

      await expect(sut.execute(sameTitle)).resolves.toBeDefined()
      expect(contentRepository.findByTitle).not.toHaveBeenCalled()
    })

    it('Should allow update when an ADMIN edits another author’s content', async () => {
      const adminUser = {
        id: userId,
        name: 'admin',
        email: 'admin@email.com',
        passwordHash: 'hash',
        role: userRole.ADMIN,
        createdAt: new Date(),
      } as unknown as User
      const othersContent = new Content(
        {
          authorId: new UniqueEntityId().toString(),
          title: 'someone_else_title',
          description: 'someone else description with more than 20 chars',
          Actiondate: new Date('2026-01-01'),
          imagesUrl: ['https://example.com/x.png'],
        },
        contentId,
      )
      userRepository.findById.mockResolvedValueOnce(adminUser)
      contentRepository.findById.mockResolvedValueOnce(othersContent)

      await sut.execute(input)

      expect(contentRepository.save).toHaveBeenCalledTimes(1)
    })

    it('Should throw EditorNotExistsError when the user is not found', async () => {
      userRepository.findById.mockResolvedValueOnce(null)

      await expect(sut.execute(input)).rejects.toThrow(EditorNotExistsError)
    })

    it('Should throw ContentNotFoundError when the content is not found', async () => {
      contentRepository.findById.mockResolvedValueOnce(null)

      await expect(sut.execute(input)).rejects.toThrow(ContentNotFoundError)
    })

    it('Should throw NotAllowedError when the user is neither ADMIN nor the author', async () => {
      const editorUser = {
        id: new UniqueEntityId(),
        name: 'other',
        email: 'other@email.com',
        passwordHash: 'hash',
        role: userRole.EDITOR,
        createdAt: new Date(),
      } as unknown as User
      userRepository.findById.mockResolvedValueOnce(editorUser)

      await expect(sut.execute(input)).rejects.toThrow(NotAllowedError)
    })

    it('Should throw InvalidContentError when the new title belongs to another content', async () => {
      const otherContent = new Content(
        {
          authorId: new UniqueEntityId().toString(),
          title: 'updated_title',
          description: 'other content description with more than 20 chars',
          Actiondate: new Date('2026-01-01'),
          imagesUrl: ['https://example.com/y.png'],
        },
        new UniqueEntityId(),
      )
      contentRepository.findByTitle.mockResolvedValueOnce(otherContent)

      await expect(sut.execute(input)).rejects.toThrow(InvalidContentError)
    })

    it('Should NOT call contentRepository.save when authorization fails', async () => {
      const otherEditor = {
        id: new UniqueEntityId(),
        name: 'other',
        email: 'other@email.com',
        passwordHash: 'hash',
        role: userRole.EDITOR,
        createdAt: new Date(),
      } as unknown as User
      userRepository.findById.mockResolvedValueOnce(otherEditor)

      await expect(sut.execute(input)).rejects.toThrow(NotAllowedError)
      expect(contentRepository.save).not.toHaveBeenCalled()
    })

    it('Should NOT call contentRepository.save when the new title collides with another content', async () => {
      const otherContent = new Content(
        {
          authorId: new UniqueEntityId().toString(),
          title: 'updated_title',
          description: 'other content description with more than 20 chars',
          Actiondate: new Date('2026-01-01'),
          imagesUrl: ['https://example.com/y.png'],
        },
        new UniqueEntityId(),
      )
      contentRepository.findByTitle.mockResolvedValueOnce(otherContent)

      await expect(sut.execute(input)).rejects.toThrow(InvalidContentError)
      expect(contentRepository.save).not.toHaveBeenCalled()
    })
  })

  describe('Infrastructure', () => {
    it('Should propagate the exception when userRepository.findById fails', async () => {
      userRepository.findById.mockImplementation(() => {
        throw new DataBaseConnectionError()
      })

      await expect(() => sut.execute(input)).rejects.toThrow(DataBaseConnectionError)
    })

    it('Should propagate the exception when contentRepository.findById fails', async () => {
      contentRepository.findById.mockImplementation(() => {
        throw new DataBaseConnectionError()
      })

      await expect(() => sut.execute(input)).rejects.toThrow(DataBaseConnectionError)
    })

    it('Should propagate the exception when contentRepository.findByTitle fails', async () => {
      contentRepository.findByTitle.mockImplementation(() => {
        throw new DataBaseConnectionError()
      })

      await expect(() => sut.execute(input)).rejects.toThrow(DataBaseConnectionError)
    })

    it('Should propagate the exception when contentRepository.save fails', async () => {
      contentRepository.save.mockImplementation(() => {
        throw new DataBaseConnectionError()
      })

      await expect(() => sut.execute(input)).rejects.toThrow(DataBaseConnectionError)
    })
  })
})
