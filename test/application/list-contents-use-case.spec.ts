/* eslint-disable @typescript-eslint/unbound-method */
import { mock, type MockProxy } from 'vitest-mock-extended'

import { DataBaseConnectionError } from '#src/application/erros/database-connection-error'
import type { ContentRepository } from '#src/application/interfaces/repositories/content-repository'
import { InvalidPaginationError } from '#src/application/use-cases/list-contents/errors/invalid-pagination-error'
import { ListContentsUseCase } from '#src/application/use-cases/list-contents/list-contents-use-case'
import type { Content } from '#src/domain/entity/content'
import { UniqueEntityId } from '#src/domain/value-objects/uniqueId'

type ListContentsInput = {
  page: number
  limit: number
}

function buildContent(): Content {
  return {
    id: new UniqueEntityId(),
    authorId: new UniqueEntityId().toString(),
    title: 'any_title',
    description: 'any_description',
    Actiondate: new Date(),
    imagesUrl: ['any_url'],
  } as unknown as Content
}

describe('ListContents UseCase', () => {
  let input: ListContentsInput
  let items: Content[]
  let contentRepository: MockProxy<ContentRepository>

  let sut: ListContentsUseCase

  beforeEach(() => {
    items = [buildContent(), buildContent()]
    contentRepository = mock<ContentRepository>()
    contentRepository.findAll.mockResolvedValue({ items, total: 42 })

    input = { page: 1, limit: 10 }

    sut = new ListContentsUseCase(contentRepository)
  })

  describe('Behavior', () => {
    it('Should call contentRepository.findAll with the input page and limit', async () => {
      await sut.execute(input)

      expect(contentRepository.findAll).toHaveBeenCalledWith(input.page, input.limit)
    })

    it('Should return items, total, page and limit', async () => {
      const output = await sut.execute(input)

      expect(output.items).toBe(items)
      expect(output.total).toBe(42)
      expect(output.page).toBe(input.page)
      expect(output.limit).toBe(input.limit)
    })

    it('Should return an empty list when there are no contents', async () => {
      contentRepository.findAll.mockResolvedValueOnce({ items: [], total: 0 })

      const output = await sut.execute(input)

      expect(output.items).toStrictEqual([])
      expect(output.total).toBe(0)
    })

    it('Should throw InvalidPaginationError when page < 1', async () => {
      await expect(sut.execute({ page: 0, limit: 10 })).rejects.toThrow(InvalidPaginationError)
    })

    it('Should throw InvalidPaginationError when page is not an integer', async () => {
      await expect(sut.execute({ page: 1.5, limit: 10 })).rejects.toThrow(InvalidPaginationError)
    })

    it('Should throw InvalidPaginationError when limit < 1', async () => {
      await expect(sut.execute({ page: 1, limit: 0 })).rejects.toThrow(InvalidPaginationError)
    })

    it('Should throw InvalidPaginationError when limit exceeds the maximum (100)', async () => {
      await expect(sut.execute({ page: 1, limit: 101 })).rejects.toThrow(InvalidPaginationError)
    })

    it('Should NOT call contentRepository.findAll when pagination is invalid', async () => {
      await expect(sut.execute({ page: 0, limit: 10 })).rejects.toThrow(InvalidPaginationError)

      expect(contentRepository.findAll).not.toHaveBeenCalled()
    })
  })

  describe('Infrastructure', () => {
    it('Should propagate the exception when contentRepository.findAll fails', async () => {
      contentRepository.findAll.mockImplementation(() => {
        throw new DataBaseConnectionError()
      })

      await expect(() => sut.execute(input)).rejects.toThrow(DataBaseConnectionError)
    })
  })
})
