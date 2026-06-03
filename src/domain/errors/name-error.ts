export class InvalidNameError extends Error {
  constructor(message = 'Invalid name provided') {
    super(message)
    this.name = 'InvalidNameError'
  }
}
