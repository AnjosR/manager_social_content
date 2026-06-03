export class DataBaseConnectionError extends Error {
  constructor(message = 'Error when try connect database') {
    super(message)
    this.name = 'DataBaseConnectionError'
  }
}
