export class EditorNotExistsError extends Error {
  constructor(message = 'Editor not exists') {
    super(message)
    this.name = 'EditorNotExistsError'
  }
}
