import bcrypt from 'bcrypt'

import type { PasswordHasher } from '#src/application/interfaces/password-hasher'

export class BcryptAdapter implements PasswordHasher {
  constructor(private readonly salt: number) {} 

  async hash(plainPassword: string): Promise<string> {
    return bcrypt.hash(plainPassword, this.salt)
  }
}
