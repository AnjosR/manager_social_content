import type { Email } from '#src/domain/valueObjects/email'
import type { Password } from '#src/domain/valueObjects/password'

import { InvalidCredentialsError } from '../../errors/invalid-credentials-error.js'
import type { HashComparer } from '../../interfaces/cryptography/hash-comparer.js'
import type { TokenGenerator } from '../../interfaces/cryptography/token-generator.js'
import type { UserRepository } from '../../interfaces/repositories/user-repository.js'
import type { UseCase } from '../use-case.js'

export type SignInInput = {
  email: Email
  password: Password
}
export type SignInOutput = {
  accessToken: string
}

export class SignInUseCase implements UseCase<SignInInput, SignInOutput> {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly hashComparer: HashComparer,
    private readonly tokenGenerator: TokenGenerator,
  ) {}

  async execute(input: SignInInput): Promise<SignInOutput> {
    const user = await this.userRepository.findByEmail(input.email)
    if (!user) {
      throw new InvalidCredentialsError()
    }

    const isValid = await this.hashComparer.compare(input.password, user.getHashPassword())
    if (!isValid) {
      throw new InvalidCredentialsError()
    }

    const accessToken = await this.tokenGenerator.generate(user.id)
    return { accessToken }
  }
}
