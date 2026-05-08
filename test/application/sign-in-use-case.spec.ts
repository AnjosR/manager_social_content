import { mock, type MockProxy } from 'vitest-mock-extended'

import { DataBaseConnectionError } from '#src/application/errors/database-connection-error'
import { HashComparerError } from '#src/application/errors/hash-comparer-error'
import { InvalidCredentialsError } from '#src/application/errors/invalid-credentials-error'
import { TokenGenerationError } from '#src/application/errors/token-generator-error'
import type { HashComparer } from '#src/application/interfaces/cryptography/hash-comparer'
import type { TokenGenerator } from '#src/application/interfaces/cryptography/token-generator'
import type { UserRepository } from '#src/application/interfaces/repositories/user-repository'
import { SignInUseCase, type SignInInput } from '#src/application/usecase/auth/sign-in-use-case'
import type { User } from '#src/domain/entity/user'
import type { Email } from '#src/domain/valueObjects/email'
import type { Password } from '#src/domain/valueObjects/password'
import type { UniqueEntityId } from '#src/domain/valueObjects/uniqueId'

describe('SignIn UseCase', () => {
  let input: SignInInput
  let email: MockProxy<Email>
  let password: MockProxy<Password>
  let uniqueEntityId: MockProxy<UniqueEntityId>
  let hashedPassword: string
  let userRepository: MockProxy<UserRepository>
  let hashComparer: MockProxy<HashComparer>
  let tokenGenerator: MockProxy<TokenGenerator>
  let acessToken: string

  let sut: SignInUseCase

  beforeEach(() => {
    email = mock<Email>()
    email.getValue.mockReturnValue('any@email.com')
    password = mock<Password>()
    password.getValue.mockReturnValue('any_plain_password')
    uniqueEntityId = mock<UniqueEntityId>()
    uniqueEntityId.toString.mockReturnValue('any_valid_id')
    hashedPassword = 'any_hashed_password'
    const userMock = mock<User>()
    userMock.getHashPassword.mockReturnValue(hashedPassword)

    Object.defineProperty(userMock, 'id', { get: () => uniqueEntityId })

    userRepository = mock<UserRepository>()
    userRepository.findByEmail.mockResolvedValue(userMock)

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
