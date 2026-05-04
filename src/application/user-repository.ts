import type { Email } from '#src/domain/email'

import type { User } from './DTO/user-dto.js'

export interface UserRepository {
  findByEmail(value: Email): Promise<User | null>
}
