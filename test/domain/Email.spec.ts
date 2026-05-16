import { InvalidEmailError } from '#src/domain/errors/email-error'
import { Email } from '#src/domain/value-objects/email'

describe('Email Entity', () => {
  it.each([
    'joedoe@.com',
    '@domain.com',
    'joe@doe',
    'joe doe@test.com',
    'joe@.com.',
    'joe@doe..com',
    'joe@doe.c',
    'plainaddress',
    'joe@doe@test.com',
    '',
  ])('Should throw InvalidEmailError when email is invalid: "%s"', (invalidEmail) => {
    expect(() => {
      new Email(invalidEmail)
    }).toThrow(InvalidEmailError)
  })

  it('Should create an Email instance when email is valid', () => {
    const validEmail = 'joe@doe.com'
    const sut = new Email(validEmail)

    expect(sut.getValue()).toStrictEqual(validEmail)
  })
})
