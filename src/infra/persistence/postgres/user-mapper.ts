import { User, userRole } from '#src/domain/entity/user'
import { UniqueEntityId } from '#src/domain/value-objects/uniqueId'

export type UserRow = {
  id: string
  name: string
  email: string
  password_hash: string
  role: string
  created_at: Date
}

export class InvalidUserRowError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'InvalidUserRowError'
  }
}

function parseRole(rawRole: string): userRole {
  if (!Object.values(userRole).includes(rawRole as userRole)) {
    throw new InvalidUserRowError(`Unknown role "${rawRole}" persisted in users table`)
  }
  return rawRole as userRole
}

function toEntity(row: UserRow): User {
  return new User(
    {
      name: row.name,
      email: row.email,
      passwordHash: row.password_hash,
      role: parseRole(row.role),
      createdAt: row.created_at,
    },
    new UniqueEntityId(row.id),
  )
}

function toPersistence(user: User): UserRow {
  return {
    id: user.id.toValue(),
    name: user.name,
    email: user.email,
    password_hash: user.passwordHash,
    role: user.role,
    created_at: user.createdAt,
  }
}

export const UserMapper = {
  toEntity,
  toPersistence,
} as const
