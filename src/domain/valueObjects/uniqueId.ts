export class UniqueEntityId {
  private value: string

  toString() {
    return this.value
  }

  toValue() {
    return this.value
  }

  constructor(value: string) {
    if (!value) {
      throw new Error('ID is required')
    }
    this.value = value
  }
}
