export class InvalidPasswordError extends Error {
  constructor(message = 'Invalid password provided') {
    super(message)
    this.name = 'InvalidPasswordError'
  }
}
