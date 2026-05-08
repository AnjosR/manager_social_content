import { InvalidNameError } from '../errors/name.error.js'

export class Name {
  private static readonly MIN_LENGTH = 3

  constructor(private readonly value: string) {
    this.value = value.trim()

    if (this.value.length < Name.MIN_LENGTH) {
      throw new InvalidNameError()
    }
  }

  getValue(): string {
    return this.value
  }
}
