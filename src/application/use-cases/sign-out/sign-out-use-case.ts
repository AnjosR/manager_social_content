import { InvalidTokenError } from '#src/application/erros/invalid-token-error'
import type { AccessTokenDisabler, AccessTokenVerifier } from '#src/application/interfaces/token-manipulate'
import type { UseCase } from '#src/application/interfaces/use-case'

export type SignOutInput = {
  userToken: string
}

export class SignOutUseCase implements UseCase<SignOutInput, void> {
  constructor(
    private readonly tokenVerifier: AccessTokenVerifier,
    private readonly tokenDisabler: AccessTokenDisabler,
  ) {}

  async execute(input: SignOutInput): Promise<void> {
    try {
      await this.tokenVerifier.verifyToken(input.userToken)
    } catch {
      throw new InvalidTokenError()
    }

    await this.tokenDisabler.disableToken(input.userToken)
  }
}
