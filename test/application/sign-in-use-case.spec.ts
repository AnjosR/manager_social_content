import { mock, type MockProxy } from 'vitest-mock-extended'

import { DataBaseConnectionError } from '#src/application/erros/database-connection-error'
import { HashComparerError } from '#src/application/erros/hash-comparer-error'
import { TokenGenerationError } from '#src/application/erros/token-generator-error'
import type { HashComparer } from '#src/application/interfaces/hash-comparer'
import type { UserRepository } from '#src/application/interfaces/repositories/user-repository'
import type { TokenGenerator } from '#src/application/interfaces/token-generator'
import { InvalidCredentialsError } from '#src/application/use-cases/sign-in/errors/invalid-credentials-error'
import { SignInUseCase, type SignInInput } from '#src/application/use-cases/sign-in/sign-in-use-case'
import { userRole, type User } from '#src/domain/entity/user'
import { Email } from '#src/domain/value-objects/email'
import { UniqueEntityId } from '#src/domain/value-objects/uniqueId'

describe('SignIn UseCase', () => {
  let input: SignInInput
  let hashedPassword: string
  let mockUser: User
  let mockUserId: UniqueEntityId
  let userRepository: MockProxy<UserRepository>
  let hashComparer: MockProxy<HashComparer>
  let tokenGenerator: MockProxy<TokenGenerator>
  let accessToken: string

  let sut: SignInUseCase

  beforeEach(() => {
    hashedPassword = 'any_hashed_password'
    mockUserId = new UniqueEntityId()
    mockUser = {
      id: mockUserId,
      passwordHash: hashedPassword,
      role: userRole.EDITOR,
      name: 'any_name',
      email: 'any@email.com',
      createdAt: new Date(),
    } as unknown as User

    userRepository = mock<UserRepository>()
    userRepository.findByEmail.mockResolvedValue(mockUser)

    hashComparer = mock<HashComparer>()
    hashComparer.compare.mockResolvedValue(true)

    accessToken = 'any_access_token'
    tokenGenerator = mock<TokenGenerator>()
    tokenGenerator.generate.mockResolvedValue(accessToken)

    input = {
      email: 'any@email.com',
      password: 'any_password',
    }

    sut = new SignInUseCase(userRepository, hashComparer, tokenGenerator)
  })

  describe('Behavior', () => {
    it('Should garanted UserRepository is called with correct e-mail', async () => {
      await sut.execute(input)

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(userRepository.findByEmail).toHaveBeenLastCalledWith(new Email(input.email))
    })

    it('Should garanted HashComparer is called with plain password and hashed password', async () => {
      await sut.execute(input)

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(hashComparer.compare).toHaveBeenLastCalledWith(input.password, hashedPassword)
    })

    it('Should garanted tokenGenerator is called with correct user payload', async () => {
      await sut.execute(input)

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(tokenGenerator.generate).toHaveBeenLastCalledWith({ sub: mockUserId, role: userRole.EDITOR })
    })

    it('Should return accessToken when valid credentials', async () => {
      const output = await sut.execute(input)

      expect(output.accessToken).toBe(accessToken)
    })

    it('Should throw InvalidCredentialsError when user is not found', async () => {
      userRepository.findByEmail.mockResolvedValueOnce(null)

      await expect(sut.execute(input)).rejects.toThrow(InvalidCredentialsError)
    })

    it('Should throw InvalidCredentialsError when password does not match', async () => {
      hashComparer.compare.mockResolvedValueOnce(false)

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
