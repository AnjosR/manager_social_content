// import { mock, type MockProxy } from 'vitest-mock-extended'

// import type { UserRepository } from '#src/application/interfaces/user-repository'
// import { SignUpUseCase, type SignUpInput } from '#src/application/sign-up-use-case'
// import type { Email } from '#src/domain/email'
// import { Name } from '#src/domain/name'
// import type { Password } from '#src/domain/password'

// describe('SignIn UseCase', () => {
//   let input: SignUpInput
//   let email: MockProxy<Email>
//   let password: MockProxy<Password>
//   let userRepository: MockProxy<UserRepository>

//   let sut: SignUpUseCase

//   beforeEach(() => {
//     password = mock<Password>()
//     password.getValue.mockResolvedValue('any_plain_password')
//     email = mock<Email>()
//     email.getValue.mockResolvedValue('joedoe@email.com')
//     input = {
//       name: new Name('joe Doe'),
//       email: email,
//       password: password,
//     }

//     sut = new SignUpUseCase()
//   })

//   it('Should garanted findByEmail is called when normalized Email', async () => {
//     const result = sut.execute(input)
//     expect(userRepository.findByEmail())
//   })
// })
