import { Name } from '#src/domain/valueObjects/name'

describe('Name Entity', () => {
  it('Should create an Name instance when name is valid', () => {
    const validName = 'Joe Doe'
    const sut = new Name(validName)

    expect(sut.getValue()).toStrictEqual(validName)
  })
})
