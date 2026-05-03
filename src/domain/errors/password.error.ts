export class InvalidPasswordError extends Error {
  constructor(message = 'Invalid Password Provided') {
    super(message)
  }
}
