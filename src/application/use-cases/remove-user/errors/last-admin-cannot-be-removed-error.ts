export class LastAdminCannotBeRemovedError extends Error {
  constructor(message = 'Cannot remove the last active admin') {
    super(message)
    this.name = 'LastAdminCannotBeRemovedError'
  }
}
