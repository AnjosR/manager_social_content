import { Email } from '#src/domain/email'
import { Password } from '#src/domain/password'

import { InvalidCredentialsError } from './erros/invalid-credentials-error.js'
import type { HashComparer } from './interfaces/hash-comparer.js'
import type { TokenGenerator } from './interfaces/token-generator.js'
import type { UseCase } from './interfaces/use-case.js'
import type { UserRepository } from './interfaces/user-repository.js'

export type SignInInput = {
  email: string
  password: string
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
    const normalizedEmail = new Email(input.email)
    const normalizedPassword = new Password(input.password)

    const user = await this.userRepository.findByEmail(normalizedEmail)
    if (!user) {
      throw new InvalidCredentialsError()
    }

    const passwordMatches = await this.hashComparer.compare(normalizedPassword, user.hashedPassword)
    if (!passwordMatches) {
      throw new InvalidCredentialsError()
    }

    const accessToken = await this.tokenGenerator.generate(user.id)
    return { accessToken }
  }
}
