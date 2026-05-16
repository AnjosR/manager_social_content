import { InvalidEmailError } from '#src/domain/errors/email-error'

export class EmailAlreadyExistsError extends InvalidEmailError {
  constructor(message = 'Email Already Exists') {
    super(message)
    this.name = 'EmailAlreadyExistsError'
  }
}
