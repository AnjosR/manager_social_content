/* eslint-disable @typescript-eslint/unbound-method */
import { mock, type MockProxy } from 'vitest-mock-extended'

import { DataBaseConnectionError } from '#src/application/erros/database-connection-error'
import { HashComparerError } from '#src/application/erros/hash-comparer-error'
import { TokenGenerationError } from '#src/application/erros/token-generator-error'
import { InvalidCredentialsError } from '#src/application/use-cases/sign-in/errors/invalid-credentials-error'
import type { SignInInput, SignInOutput, SignInUseCase } from '#src/application/use-cases/sign-in/sign-in-use-case'
import { InvalidEmailError } from '#src/domain/errors/email-error'
import { SignInController } from '#src/infra/controllers/sign-in-controller'
import type { HttpRequest } from '#src/infra/interface/http'
import type { Logger } from '#src/infra/interface/logger'

describe('SignInController', () => {
  let signIn: MockProxy<SignInUseCase>
  let logger: MockProxy<Logger>
  let request: HttpRequest<SignInInput>
  let accessToken: string
  let useCaseOutput: SignInOutput

  let sut: SignInController

  beforeEach(() => {
    accessToken = 'any_access_token'
    useCaseOutput = { accessToken }

    signIn = mock<SignInUseCase>()
    signIn.execute.mockResolvedValue(useCaseOutput)

    logger = mock<Logger>()

    request = {
      body: {
        email: 'admin@cerac.org',
        password: 'SenhaForte123!',
      },
    }

    sut = new SignInController(signIn, logger)
  })

  describe('Success (HTTP 200)', () => {
    it('Should call SignIn.execute exactly once', async () => {
      await sut.handle(request)

      expect(signIn.execute).toHaveBeenCalledTimes(1)
    })

    it('Should call SignIn.execute with email and password from the request body', async () => {
      await sut.handle(request)

      expect(signIn.execute).toHaveBeenLastCalledWith({
        email: request.body.email,
        password: request.body.password,
      })
    })

    it('Should return statusCode 200 when credentials are valid', async () => {
      const response = await sut.handle(request)

      expect(response.statusCode).toBe(200)
    })

    it('Should return accessToken in the response body when credentials are valid', async () => {
      const response = await sut.handle(request)

      expect(response.body).toStrictEqual({ accessToken })
    })

    it('Should not leak password, passwordHash or user id in the response body', async () => {
      const response = await sut.handle(request)

      const serialized = JSON.stringify(response.body)
      expect(serialized).not.toContain(request.body.password)
      expect(serialized).not.toMatch(/passwordHash/i)
      expect(serialized).not.toMatch(/"id"/)
    })
  })

  describe('Validation (HTTP 400)', () => {
    const invalidBodies: Array<{ name: string; body: unknown }> = [
      { name: 'undefined body', body: undefined },
      { name: 'null body', body: null },
      { name: 'empty object body', body: {} },
      { name: 'missing email', body: { password: 'SenhaForte123!' } },
      { name: 'empty email', body: { email: '', password: 'SenhaForte123!' } },
      { name: 'whitespace-only email', body: { email: '   ', password: 'SenhaForte123!' } },
      { name: 'email as number', body: { email: 123, password: 'SenhaForte123!' } },
      { name: 'email as object', body: { email: {}, password: 'SenhaForte123!' } },
      { name: 'email as null', body: { email: null, password: 'SenhaForte123!' } },
      { name: 'missing password', body: { email: 'admin@cerac.org' } },
      { name: 'empty password', body: { email: 'admin@cerac.org', password: '' } },
      { name: 'password as number', body: { email: 'admin@cerac.org', password: 123 } },
    ]

    it.each(invalidBodies)('Should return statusCode 400 when $name', async ({ body }) => {
      const response = await sut.handle({ body })

      expect(response.statusCode).toBe(400)
    })

    it('Should not call SignIn.execute when validation fails', async () => {
      await sut.handle({ body: {} })

      expect(signIn.execute).not.toHaveBeenCalled()
    })

    it('Should return a descriptive message that does not expose internal details', async () => {
      const response = await sut.handle({ body: {} })

      const message = (response.body as { message: string }).message
      expect(typeof message).toBe('string')
      expect(message.length).toBeGreaterThan(0)
      expect(message.toLowerCase()).not.toMatch(/stack|signin|usecase|repository|hash|token|prisma|postgres/)
    })
  })

  describe('Invalid credentials (HTTP 401)', () => {
    it('Should return statusCode 401 when SignIn throws InvalidCredentialsError (user not found)', async () => {
      signIn.execute.mockRejectedValueOnce(new InvalidCredentialsError())

      const response = await sut.handle(request)

      expect(response.statusCode).toBe(401)
    })

    it('Should return statusCode 401 when SignIn throws InvalidCredentialsError (wrong password)', async () => {
      signIn.execute.mockRejectedValueOnce(new InvalidCredentialsError())

      const response = await sut.handle(request)

      expect(response.statusCode).toBe(401)
    })

    it('Should return statusCode 401 when SignIn throws InvalidEmailError (anti-enumeration)', async () => {
      signIn.execute.mockRejectedValueOnce(new InvalidEmailError())

      const response = await sut.handle(request)

      expect(response.statusCode).toBe(401)
    })

    it('Should return the same generic message for InvalidEmailError and InvalidCredentialsError', async () => {
      signIn.execute.mockRejectedValueOnce(new InvalidCredentialsError())
      const credentialsResponse = await sut.handle(request)

      signIn.execute.mockRejectedValueOnce(new InvalidEmailError())
      const emailResponse = await sut.handle(request)

      expect(emailResponse.body).toStrictEqual(credentialsResponse.body)
    })

    it('Should return a generic error message that does not disclose whether email or password was wrong', async () => {
      signIn.execute.mockRejectedValueOnce(new InvalidCredentialsError())

      const response = await sut.handle(request)

      const message = (response.body as { message: string }).message
      expect(message).toBeTruthy()
      expect(message.toLowerCase()).not.toMatch(/email|e-mail|password|senha|user|usu[áa]rio/)
    })

    it('Should not include accessToken, stack trace or user data in the 401 response body', async () => {
      signIn.execute.mockRejectedValueOnce(new InvalidCredentialsError())

      const response = await sut.handle(request)

      const body = response.body as Record<string, unknown>
      expect(body).not.toHaveProperty('accessToken')
      expect(body).not.toHaveProperty('stack')
      expect(body).not.toHaveProperty('id')
      expect(body).not.toHaveProperty('passwordHash')
    })
  })

  describe('Unexpected errors (HTTP 500)', () => {
    const unexpectedErrors: Array<{ name: string; build: () => Error }> = [
      { name: 'generic Error', build: () => new Error('something internal exploded') },
      { name: 'DataBaseConnectionError', build: () => new DataBaseConnectionError() },
      { name: 'HashComparerError', build: () => new HashComparerError() },
      { name: 'TokenGenerationError', build: () => new TokenGenerationError() },
    ]

    it.each(unexpectedErrors)('Should return statusCode 500 when SignIn throws $name', async ({ build }) => {
      signIn.execute.mockRejectedValueOnce(build())

      const response = await sut.handle(request)

      expect(response.statusCode).toBe(500)
    })

    it('Should return a generic message and not leak the original error message', async () => {
      signIn.execute.mockRejectedValueOnce(new Error('Connection to postgres at db:5432 refused'))

      const response = await sut.handle(request)

      const serialized = JSON.stringify(response.body)
      expect(serialized).not.toContain('postgres')
      expect(serialized).not.toContain('5432')
      expect(serialized).not.toContain('Connection to postgres at db:5432 refused')
    })

    it('Should not leak the internal error class name in the 500 response body', async () => {
      signIn.execute.mockRejectedValueOnce(new DataBaseConnectionError())

      const response = await sut.handle(request)

      const serialized = JSON.stringify(response.body)
      expect(serialized).not.toContain('DataBaseConnectionError')
      expect(serialized).not.toContain('HashComparerError')
      expect(serialized).not.toContain('TokenGenerationError')
    })

    it('Should not include password, passwordHash, accessToken or stack in the 500 response body', async () => {
      signIn.execute.mockRejectedValueOnce(new DataBaseConnectionError())

      const response = await sut.handle(request)

      const body = response.body as Record<string, unknown>
      expect(body).not.toHaveProperty('accessToken')
      expect(body).not.toHaveProperty('stack')
      expect(body).not.toHaveProperty('passwordHash')
      expect(JSON.stringify(body)).not.toContain(request.body.password)
    })

    it('Should return a non-empty generic message', async () => {
      signIn.execute.mockRejectedValueOnce(new Error('internal'))

      const response = await sut.handle(request)

      const message = (response.body as { message: string }).message
      expect(typeof message).toBe('string')
      expect(message.length).toBeGreaterThan(0)
    })
  })

  describe('Logging behavior', () => {
    it('Should call logger.error exactly once when an unexpected error occurs', async () => {
      signIn.execute.mockRejectedValueOnce(new DataBaseConnectionError())

      await sut.handle(request)

      expect(logger.error).toHaveBeenCalledTimes(1)
    })

    it('Should forward the original error instance to logger.error for debugging', async () => {
      const originalError = new DataBaseConnectionError()
      signIn.execute.mockRejectedValueOnce(originalError)

      await sut.handle(request)

      expect(logger.error).toHaveBeenCalledWith(expect.any(String), originalError, expect.any(Object))
    })

    it('Should not include the plain-text password in any logger argument', async () => {
      signIn.execute.mockRejectedValueOnce(new Error('boom'))

      await sut.handle(request)

      const serialized = JSON.stringify(logger.error.mock.calls)
      expect(serialized).not.toContain(request.body.password)
    })

    it('Should not include passwordHash in logger meta', async () => {
      signIn.execute.mockRejectedValueOnce(new Error('boom'))

      await sut.handle(request)

      const serialized = JSON.stringify(logger.error.mock.calls)
      expect(serialized).not.toMatch(/passwordHash/i)
    })

    it('Should not call logger.error on the success path', async () => {
      await sut.handle(request)

      expect(logger.error).not.toHaveBeenCalled()
    })

    it('Should not call logger.error on validation failure (400)', async () => {
      await sut.handle({ body: {} })

      expect(logger.error).not.toHaveBeenCalled()
    })

    it('Should not call logger.error on invalid credentials (401)', async () => {
      signIn.execute.mockRejectedValueOnce(new InvalidCredentialsError())

      await sut.handle(request)

      expect(logger.error).not.toHaveBeenCalled()
    })

    it('Should not call logger.error when use case throws InvalidEmailError (401)', async () => {
      signIn.execute.mockRejectedValueOnce(new InvalidEmailError())

      await sut.handle(request)

      expect(logger.error).not.toHaveBeenCalled()
    })

    it('Should wrap non-Error throws into an Error before forwarding to logger', async () => {
      signIn.execute.mockRejectedValueOnce('string thrown as error')

      await sut.handle(request)

      const [, forwardedError] = logger.error.mock.calls[0] ?? []
      expect(forwardedError).toBeInstanceOf(Error)
    })
  })
})
