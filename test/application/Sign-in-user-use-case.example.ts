// import { mock, type MockProxy } from 'vitest-mock-extended'

// import type { Name } from '#src/domain/name'
// import type { Password } from '#src/domain/password'

// type SignInInput = {
//   name: Name
//   password: Password
// }

// type SignInOutput = {
//   output: string
// }

// export interface UseCase<Input, Output> {
//   execute(input: Input): Output
// }

// export class SignInUseCase implements UseCase<SignInInput, SignInOutput> {
//   constructor() {}

//   execute(input: SignInInput): SignInOutput {
//     return { output: 'test' }
//   }
// }

// describe('SignIn User UseCase', () => {
//   let name: MockProxy<Name>
//   let password: MockProxy<Password>
//   let signInInput: SignInInput
//   let accessToken: string
//   let sut: SignInUseCase

//   beforeEach(() => {
//     name = mock<Name>()
//     name.getValue.mockResolvedValue('Joe Doe')
//     password = mock<Password>()
//     password.getValue.mockResolvedValue('J0eDo3.')

//     signInInput = {
//       name: name,
//       password: password,
//     }

//     accessToken = 'any_access_token'
//     sut = new SignInUseCase(signInInput)
//   })
//   it('Should SignIn user with sucess when user inputs is valid', () => {
//     expect(sut.execute()).toBe(accessToken)
//   })
// })
