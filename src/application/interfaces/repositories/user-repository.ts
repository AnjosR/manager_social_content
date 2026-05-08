import type { User } from '#src/domain/entity/user'
import type { Email } from '#src/domain/valueObjects/email'

export interface UserRepository {
  findByEmail(email: Email): Promise<User | null>
  save(user: User): Promise<void>
}
