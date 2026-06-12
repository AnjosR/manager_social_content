// src/infra/adapters/postgre-adapter.ts
import type { UserRepository } from '#src/application/interfaces/repositories/user-repository'
import type { User } from '#src/domain/entity/user'
import type { Email } from '#src/domain/value-objects/email'
import type { UniqueEntityId } from '#src/domain/value-objects/uniqueId'

import type { PostgresConnection } from '../database/connection.js'
import * as UserMapper from '../database/mappers/user-mapper.js'
import type { UserRow } from '../database/types/user-row.js'

export class PostgreAdapter implements UserRepository {
  constructor(private readonly connection: PostgresConnection) {}

  async findByEmail(email: Email): Promise<User | null> {
    const { rows } = await this.connection.query(
      `SELECT id, name, email, password_hash, role, created_at, updated_at, deleted_at
       FROM users
       WHERE email = $1 AND deleted_at IS NULL
       LIMIT 1`,
      [email.getValue()],
    )

    if (rows.length === 0) return null

    return UserMapper.toEntity(rows[0] as UserRow)
  }

  findById(_userId: UniqueEntityId): Promise<User | null> {
    throw new Error('Method not implemented.')
  }

  save(_user: User): Promise<void> {
    throw new Error('Method not implemented.')
  }

  delete(_userId: UniqueEntityId, _deletedAt: Date): Promise<void> {
    throw new Error('Method not implemented.')
  }

  countActiveAdmins(): Promise<number> {
    throw new Error('Method not implemented.')
  }
}
