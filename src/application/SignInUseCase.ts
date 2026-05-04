import { InvalidPasswordError } from '#src/domain/errors/password.error'
import type { UseCase } from '#src/use-case-contract'

import type { SignInInput } from './DTO/sign-in-input.js'
import type { SignInOutput } from './DTO/sign-in-output.js'
import { InvalidCredentialsError } from './erros/Invalid-credentials-error.js'
import type { PasswordComparer } from './password-comparer-contract.js'
import type { TokenGenerator } from './token-generator-contract.js'
import type { UserRepository } from './user-repository.js'

export class SignInUseCase implements UseCase<SignInInput, SignInOutput> {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly passwordComparer: PasswordComparer,
    private readonly tokenGenerator: TokenGenerator,
  ) {}

  async execute(input: SignInInput): Promise<SignInOutput> {
    const user = await this.userRepository.findByEmail(input.email)
    if (!user) {
      throw new InvalidCredentialsError()
    }
    const result = await this.passwordComparer.comparer(input.password, user.hashedPassword)
    if (!result) {
      throw new InvalidPasswordError()
    }
    const accesToken = this.tokenGenerator.generate(user.id)

    return { accesToken }
  }
}
