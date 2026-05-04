import type { Password } from '#src/domain/password';

export interface PasswordComparer {
  comparer(plainPassword: Password, hashedPassword: string): Promise<boolean>
}
