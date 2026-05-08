// src/domain/entity/user.ts
import { Entity } from './entity.js'
import type { Email } from '../valueObjects/email.js'
import type { Name } from '../valueObjects/name.js'
import type { UniqueEntityId } from '../valueObjects/uniqueId.js'

export interface UserProps {
  name: Name
  email: Email
  passwordHash: string
  createdAt?: Date
}

export class User extends Entity<UserProps> {
  private constructor(props: UserProps, id: UniqueEntityId) {
    super(props, id)
  }

  getHashPassword(): string {
    return this.props.passwordHash
  }

  static create(props: UserProps, id: UniqueEntityId): User {
    const user = new User(
      {
        ...props,
        createdAt: props.createdAt ?? new Date(),
      },
      id,
    )

    return user
  }
}
