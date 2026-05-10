import type { Password } from '#src/domain/password'

export interface PasswordHasher {
  hash(value: Password): Promise<string>
}
