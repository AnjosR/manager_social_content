import type { AuthenticatedUser } from '#src/application/models/authenticated-user'
import type { Email } from '#src/domain/email'

import type { SignUpInput } from '../sign-up-use-case.js'

export interface UserRepository {
  findByEmail(email: Email): Promise<AuthenticatedUser | null>
  save(user: SignUpInput): Promise<void>
}
