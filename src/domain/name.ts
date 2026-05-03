export class Name {
  constructor(private readonly value: string) {
    this.value = value.trim()
  }

  getValue(): string {
    return this.value
  }
}
