export class InvalidCredentialsError extends Error {
  constructor(message = 'Invalid Credentials Error') {
    super(message)
  }
}
