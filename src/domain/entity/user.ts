import { Entity } from './entity.js'

type UserProps = {
  name: string
  email: string
  passwordHash: string
  createdAt: Date
}

export class User extends Entity<UserProps> {
  get name() {
    return this.props.name
  }
  get email() {
    return this.props.email
  }
  get passwordHash() {
    return this.props.passwordHash
  }
}
