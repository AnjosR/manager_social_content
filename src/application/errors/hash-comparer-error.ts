export class HashComparerError extends Error {
  constructor(message = 'Not Possible comparer with passowrd') {
    super(message)
    this.name = 'HashComparerError'
  }
}
