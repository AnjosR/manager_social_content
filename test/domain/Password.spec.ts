import { InvalidPasswordError } from '#src/domain/errors/password.error'
import { Password } from '#src/domain/value-objects/password'

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
