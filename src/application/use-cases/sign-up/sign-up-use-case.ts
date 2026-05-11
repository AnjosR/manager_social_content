import { User, userRole } from '#src/domain/entity/user'
import { Email } from '#src/domain/value-objects/email'
import { Name } from '#src/domain/value-objects/name'
import { Password } from '#src/domain/value-objects/password'

import { EmailAlreadyExistsError } from './errors/email-exists-error.js'
import { InvalidRoleError } from './errors/invalid-role-error.js'
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
  id: string
  name: string
  createdAt: Date
}

export class SignUpUseCase implements UseCase<SignUpInput, SignUpOutput> {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly passwordHasher: PasswordHasher,
  ) {}

  async execute(input: SignUpInput): Promise<SignUpOutput> {
    const normalizedName = new Name(input.name)
    const normalizedEmail = new Email(input.email)
    const normalizedPassword = new Password(input.password)

    const emailExists = await this.userRepository.findByEmail(normalizedEmail)
    if (emailExists) {
      throw new EmailAlreadyExistsError('Email Already Exists')
    }

    const passwordHash = await this.passwordHasher.hash(normalizedPassword)
    const createdAt = new Date()

    if (!Object.values(userRole).includes(input.role as userRole)) {
      throw new InvalidRoleError()
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
  }
}
