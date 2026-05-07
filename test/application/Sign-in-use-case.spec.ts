import { mock, type MockProxy } from 'vitest-mock-extended'

import { InvalidCredentialsError } from '#src/application/erros/invalid-credentials-error'
import type { HashComparer } from '#src/application/interfaces/hash-comparer'
import type { TokenGenerator } from '#src/application/interfaces/token-generator'
import type { UserRepository } from '#src/application/interfaces/user-repository'
import type { SignInInput } from '#src/application/sign-in-use-case'
import { SignInUseCase } from '#src/application/sign-in-use-case'
import type { Email } from '#src/domain/email'
import type { Password } from '#src/domain/password'
import { DataBaseConnectionError } from '#src/application/erros/database-connection-error'
import { HashComparerError } from '#src/application/erros/hash-comparer-error'
import { TokenGenerationError } from '#src/application/erros/token-generator-error'

describe('SignIn UseCase', () => {
  let input: SignInInput
  let email: MockProxy<Email>
  let password: MockProxy<Password>
  let hashedPassword: string
  let userRepository: MockProxy<UserRepository>
  let hashComparer: MockProxy<HashComparer>
  let tokenGenerator: MockProxy<TokenGenerator>
  let acessToken: string

  let sut: SignInUseCase

  beforeEach(() => {
    email = mock<Email>()
    email.getValue.mockResolvedValue('any@email.com')
    password = mock<Password>()
    password.getValue.mockResolvedValue('any_plain_password')
    hashedPassword = 'any_hashed_password'
    userRepository = mock<UserRepository>()
    userRepository.findByEmail.mockResolvedValue({
      id: 'any_id',
      email: email,
      hashedPassword: hashedPassword,
    })

    hashComparer = mock<HashComparer>()
    hashComparer.compare.mockResolvedValue(true)

    acessToken = 'any_acess_token'
    tokenGenerator = mock<TokenGenerator>()
    tokenGenerator.generate.mockResolvedValue(acessToken)

    input = {
      email: email,
      password: password,
    }

    sut = new SignInUseCase(userRepository, hashComparer, tokenGenerator)
  })

  describe('Behavior', () => {
    it('Should garanted UserRepository is called with correct e-mail', async () => {
      await sut.execute(input)

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(userRepository.findByEmail).toHaveBeenLastCalledWith(email)
    })
    it('Should garanted HashComparer is called with plain password and hashed password', async () => {
      await sut.execute(input)

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(hashComparer.compare).toHaveBeenLastCalledWith(password, hashedPassword)
    })
    it('Should garanted tokenGenerator is called with correct user id', async () => {
      await sut.execute(input)

      const user = {
        id: 'any_id',
        email: email,
        hashedPassword: hashedPassword,
      }

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(tokenGenerator.generate).toHaveBeenLastCalledWith(user.id)
    })

    it('Should return accessToken when valid credentials', async () => {
      await sut.execute(input)

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(tokenGenerator.generate).toHaveResolvedWith(acessToken)
    })
    it('Should throw InvalidCredentialsError when email or password not exists', async () => {
      email = mock<Email>()
      email.getValue.mockReturnValue('any_email_nonexistent')
      password = mock<Password>()
      password.getValue.mockReturnValue('any_wrong_password')

      input = {
        email: email,
        password: password,
      }

      userRepository.findByEmail.mockResolvedValueOnce(null)

      await expect(sut.execute(input)).rejects.toThrow(InvalidCredentialsError)
    })
  })

  describe('Infrastructure', () => {
    it('Should throw DataBaseConnectionError if userRepository failure', async () => {
      userRepository.findByEmail.mockImplementation(() => {
        throw new DataBaseConnectionError()
      })

      await expect(() => sut.execute(input)).rejects.toThrow(DataBaseConnectionError)
    })
    it('Should throw HashComparerError if HashComparer failure while comparing with plain_password', async () => {
      hashComparer.compare.mockImplementation(() => {
        throw new HashComparerError()
      })

      await expect(() => sut.execute(input)).rejects.toThrow(HashComparerError)
    })
    it('Should throw TokenGenerationError if token generator failure', async () => {
      tokenGenerator.generate.mockImplementation(() => {
        throw new TokenGenerationError()
      })

      await expect(() => sut.execute(input)).rejects.toThrow(TokenGenerationError)
    })
  })
})
