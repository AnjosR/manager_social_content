import type { SignUpInput } from '#src/application/use-cases/sign-up/sign-up-use-case'

import type { Controller } from '../interface/controller.js'

type SignInPayload = SignUpInput

export class SignInController implements Controller<SignInPayload, unknown> {
  async validate(_input: unknown): Promise<unknown> {
    return null
  }

  async handle(_input: SignInPayload): Promise<unknown> {
    await this.validate(_input)
    return null
  }
}
