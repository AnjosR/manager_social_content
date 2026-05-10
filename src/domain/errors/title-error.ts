export class InvalidTitleError extends Error {
  constructor(message = 'Invalid Title provided') {
    super(message)
    this.name = 'InvalidTitleError'
  }
}
