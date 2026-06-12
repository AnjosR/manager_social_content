import { Entity } from './entity.js'

export enum userRole {
  ADMIN = 'Admin',
  EDITOR = 'Editor',
}
type UserProps = {
  name: string
  email: string
  passwordHash: string
  role: userRole
  createdAt: Date
  deletedAt?: Date | null
  updatedAt?: Date | null
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
  get role() {
    return this.props.role
  }
  get createdAt() {
    return this.props.createdAt
  }
  get deletedAt(): Date | null {
    return this.props.deletedAt ?? null
  }
  get updatedAt(): Date | null {
    return this.props.updatedAt ?? null
  }
}
