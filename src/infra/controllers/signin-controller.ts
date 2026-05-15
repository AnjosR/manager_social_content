import { InvalidCredentialsError } from '#src/application/use-cases/sign-in/errors/invalid-credentials-error'
import type { SignInInput, SignInUseCaseInterface } from '#src/application/use-cases/sign-in/sign-in-use-case'

import type { Controller } from '../interface/controller.js'
import type { HttpRequest, HttpResponse } from '../interface/http.js'

type SignInResponseBody = { accessToken: string } | { message: string }

export class SignInController implements Controller<SignInInput, SignInResponseBody> {
  constructor(private readonly signIn: SignInUseCaseInterface) {}

  async handle(request: HttpRequest<SignInInput>): Promise<HttpResponse<SignInResponseBody>> {
    try {
      const { accessToken } = await this.signIn.execute({
        email: request.body.email,
        password: request.body.password,
      })
      return { statusCode: 200, body: { accessToken } }
    } catch (error) {
      if (error instanceof InvalidCredentialsError) {
        return { statusCode: 401, body: { message: 'Invalid credentials' } }
      }
      throw error
    }
  }
}
