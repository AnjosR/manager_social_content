import type { AuthenticatedUser } from '#src/application/models/authenticated-user'
import type { Email } from '#src/domain/email'

export interface UserRepository {
  findByEmail(email: Email): Promise<AuthenticatedUser | null>
}
