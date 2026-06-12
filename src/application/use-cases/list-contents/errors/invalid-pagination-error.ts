export class InvalidPaginationError extends Error {
  constructor(message = 'Invalid pagination parameters') {
    super(message)
    this.name = 'InvalidPaginationError'
  }
}
