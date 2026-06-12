export class InvalidDescriptionError extends Error {
  constructor(message = 'Invalid Description provided') {
    super(message)
    this.name = 'InvalidDescriptionError'
  }
}
