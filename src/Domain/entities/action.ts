import {
  InvalidDateError,
  InvalidDescriptionError,
  InvalidMediaError,
  InvalidTitleError,
} from '../errors/domain-error.js'

export class Action {
  constructor(
    private readonly title: string,
    private readonly description: string,
    private readonly images: string[],
    private readonly actionDate: string,
  ) {
    if (!title || title.trim() === '' || title.length < 5) {
      throw new InvalidTitleError()
    }

    if (!description || description.trim() === '') {
      throw new InvalidDescriptionError()
    }

    if (!actionDate || isNaN(Date.parse(actionDate))) {
      throw new InvalidDateError()
    }
    const dateObj = new Date(actionDate)
    const maxFutureDate = new Date()
    maxFutureDate.setDate(maxFutureDate.getDate() + 30)

    if (dateObj > maxFutureDate) {
      throw new InvalidDateError()
    }

    if (!images || !Array.isArray(images)) {
      throw new InvalidMediaError()
    }
    if (images.length === 0 || images.length > 10) {
      throw new InvalidMediaError()
    }
    const hasInvalidString = images.some((img) => !img || typeof img !== 'string' || img.trim() === '')
    if (hasInvalidString) {
      throw new InvalidMediaError()
    }
  }
}
