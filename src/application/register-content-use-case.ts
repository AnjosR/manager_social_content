import { Content } from '#src/domain/entity/content'
import { ActionDate } from '#src/domain/value-objects/actionDate'
import { Description } from '#src/domain/value-objects/description'
import { ImagesURL } from '#src/domain/value-objects/imagesUrl'
import { Title } from '#src/domain/value-objects/title'

import { InvalidContentError } from './erros/invalid-content-error.js'
import type { ContentRepository } from './interfaces/repositories/content-repository.js'
import type { UseCase } from './interfaces/use-case.js'

type RegisterContentInput = {
  title: string
  description: string
  actionDate: string
  imagesURL: string[]
}

type RegisterContentOutput = {
  content: Content
}

export class RegisterContentUseCase implements UseCase<RegisterContentInput, RegisterContentOutput> {
  constructor(private readonly contentRepository: ContentRepository) {}

  async execute(input: RegisterContentInput): Promise<RegisterContentOutput> {
    const normalizedTitle = new Title(input.title)
    const normalizedDescription = new Description(input.description)
    const normalizedActionDate = new ActionDate(input.actionDate)
    const normalizedImagesURL = new ImagesURL(input.imagesURL)

    const contentAlreadyExists = await this.contentRepository.findByTitle(normalizedTitle.getValue())
    if (contentAlreadyExists) {
      throw new InvalidContentError()
    }

    const content = new Content({
      title: normalizedTitle.getValue(),
      description: normalizedDescription.getValue(),
      Actiondate: normalizedActionDate.getValue(),
      imagesUrl: normalizedImagesURL.getValue(),
    })

    await this.contentRepository.save(content)

    return { content }
  }
}
