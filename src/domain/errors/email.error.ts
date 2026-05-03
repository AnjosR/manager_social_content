export class InvalidEmailError extends Error {
  constructor(message = 'Invalid Email Provided') {
    super(message)
  }
}
