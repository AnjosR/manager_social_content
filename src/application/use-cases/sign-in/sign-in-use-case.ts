import type { UseCase } from '#src/application/interfaces/use-case'
import { Email } from '#src/domain/value-objects/email'

import { InvalidCredentialsError } from './errors/invalid-credentials-error.js'
import type { HashComparer } from '../../interfaces/hash-comparer.js'
import type { UserRepository } from '../../interfaces/repositories/user-repository.js'
import type { AccessTokenGenerator } from '../../interfaces/token-manipulate.js'

export type SignInInput = {
  email: string
  password: string
}

export type SignInOutput = {
  accessToken: string
}

export type SignInInterface = UseCase<SignInInput, SignInOutput>

export type SignInUseCaseInterface = UseCase<SignInInput, SignInOutput>

export class SignInUseCase implements UseCase<SignInInput, SignInOutput> {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly hashComparer: HashComparer,
    private readonly tokenGenerator: AccessTokenGenerator,
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

    const accessToken = await this.tokenGenerator.generateToken({
      sub: user.id,
      role: user.role,
    })
    return { accessToken }
  }
}
