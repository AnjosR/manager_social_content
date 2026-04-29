export class DomainError extends Error {
  constructor(message: string) {
    super(message)
  }
}

export class InvalidTitleError extends DomainError {
  constructor(message = 'Invalid Title Error') {
    super(message)
  }
}

export class InvalidDescriptionError extends DomainError {
  constructor(message = 'Invalid Description Error') {
    super(message)
  }
}

export class InvalidDateError extends DomainError {
  constructor(message = 'Invalid Date Error') {
    super(message)
  }
}

export class InvalidMediaError extends DomainError {
  constructor(message = 'Invalid Media Error') {
    super(message)
  }
}
