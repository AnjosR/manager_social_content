import type { AuthenticatedUser } from '#src/application/models/authenticated-user'
import type { Email } from '#src/domain/email'
import type { User } from '#src/domain/entity/user'

export interface UserRepository {
  findByEmail(email: Email): Promise<AuthenticatedUser | null>
  save(user: User): Promise<void>
}
