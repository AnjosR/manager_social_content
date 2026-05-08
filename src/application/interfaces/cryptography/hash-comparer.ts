import type { Password } from '#src/domain/valueObjects/password'

export interface HashComparer {
  compare(plainPassword: Password, hashedPassword: string): Promise<boolean>
}
