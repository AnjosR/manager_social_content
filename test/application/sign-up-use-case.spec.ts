/* eslint-disable @typescript-eslint/unbound-method */
import { mock, type MockProxy } from 'vitest-mock-extended'

import { InvalidRoleError } from '#src/application/erros/invalid-role-error'
import type { PasswordHasher } from '#src/application/interfaces/password-hasher'
import type { UserRepository } from '#src/application/interfaces/repositories/user-repository'
import { SignUpUseCase, type SignUpInput } from '#src/application/use-cases/sign-up/sign-up-use-case'
import { Email } from '#src/domain/value-objects/email'
import { Password } from '#src/domain/value-objects/password'

describe('Sign Up UseCase', () => {
  let input: SignUpInput
  let userRepository: MockProxy<UserRepository>
  let passwordHasher: MockProxy<PasswordHasher>
  let passwordHash: string

  let sut: SignUpUseCase
  beforeEach(() => {
    input = {
      name: 'joe Doe',
      email: 'joe@doe.com',
      password: '1@3Ksl.@#sao',
      role: 'Admin',
    }

    userRepository = mock<UserRepository>()
    userRepository.findByEmail.mockResolvedValue(null)
    passwordHasher = mock<PasswordHasher>()
    passwordHash = 'hashed_password'
    passwordHasher.hash.mockResolvedValue(passwordHash)

    sut = new SignUpUseCase(userRepository, passwordHasher)
  })

  it('Should garanted findByEmail is called when E-mail is normalized', async () => {
    await sut.execute(input)

    expect(userRepository.findByEmail).toHaveBeenCalledWith(new Email(input.email))
  })

  it('Should garanted passwordHasher is called with plain text informed', async () => {
    await sut.execute(input)

    expect(passwordHasher.hash).toHaveBeenCalledWith(new Password(input.password))
  })

  it('Should garanted IdGenerator is called for generate new ID for user', async () => {
    const userCreated = await sut.execute(input)

    expect(userCreated.id).toBeDefined()
    expect(userCreated.id).not.toBe('')
  })

  it('Should garanted UserRepository.save is called with the correct user data', async () => {
    await sut.execute(input)

    expect(userRepository.save).toHaveBeenCalledWith(
      expect.objectContaining({
        name: input.name,
        email: input.email,
        passwordHash,
      }),
    )
  })

  it('Should garanted the user is saved with passwordHash, not plain password', async () => {
    await sut.execute(input)

    expect(userRepository.save).toHaveBeenCalledWith(expect.objectContaining({ passwordHash }))
    expect(userRepository.save).not.toHaveBeenCalledWith(expect.objectContaining({ passwordHash: input.password }))
  })

  it('Should garanted the output returns createdAt as a Date', async () => {
    const output = await sut.execute(input)

    expect(output.createdAt).toBeInstanceOf(Date)
  })

  it('Should throw InvalidRoleError when role is invalid', async () => {
    input.role = 'INVALID_ROLE'

    await expect(sut.execute(input)).rejects.toThrow(InvalidRoleError)
  })
})
