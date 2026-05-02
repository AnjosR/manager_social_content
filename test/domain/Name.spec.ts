export class Name {
  constructor(private readonly value: string) {
    this.value = value.trim()
  }

  getValue(): string {
    return this.value
  }
}

describe('Name Entity', () => {
  it('Should create an Name instance when name is valid', () => {
    const validName = 'Joe Doe'
    const sut = new Name(validName)

    expect(sut.getValue()).toStrictEqual(validName)
  })
})
