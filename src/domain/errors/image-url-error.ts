export class InvalidImageUrlError extends Error {
  constructor(message = 'Invalid Image Url provided') {
    super(message)
    this.name = 'InvalidImageUrlError'
  }
}
