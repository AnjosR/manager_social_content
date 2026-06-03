import { User, userRole } from '#src/domain/entity/user'
import { InvalidEmailError } from '#src/domain/errors/email-error'
import { InvalidNameError } from '#src/domain/errors/name-error'
import { InvalidPasswordError } from '#src/domain/errors/password-error'
import { Email } from '#src/domain/value-objects/email'
import { Name } from '#src/domain/value-objects/name'
import { Password } from '#src/domain/value-objects/password'

import type { PasswordHasher } from '../../interfaces/password-hasher.js'
import type { UserRepository } from '../../interfaces/repositories/user-repository.js'
import type { UseCase } from '../../interfaces/use-case.js'

export type SignUpInput = {
  name: string
  email: string
  password: string
  role: string
}

export type SignUpOutput = {
  id?: string
  name?: string
  createdAt?: Date
  errorMessage?: string
}

export type SignUpInterface = UseCase<SignUpInput, SignUpOutput>

export class SignUpUseCase implements UseCase<SignUpInput, SignUpOutput> {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly passwordHasher: PasswordHasher,
  ) {}

  async execute(input: SignUpInput): Promise<SignUpOutput> {
    try {
      const normalizedName = new Name(input.name)
      const normalizedEmail = new Email(input.email)
      const normalizedPassword = new Password(input.password)

      const emailExists = await this.userRepository.findByEmail(normalizedEmail)
      if (emailExists) {
        return { errorMessage: 'Email Already Exists' }
      }

      const passwordHash = await this.passwordHasher.hash(normalizedPassword.getValue())
      const createdAt = new Date()

      if (!Object.values(userRole).includes(input.role as userRole)) {
        return { errorMessage: 'Invalid role provided' }
      }
      const role = input.role as userRole

      const user = new User({
        name: normalizedName.getValue(),
        email: normalizedEmail.getValue(),
        passwordHash,
        createdAt,
        role,
      })
      await this.userRepository.save(user)

      return { id: user.id.toValue(), name: normalizedName.getValue(), createdAt }
    } catch (error: unknown) {
      if (
        error instanceof InvalidNameError ||
        error instanceof InvalidEmailError ||
        error instanceof InvalidPasswordError
      ) {
        return { errorMessage: error.message }
      }

      throw error
    }
  }
}
