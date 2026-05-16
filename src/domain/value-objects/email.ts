import { InvalidEmailError } from '../errors/email-error.js'

export class Email {
  constructor(private readonly value: string) {
    this.value = value.trim().toLowerCase()

    if (!Email.validate(this.value)) {
      throw new InvalidEmailError()
    }
  }

  private static validate(email: string): boolean {
    const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)*\.[a-zA-Z]{2,}$/
    return regex.test(email)
  }

  getValue(): string {
    return this.value
  }
}
