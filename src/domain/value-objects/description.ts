import { InvalidDescriptionError } from '../errors/description-error.js'

export class Description {
  private static readonly MIN_CHARACTERS = 20
  private static readonly MAX_CHARACTERS = 500

  constructor(private readonly value: string) {
    this.value = value.trim()

    if (this.value.length < Description.MIN_CHARACTERS || this.value.length > Description.MAX_CHARACTERS) {
      throw new InvalidDescriptionError()
    }
  }

  getValue(): string {
    return this.value
  }
}
