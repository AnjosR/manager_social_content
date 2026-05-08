import { Email } from '#src/domain/email'
import { InvalidEmailError } from '#src/domain/errors/email.error'
import { Name } from '#src/domain/name'
import { Password } from '#src/domain/password'

import type { PasswordHasher } from './interfaces/password-hasher.js'
import type { UseCase } from './interfaces/use-case.js'
import type { UserRepository } from './interfaces/user-repository.js'

export type SignUpInput = {
  name: string
  email: string
  password: string
}

export type SignUpOutput = {
  user: {
    id: string
    name: string
    createdAt: string
  }
}

export class SignUpUseCase implements UseCase<SignUpInput, void> {
  constructor(
    private readonly userRepository: UserRepository,
    private passwordHasher: PasswordHasher,
  ) {}

  async execute({ name, email, password }: SignUpInput): Promise<void> {
    const _normalizedName = new Name(name)
    const normalizedEmail = new Email(email)
    const _normalizedPassword = new Password(password)

    const emailExists = await this.userRepository.findByEmail(normalizedEmail)

    if (emailExists) {
      throw new InvalidEmailError('Email Already Exists')
    }

    const _hashedPassword = await this.passwordHasher.hash(password)
  }
}
