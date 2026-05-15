/* eslint-disable @typescript-eslint/unbound-method */
import { mock, type MockProxy } from 'vitest-mock-extended'

import { InvalidCredentialsError } from '#src/application/use-cases/sign-in/errors/invalid-credentials-error'
import type { SignInInput, SignInOutput, SignInUseCase } from '#src/application/use-cases/sign-in/sign-in-use-case'
import { SignInController } from '#src/infra/controllers/signin-controller'
import type { HttpRequest } from '#src/infra/interface/http'

describe('SignInController', () => {
  let signIn: MockProxy<SignInUseCase>
  let request: HttpRequest<SignInInput>
  let accessToken: string
  let useCaseOutput: SignInOutput

  let sut: SignInController

  beforeEach(() => {
    accessToken = 'any_access_token'
    useCaseOutput = { accessToken }

    signIn = mock<SignInUseCase>()
    signIn.execute.mockResolvedValue(useCaseOutput)

    request = {
      body: {
        email: 'admin@cerac.org',
        password: 'SenhaForte123!',
      },
    }

    sut = new SignInController(signIn)
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
})
