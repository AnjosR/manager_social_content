import type { User } from '#src/domain/entity/user'
import type { Email } from '#src/domain/value-objects/email'
import type { UniqueEntityId } from '#src/domain/value-objects/uniqueId'

import type { Repository } from './repository.js'

export interface UserRepository extends Repository<User> {
  findById(userId: UniqueEntityId): Promise<User | null>
  findByEmail(email: Email): Promise<User | null>
  save(user: User): Promise<void>
  delete(userId: UniqueEntityId, deletedAt: Date): Promise<void>
  countActiveAdmins(): Promise<number>
}
