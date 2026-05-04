import { mock, type MockProxy } from 'vitest-mock-extended'

import type { SignInInput } from '#src/application/DTO/sign-in-input'
import { InvalidCredentialsError } from '#src/application/erros/Invalid-credentials-error'
import type { PasswordComparer } from '#src/application/password-comparer-contract'
import { SignInUseCase } from '#src/application/SignInUseCase'
import type { TokenGenerator } from '#src/application/token-generator-contract'
import type { UserRepository } from '#src/application/user-repository'
import type { Email } from '#src/domain/email'
import type { Password } from '#src/domain/password'

describe('SignIn UseCase', () => {
  let input: SignInInput
  let email: MockProxy<Email>
  let password: MockProxy<Password>
  let hashedPassword: string
  let userRepository: MockProxy<UserRepository>
  let passwordComparer: MockProxy<PasswordComparer>
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

    passwordComparer = mock<PasswordComparer>()
    passwordComparer.comparer.mockResolvedValue(true)

    acessToken = 'any_acess_token'
    tokenGenerator = mock<TokenGenerator>()
    tokenGenerator.generate.mockResolvedValue(acessToken)

    input = {
      email: email,
      password: password,
    }

    sut = new SignInUseCase(userRepository, passwordComparer, tokenGenerator)
  })
  it('Should garanted UserRepository is called with correct e-mail', async () => {
    await sut.execute(input)

    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(userRepository.findByEmail).toHaveBeenLastCalledWith(email)
  })
  it('Should garanted PasswordComparer is called with plain password and hashed password', async () => {
    await sut.execute(input)

    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(passwordComparer.comparer).toHaveBeenLastCalledWith(password, hashedPassword)
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
    email.getValue.mockResolvedValueOnce('any_email_nonexistent')
    password = mock<Password>()
    password.getValue.mockResolvedValueOnce('any_wrong_password')

    input = {
      email: email,
      password: password,
    }

    userRepository.findByEmail.mockResolvedValueOnce(null)

    await expect(sut.execute(input)).rejects.toThrow(InvalidCredentialsError)
  })
})
