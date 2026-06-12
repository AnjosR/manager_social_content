import { InvalidTitleError } from '../errors/title-error.js'

export class Title {
  private static readonly MIN_CHARACTERS = 5
  private static readonly MAX_CHARACTERS = 100

  constructor(private readonly value: string) {
    this.value = value.trim()

    if (this.value.length < Title.MIN_CHARACTERS || this.value.length > Title.MAX_CHARACTERS) {
      throw new InvalidTitleError()
    }
  }

  getValue(): string {
    return this.value
  }
}
