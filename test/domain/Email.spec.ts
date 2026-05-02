<<<<<<< HEAD
import { Email } from '#src/domain/email'
import { InvalidEmailError } from '#src/domain/errors/email.error'
=======
export class InvalidEmailError extends Error {
  constructor(message = 'Invalid Email Provided') {
    super(message)
  }
}

export class Email {
  constructor(private readonly value: string) {
    this.value = value.trim().toLowerCase()

    if (!Email.validate(this.value)) {
      throw new InvalidEmailError()
    }
  }

  private static validate(email: string): boolean {
    const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)*\.[a-zA-Z]{2,}$/
    return regex.test(email)
  }

  getValue(): string {
    return this.value
  }
}
>>>>>>> 0411db3 (Refactor all test files on Domain)

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
