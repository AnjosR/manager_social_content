import { InvalidPasswordError } from './errors/password.error.js'

export class Password {
  constructor(private readonly value: string) {
    this.value = value.trim()

    if (!Password.validate(this.value)) {
      throw new InvalidPasswordError()
    }
  }

  private static validate(value: string): boolean {
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{7,72}$/
    return regex.test(value)
  }

  getValue(): string {
    return this.value
  }
}
