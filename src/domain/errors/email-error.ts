export class InvalidEmailError extends Error {
  constructor(message = 'Invalid email provided') {
    super(message)
    this.name = 'InvalidEmailError'
  }
}
