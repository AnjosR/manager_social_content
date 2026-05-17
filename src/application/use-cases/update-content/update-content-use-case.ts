import { Content } from '#src/domain/entity/content'
import { userRole } from '#src/domain/entity/user'
import { ActionDate } from '#src/domain/value-objects/actionDate'
import { Description } from '#src/domain/value-objects/description'
import { ImagesURL } from '#src/domain/value-objects/imagesUrl'
import { Title } from '#src/domain/value-objects/title'
import { UniqueEntityId } from '#src/domain/value-objects/uniqueId'

import { ContentNotFoundError } from '../../erros/content-not-found-error.js'
import { EditorNotExistsError } from '../../erros/editor-not-exists-error.js'
import { NotAllowedError } from '../../erros/not-allowed-error.js'
import type { ContentRepository } from '../../interfaces/repositories/content-repository.js'
import type { UserRepository } from '../../interfaces/repositories/user-repository.js'
import type { UseCase } from '../../interfaces/use-case.js'
import { InvalidContentError } from '../register-content/errors/invalid-content-error.js'

export type UpdateContentInput = {
  userId: string
  contentId: string
  title?: string
  description?: string
  actionDate?: string
  imagesURL?: string[]
}

export type UpdateContentOutput = {
  content: Content
}

export class UpdateContentUseCase implements UseCase<UpdateContentInput, UpdateContentOutput> {
  constructor(
    private readonly contentRepository: ContentRepository,
    private readonly userRepository: UserRepository,
  ) {}

  async execute(input: UpdateContentInput): Promise<UpdateContentOutput> {
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

    const nextTitle = input.title !== undefined ? new Title(input.title).getValue() : content.title
    const nextDescription =
      input.description !== undefined ? new Description(input.description).getValue() : content.description
    const nextActionDate =
      input.actionDate !== undefined ? new ActionDate(input.actionDate).getValue() : content.Actiondate
    const nextImagesUrl = input.imagesURL !== undefined ? new ImagesURL(input.imagesURL).getValue() : content.imagesUrl

    if (nextTitle !== content.title) {
      const existing = await this.contentRepository.findByTitle(nextTitle)
      if (existing && existing.id.toValue() !== content.id.toValue()) {
        throw new InvalidContentError()
      }
    }

    const updated = new Content(
      {
        authorId: content.authorId,
        title: nextTitle,
        description: nextDescription,
        Actiondate: nextActionDate,
        imagesUrl: nextImagesUrl,
      },
      content.id,
    )

    await this.contentRepository.save(updated)

    return { content: updated }
  }
}
