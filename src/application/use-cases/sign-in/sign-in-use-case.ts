import { Email } from '#src/domain/value-objects/email'

import { InvalidCredentialsError } from './errors/invalid-credentials-error.js'
import type { HashComparer } from '../../interfaces/hash-comparer.js'
import type { UserRepository } from '../../interfaces/repositories/user-repository.js'
import type { TokenGenerator } from '../../interfaces/token-generator.js'
import type { UseCase } from '../../interfaces/use-case.js'

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

    const user = await this.userRepository.findByEmail(normalizedEmail)
    if (!user) {
      throw new InvalidCredentialsError()
    }

    const passwordMatches = await this.hashComparer.compare(input.password, user.passwordHash)
    if (!passwordMatches) {
      throw new InvalidCredentialsError()
    }

    const accessToken = await this.tokenGenerator.generate({
      sub: user.id,
      role: user.role,
    })
    return { accessToken }
  }
}
