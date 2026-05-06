import type { Email } from '#src/domain/email'
import type { Password } from '#src/domain/password'

import { InvalidCredentialsError } from './erros/invalid-credentials-error.js'
import type { HashComparer } from './interfaces/hash-comparer.js'
import type { TokenGenerator } from './interfaces/token-generator.js'
import type { UseCase } from './interfaces/use-case.js'
import type { UserRepository } from './interfaces/user-repository.js'

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

    const passwordMatches = await this.hashComparer.compare(input.password, user.hashedPassword)
    if (!passwordMatches) {
      throw new InvalidCredentialsError()
    }

    const accessToken = await this.tokenGenerator.generate(user.id)
    return { accessToken }
  }
}
