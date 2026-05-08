import { InvalidNameError } from '#src/domain/errors/name.error'
import { Name } from '#src/domain/name'

describe('Name Entity', () => {
  it.each(['', '  ', 'ab'])('Should throw InvalidNameError when name is invalid: "%s"', (invalidName) => {
    expect(() => {
      new Name(invalidName)
    }).toThrow(InvalidNameError)
  })
  it('Should create an Name instance when name is valid', () => {
    const validName = 'Joe Doe'
    const sut = new Name(validName)

    expect(sut.getValue()).toStrictEqual(validName)
  })
})
