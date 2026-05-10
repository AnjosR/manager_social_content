export class InvalidActionDateError extends Error {
  constructor(message = 'Invalid Action Date provided') {
    super(message)
    this.name = 'invalidActionDateError'
  }
}
