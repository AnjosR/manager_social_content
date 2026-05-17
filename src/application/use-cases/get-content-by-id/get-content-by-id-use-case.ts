import type { Content } from '#src/domain/entity/content'
import { UniqueEntityId } from '#src/domain/value-objects/uniqueId'

import { ContentNotFoundError } from '../../erros/content-not-found-error.js'
import type { ContentRepository } from '../../interfaces/repositories/content-repository.js'
import type { UseCase } from '../../interfaces/use-case.js'

export type GetContentByIdInput = {
  contentId: string
}

export type GetContentByIdOutput = {
  content: Content
}

export class GetContentByIdUseCase implements UseCase<GetContentByIdInput, GetContentByIdOutput> {
  constructor(private readonly contentRepository: ContentRepository) {}

  async execute(input: GetContentByIdInput): Promise<GetContentByIdOutput> {
    const content = await this.contentRepository.findById(new UniqueEntityId(input.contentId))
    if (!content) {
      throw new ContentNotFoundError()
    }

    return { content }
  }
}
