import type { Password } from '#src/domain/value-objects/password'

export interface PasswordHasher {
  hash(value: Password): Promise<string>
}
