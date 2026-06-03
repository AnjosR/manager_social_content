import type { SignInInput, SignInInterface, SignInOutput } from '#src/application/use-cases/sign-in/sign-in-use-case'

import type { Controller, Request, Response } from '../interface/controller.js'

type ResquestBody = SignInInput
type ResponseBody = SignInOutput

export class SignInController implements Controller<ResquestBody, ResponseBody> {
  constructor(private readonly signIpUseCase: SignInInterface) {}

  async handle(request: Request<SignInInput>): Promise<Response<SignInOutput>> {
    const { body } = request

    const input: SignInInput = {
      email: body?.email ?? '',
      password: body?.password ?? '',
    }

    const output = await this.signIpUseCase.execute(input)

    return {
      statusCode: 200,
      body: {
        accessToken: output.accessToken,
      },
    }
  }
}
