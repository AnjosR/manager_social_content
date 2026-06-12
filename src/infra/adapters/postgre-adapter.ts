import type { UserRepository } from '#src/application/interfaces/repositories/user-repository'
import type { User } from '#src/domain/entity/user'
import type { Email } from '#src/domain/value-objects/email'
import type { UniqueEntityId } from '#src/domain/value-objects/uniqueId'

export class PostgreAdapter implements UserRepository {
  findById(_userId: UniqueEntityId): Promise<User | null> {
    throw new Error('Method not implemented.')
  }

  findByEmail(_email: Email): Promise<User | null> {
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
