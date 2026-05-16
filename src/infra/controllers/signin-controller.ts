import { InvalidCredentialsError } from '#src/application/use-cases/sign-in/errors/invalid-credentials-error'
import type { SignInInput, SignInUseCaseInterface } from '#src/application/use-cases/sign-in/sign-in-use-case'
import { InvalidEmailError } from '#src/domain/errors/email.error'

import type { Controller } from '../interface/controller.js'
import type { HttpRequest, HttpResponse } from '../interface/http.js'

type SignInResponseBody = { accessToken: string } | { message: string }

type validatedResult = { valid: true; body: SignInInput } | { valid: false; message: string }

export class SignInController implements Controller<SignInInput, SignInResponseBody> {
  constructor(private readonly signIn: SignInUseCaseInterface) {}

  async handle(request: HttpRequest): Promise<HttpResponse<SignInResponseBody>> {
    const validation = this.validate(request.body)
    if (!validation.valid) {
      return { statusCode: 400, body: { message: validation.message } }
    }

    try {
      const { accessToken } = await this.signIn.execute(validation.body)
      return { statusCode: 200, body: { accessToken } }
    } catch (error) {
      if (error instanceof InvalidCredentialsError || error instanceof InvalidEmailError) {
        return { statusCode: 401, body: { message: 'Invalid credentials' } }
      }
      return { statusCode: 500, body: { message: 'Internal server error' } }
    }
  }

  private validate(body: unknown): validatedResult {
    if (body === null || typeof body !== 'object') {
      return { valid: false, message: 'Request body is required' }
    }
    const candidate = body as Record<string, unknown>

    const email = candidate['email']
    if (email === undefined) return { valid: false, message: 'email is required' }
    if (typeof email !== 'string') return { valid: false, message: 'email must be a string' }
    if (email.trim().length === 0) return { valid: false, message: 'email must not be empty' }

    const password = candidate['password']
    if (password === undefined) return { valid: false, message: 'password is required' }
    if (typeof password !== 'string') return { valid: false, message: 'password must be a string' }
    if (password.length === 0) return { valid: false, message: 'password must not be empty' }

    return { valid: true, body: { email, password } }
  }
}
