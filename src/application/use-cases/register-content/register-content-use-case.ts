import { Content } from '#src/domain/entity/content'
import { ActionDate } from '#src/domain/value-objects/actionDate'
import { Description } from '#src/domain/value-objects/description'
import { ImagesURL } from '#src/domain/value-objects/imagesUrl'
import { Title } from '#src/domain/value-objects/title'
import { UniqueEntityId } from '#src/domain/value-objects/uniqueId'

import { InvalidContentError } from './errors/invalid-content-error.js'
import { EditorNotExistsError } from '../../erros/editor-not-exists-error.js'
import type { ContentRepository } from '../../interfaces/repositories/content-repository.js'
import type { UserRepository } from '../../interfaces/repositories/user-repository.js'
import type { UseCase } from '../../interfaces/use-case.js'

type RegisterContentInput = {
  authorId: string
  title: string
  description: string
  actionDate: string
  imagesURL: string[]
}

type RegisterContentOutput = {
  content: Content
}

export class RegisterContentUseCase implements UseCase<RegisterContentInput, RegisterContentOutput> {
  constructor(
    private readonly contentRepository: ContentRepository,
    private readonly userRepository: UserRepository,
  ) {}

  async execute(input: RegisterContentInput): Promise<RegisterContentOutput> {
    const author = await this.userRepository.findById(new UniqueEntityId(input.authorId))
    if (!author) {
      throw new EditorNotExistsError()
    }

    const normalizedTitle = new Title(input.title)
    const normalizedDescription = new Description(input.description)
    const normalizedActionDate = new ActionDate(input.actionDate)
    const normalizedImagesURL = new ImagesURL(input.imagesURL)

    const contentAlreadyExists = await this.contentRepository.findByTitle(normalizedTitle.getValue())
    if (contentAlreadyExists) {
      throw new InvalidContentError()
    }

    const content = new Content({
      authorId: input.authorId,
      title: normalizedTitle.getValue(),
      description: normalizedDescription.getValue(),
      Actiondate: normalizedActionDate.getValue(),
      imagesUrl: normalizedImagesURL.getValue(),
    })

    await this.contentRepository.save(content)

    return { content }
  }
}
