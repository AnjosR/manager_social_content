import type { Password } from '#src/domain/password'

export interface HashComparer {
  compare(plainPassword: Password, hashedPassword: string): Promise<boolean>
}
