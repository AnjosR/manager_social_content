// src/infra/database/mappers/user-mapper.ts
import { User, userRole } from '#src/domain/entity/user'
import { UniqueEntityId } from '#src/domain/value-objects/uniqueId'

import type { UserRow } from '../types/user-row.js'

export function toEntity(row: UserRow): User {
  if (!Object.values(userRole).includes(row.role as userRole)) {
    throw new Error(`Invalid role in database: ${row.role}`)
  }

  return new User(
    {
      name: row.name,
      email: row.email,
      passwordHash: row.password_hash,
      role: row.role as userRole,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      deletedAt: row.deleted_at,
    },
    new UniqueEntityId(row.id),
  )
}

export function toPersistence(user: User): UserRow {
  return {
    id: user.id.toValue(),
    name: user.name,
    email: user.email,
    password_hash: user.passwordHash,
    role: user.role,
    created_at: user.createdAt,
    updated_at: user.updatedAt,
    deleted_at: user.deletedAt,
  }
}
