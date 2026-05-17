/* eslint-disable @typescript-eslint/unbound-method */
import { mock, type MockProxy } from 'vitest-mock-extended'

import { ContentNotFoundError } from '#src/application/erros/content-not-found-error'
import { DataBaseConnectionError } from '#src/application/erros/database-connection-error'
import type { ContentRepository } from '#src/application/interfaces/repositories/content-repository'
import { GetContentByIdUseCase } from '#src/application/use-cases/get-content-by-id/get-content-by-id-use-case'
import type { Content } from '#src/domain/entity/content'
import { UniqueEntityId } from '#src/domain/value-objects/uniqueId'

type GetContentByIdInput = {
  contentId: string
}

describe('GetContentById UseCase', () => {
  let input: GetContentByIdInput
  let mockContentId: UniqueEntityId
  let mockContent: Content
  let contentRepository: MockProxy<ContentRepository>

  let sut: GetContentByIdUseCase

  beforeEach(() => {
    mockContentId = new UniqueEntityId()

    mockContent = {
      id: mockContentId,
      authorId: new UniqueEntityId().toString(),
      title: 'any_title',
      description: 'any_description',
      Actiondate: new Date(),
      imagesUrl: ['any_url'],
    } as unknown as Content

    contentRepository = mock<ContentRepository>()
    contentRepository.findById.mockResolvedValue(mockContent)

    input = { contentId: mockContentId.toString() }

    sut = new GetContentByIdUseCase(contentRepository)
  })

  describe('Behavior', () => {
    it('Should call contentRepository.findById with the normalized contentId', async () => {
      await sut.execute(input)

      expect(contentRepository.findById).toHaveBeenCalledWith(new UniqueEntityId(input.contentId))
    })

    it('Should return the content when it exists', async () => {
      const output = await sut.execute(input)

      expect(output.content).toBe(mockContent)
    })

    it('Should throw ContentNotFoundError when the content does not exist', async () => {
      contentRepository.findById.mockResolvedValueOnce(null)

      await expect(sut.execute(input)).rejects.toThrow(ContentNotFoundError)
    })
  })

  describe('Infrastructure', () => {
    it('Should propagate the exception when contentRepository.findById fails', async () => {
      contentRepository.findById.mockImplementation(() => {
        throw new DataBaseConnectionError()
      })

      await expect(() => sut.execute(input)).rejects.toThrow(DataBaseConnectionError)
    })
  })
})
