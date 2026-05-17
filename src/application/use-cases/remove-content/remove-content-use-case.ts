import type { Content } from '#src/domain/entity/content'
import { userRole } from '#src/domain/entity/user'
import { UniqueEntityId } from '#src/domain/value-objects/uniqueId'

import { ContentNotFoundError } from '../../erros/content-not-found-error.js'
import { EditorNotExistsError } from '../../erros/editor-not-exists-error.js'
import { NotAllowedError } from '../../erros/not-allowed-error.js'
import type { ContentRepository } from '../../interfaces/repositories/content-repository.js'
import type { UserRepository } from '../../interfaces/repositories/user-repository.js'
import type { UseCase } from '../../interfaces/use-case.js'

type RemoveContentInput = {
  userId: string
  contentId: string
}
type RemoveContentOutput = {
  removedContent: Content
  deletedBy: string
  deletedAt: string
}

export class RemoveContentUseCase implements UseCase<RemoveContentInput, RemoveContentOutput> {
  constructor(
    private readonly contentRepository: ContentRepository,
    private readonly userRepository: UserRepository,
  ) {}

  async execute(input: RemoveContentInput): Promise<RemoveContentOutput> {
    const user = await this.userRepository.findById(new UniqueEntityId(input.userId))
    if (!user) {
      throw new EditorNotExistsError()
    }

    const content = await this.contentRepository.findById(new UniqueEntityId(input.contentId))
    if (!content) {
      throw new ContentNotFoundError()
    }

    const isAdmin = user.role === userRole.ADMIN
    const isAuthor = user.id.toString() === content.authorId

    if (!isAdmin && !isAuthor) {
      throw new NotAllowedError()
    }

    await this.contentRepository.delete(new UniqueEntityId(input.contentId))

    return {
      removedContent: content,
      deletedBy: input.userId,
      deletedAt: new Date().toISOString(),
    }
  }
}
