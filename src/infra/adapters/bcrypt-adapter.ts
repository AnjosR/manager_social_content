import bcrypt from 'bcrypt'

import type { HashComparer } from '#src/application/interfaces/hash-comparer'
import type { PasswordHasher } from '#src/application/interfaces/password-hasher'

export class BcryptAdapter implements PasswordHasher, HashComparer {
  constructor(private readonly salt: number) {}

  async hash(plainPassword: string): Promise<string> {
    return bcrypt.hash(plainPassword, this.salt)
  }

  async compare(plainPassword: string, hashPassword: string): Promise<boolean> {
    return bcrypt.compare(plainPassword, hashPassword)
  }
}