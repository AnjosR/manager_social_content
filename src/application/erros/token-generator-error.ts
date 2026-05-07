export class TokenGenerationError extends Error {
  constructor(message = 'Error when try generate token') {
    super(message)
    this.name = 'DataBaseConnectionError'
  }
}
