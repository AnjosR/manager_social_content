export class InvalidContentError extends Error {
  constructor(message = 'Invalid Conent Provided') {
    super(message)
    this.name = 'invalidContentError'
  }
}
