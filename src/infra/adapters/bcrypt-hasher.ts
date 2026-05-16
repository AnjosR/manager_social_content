import { compare, hash } from 'bcrypt'

import { HashComparerError } from '#src/application/erros/hash-comparer-error'
import type { HashComparer } from '#src/application/interfaces/hash-comparer'
import type { PasswordHasher } from '#src/application/interfaces/password-hasher'
import type { Password } from '#src/domain/value-objects/password'

const DEFAULT_COST = 10

export type BcryptHasherOptions = {
  cost?: number
}

export class BcryptHasher implements PasswordHasher, HashComparer {
  private readonly cost: number

  constructor(options: BcryptHasherOptions = {}) {
    this.cost = options.cost ?? DEFAULT_COST
  }

  async hash(password: Password): Promise<string> {
    try {
      return await hash(password.getValue(), this.cost)
    } catch {
      throw new HashComparerError('Failed to hash password')
    }
  }

  async compare(plainPassword: string, hashedPassword: string): Promise<boolean> {
    if (hashedPassword.length === 0) return false
    try {
      return await compare(plainPassword, hashedPassword)
    } catch {
      throw new HashComparerError('Failed to compare password')
    }
  }
}
