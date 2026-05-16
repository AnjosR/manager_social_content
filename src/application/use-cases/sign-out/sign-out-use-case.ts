import type { TokenDisabler, TokenVerifier } from '#src/application/interfaces/token-manipulate'
import type { UseCase } from '#src/application/interfaces/use-case'

import { InvalidTokenError } from './errors/invalid-token-error.js'

export type SignOutInput = {
  userToken: string
}

export class SignOutUseCase implements UseCase<SignOutInput, void> {
  constructor(
    private readonly tokenVerifier: TokenVerifier,
    private readonly tokenDisabler: TokenDisabler,
  ) {}

  async execute(input: SignOutInput): Promise<void> {
    try {
      await this.tokenVerifier.verify(input.userToken)
    } catch {
      throw new InvalidTokenError()
    }

    await this.tokenDisabler.disable(input.userToken)
  }
}
