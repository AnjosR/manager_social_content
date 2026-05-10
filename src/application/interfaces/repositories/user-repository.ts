import type { User } from '#src/domain/entity/user'
import type { Email } from '#src/domain/value-objects/email'

import type { Repository } from './repository.js'

export interface UserRepository extends Repository<User> {
  findByEmail(email: Email): Promise<User | null>
  save(user: User): Promise<void>
}
