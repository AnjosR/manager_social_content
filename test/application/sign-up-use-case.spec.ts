/* eslint-disable @typescript-eslint/unbound-method */
import { mock, type MockProxy } from 'vitest-mock-extended'

import type { IdGenerator } from '#src/application/interfaces/cryptography/id-generator'
import type { PasswordHasher } from '#src/application/interfaces/cryptography/password-hasher'
import type { UserRepository } from '#src/application/interfaces/repositories/user-repository'
import { SignUpUseCase, type SignUpInput } from '#src/application/usecase/auth/sign-up-use-case'
import { Email } from '#src/domain/valueObjects/email'

describe('Sign Up Use Case', () => {
  let input: SignUpInput
  let userRepository: MockProxy<UserRepository>
  let idGenerator: MockProxy<IdGenerator>
  let passwordHasher: MockProxy<PasswordHasher>
  let sut: SignUpUseCase

  beforeEach(() => {
    userRepository = mock<UserRepository>()
    userRepository.findByEmail.mockResolvedValue(null)
    userRepository.save.mockResolvedValue()

    passwordHasher = mock<PasswordHasher>()
    passwordHasher.hash.mockResolvedValue('any_hashed_password')

    idGenerator = mock<IdGenerator>()
    idGenerator.generate.mockResolvedValue('any_valid_id')

    input = {
      name: 'any_name',
      email: 'any@email.com',
      password: 'J@eD3.eio',
    }

    sut = new SignUpUseCase(userRepository, passwordHasher, idGenerator)
  })

  it('Should garanted findByEmail is called when normalized E-mail', async () => {
    await sut.execute(input)

    expect(userRepository.findByEmail).toHaveBeenCalledWith(new Email('any@email.com'))
  })
})
