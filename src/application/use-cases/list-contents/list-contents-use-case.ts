import type { Content } from '#src/domain/entity/content'

import { InvalidPaginationError } from './errors/invalid-pagination-error.js'
import type { ContentRepository } from '../../interfaces/repositories/content-repository.js'
import type { UseCase } from '../../interfaces/use-case.js'

export type ListContentsInput = {
  page: number
  limit: number
}

export type ListContentsOutput = {
  items: Content[]
  total: number
  page: number
  limit: number
}

const MAX_LIMIT = 100

export class ListContentsUseCase implements UseCase<ListContentsInput, ListContentsOutput> {
  constructor(private readonly contentRepository: ContentRepository) {}

  async execute(input: ListContentsInput): Promise<ListContentsOutput> {
    if (!Number.isInteger(input.page) || input.page < 1) {
      throw new InvalidPaginationError('page must be an integer >= 1')
    }
    if (!Number.isInteger(input.limit) || input.limit < 1 || input.limit > MAX_LIMIT) {
      throw new InvalidPaginationError(`limit must be an integer between 1 and $100`)
    }

    const { items, total } = await this.contentRepository.findAll(input.page, input.limit)

    return { items, total, page: input.page, limit: input.limit }
  }
}
