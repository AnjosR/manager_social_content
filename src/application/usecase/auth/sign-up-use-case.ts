import type { IdGenerator } from '#src/application/interfaces/cryptography/id-generator'
import { User } from '#src/domain/entity/user'
import { InvalidEmailError } from '#src/domain/errors/email.error'
import { Email } from '#src/domain/valueObjects/email'
import { Name } from '#src/domain/valueObjects/name'
import { Password } from '#src/domain/valueObjects/password'
import { UniqueEntityId } from '#src/domain/valueObjects/uniqueId'

import type { PasswordHasher } from '../../interfaces/cryptography/password-hasher.js'
import type { UserRepository } from '../../interfaces/repositories/user-repository.js'
import type { UseCase } from '../use-case.js'

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
    private readonly passwordHasher: PasswordHasher,
    private readonly idGenator: IdGenerator,
  ) {}

  async execute({ name, email, password }: SignUpInput): Promise<void> {
    const normalizedName = new Name(name)
    const normalizedEmail = new Email(email)
    const normalizedPassword = new Password(password)

    const emailExists = await this.userRepository.findByEmail(normalizedEmail)

    if (emailExists) {
      throw new InvalidEmailError('Email Already Exists')
    }

    const hashedPassword = await this.passwordHasher.hash(normalizedPassword.getValue())

    const geneatedUserId = this.idGenator.generate()
    const uniqueId = new UniqueEntityId(geneatedUserId)

    const user = User.create(
      {
        name: normalizedName,
        email: normalizedEmail,
        passwordHash: hashedPassword,
      },
      uniqueId,
    )

    await this.userRepository.save(user)
  }
}
