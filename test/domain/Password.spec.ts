<<<<<<< HEAD
import { InvalidPasswordError } from '#src/domain/errors/password.error'
import { Password } from '#src/domain/password'
=======
export class InvalidPasswordError extends Error {
  constructor(message = 'Invalid Password Provided') {
    super(message)
  }
}

export class Password {
  constructor(private readonly value: string) {
    this.value = value.trim()

    if (!Password.validate(this.value)) {
      throw new InvalidPasswordError()
    }
  }

  private static validate(value: string): boolean {
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{7,72}$/
    return regex.test(value)
  }

  getValue(): string {
    return this.value
  }
}
>>>>>>> 0411db3 (Refactor all test files on Domain)

describe('Password Entity', () => {
  it.each([
    '',
    '1234567',
    'a'.repeat(73),
    'senhasemletramaiuscula1!',
    'SENHASEMLETRAMINUSCULA1!',
    'SenhaSemNumero!',
    'SenhaSemEspecial123',
    '        ',
    '   aB3!   ',
  ])('Should throw a InvalidPasswordError when a password provided is invalid: "%s"', (invalidPassword) => {
    expect(() => {
      new Password(invalidPassword)
    }).toThrow(InvalidPasswordError)
  })

  it('Should create a Password instance when a password reaches the minimum length', () => {
    const minimumPassword = 'J0eDo3.'
    const sut = new Password(minimumPassword)

    expect(sut.getValue()).toStrictEqual(minimumPassword)
  })
  it('Should create a Password instance when a password reaches the maximum length', () => {
    const minimumPassword = 'SenhaForte123!@#$ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz012'
    const sut = new Password(minimumPassword)

    expect(sut.getValue()).toStrictEqual(minimumPassword)
  })
  it('Should create a Password instance when a password have space', () => {
    const passowordWithSpace = 'J0eD@3 example'
    const sut = new Password(passowordWithSpace)

    expect(sut.getValue()).toStrictEqual(passowordWithSpace)
  })
})
