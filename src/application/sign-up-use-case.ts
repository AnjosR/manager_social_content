import { Email } from '#src/domain/email'
import { User } from '#src/domain/entity/user'
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
  id: string
  name: string
  createdAt: Date
}

export class SignUpUseCase implements UseCase<SignUpInput, SignUpOutput> {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly passwordHasher: PasswordHasher,
  ) {}

  async execute({ name, email, password }: SignUpInput): Promise<SignUpOutput> {
    const normalizedName = new Name(name)
    const normalizedEmail = new Email(email)
    const normalizedPassword = new Password(password)

    const emailExists = await this.userRepository.findByEmail(normalizedEmail)
    if (emailExists) {
      throw new InvalidEmailError('Email Already Exists')
    }

    const passwordHash = await this.passwordHasher.hash(normalizedPassword)
    const createdAt = new Date()

    const user = new User({ name: normalizedName.getValue(), email: normalizedEmail.getValue(), passwordHash })
    await this.userRepository.save(user)

    return { id: user.id.toValue(), name: normalizedName.getValue(), createdAt }
  }
}
