import { InvalidCredentialsError } from '#src/application/use-cases/sign-in/errors/invalid-credentials-error'
import type { SignInInput, SignInInterface, SignInOutput } from '#src/application/use-cases/sign-in/sign-in-use-case'

import type { Controller, Request, Response } from '../interface/controller.js'

type ResquestBody = SignInInput
type ResponseBody = Partial<SignInOutput> & { errorMessage?: string }

export class SignInController implements Controller<ResquestBody, ResponseBody> {
  constructor(private readonly signInUseCase: SignInInterface) {}

  async handle(request: Request<SignInInput>): Promise<Response<ResponseBody>> {
    const { body } = request

    const input: SignInInput = {
      email: body?.email ?? '',
      password: body?.password ?? '',
    }

    try {
      const output = await this.signInUseCase.execute(input)

      return {
        statusCode: 200,
        body: {
          accessToken: output.accessToken,
        },
      }
    } catch (error) {
      if (error instanceof InvalidCredentialsError) {
        return {
          statusCode: 401,
          body: {
            errorMessage: error.message,
          },
        }
      }

      return {
        statusCode: 500,
        body: {
          errorMessage: 'Internal Server Error',
        },
      }
    }
  }
}
