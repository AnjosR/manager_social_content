export class InvalidRoleError extends Error {
  constructor(message = 'Invalid role provided') {
    super(message)
    this.name = 'InvalidRoleError'
  }
}
