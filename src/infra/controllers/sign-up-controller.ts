import { EmailAlreadyExistsError } from '#src/application/use-cases/sign-up/errors/email-exists-error'
import type { SignUpInput, SignUpInterface, SignUpOutput } from '#src/application/use-cases/sign-up/sign-up-use-case'

import type { Controller, Request, Response } from '../interface/controller.js'

export type ResquestBody = Partial<SignUpInput>
export type ResponseBody = Partial<SignUpOutput>

export class SignUpController implements Controller<ResquestBody, ResponseBody> {
  constructor(private readonly signUpUseCase: SignUpInterface) {}

  async handle(request: Request<Partial<ResquestBody>>): Promise<Response<Partial<ResponseBody>>> {
    const { body } = request

    if (!body) return { statusCode: 400 }

    const input: SignUpInput = {
      name: body.name ?? '',
      email: body.email ?? '',
      password: body.password ?? '',
      role: body.role ?? '',
    }

    try {
      const output = await this.signUpUseCase.execute(input)

      if (output.errorMessage !== undefined) {
        return {
          statusCode: 400,
          body: {
            errorMessage: output.errorMessage,
          },
        }
      }

      return {
        statusCode: 201,
        body: output,
      }
    } catch (error) {
      if (error instanceof EmailAlreadyExistsError) {
        return {
          statusCode: 409,
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
