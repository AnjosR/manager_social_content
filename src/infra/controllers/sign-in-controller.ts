import { InvalidCredentialsError } from '#src/application/use-cases/sign-in/errors/invalid-credentials-error'
import type { SignInInput, SignInInterface, SignInOutput } from '#src/application/use-cases/sign-in/sign-in-use-case'

import type { Controller, Request, Response } from '../interface/controller.js'
import { signInBodySchema } from './schemas/sign-in-schema.js'

type ResquestBody = SignInInput
type ResponseBody = Partial<SignInOutput> & { errorMessage?: string }

export class SignInController implements Controller<ResquestBody, ResponseBody> {
  constructor(private readonly signInUseCase: SignInInterface) {}

  async handle(request: Request<unknown>): Promise<Response<ResponseBody>> {
    const parsed = signInBodySchema.safeParse(request.body)
    if (!parsed.success) {
      const errorMessage = parsed.error.issues.map((i) => i.message).join('; ')
      return {
        statusCode: 400,
        body: { errorMessage },
      }
    }

    try {
      const output = await this.signInUseCase.execute(parsed.data)
      return { statusCode: 200, body: { accessToken: output.accessToken } }
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
