import { InvalidActionDateError } from '../errors/action-date-error.js'

export class ActionDate {
  private readonly date: Date

  private static readonly ISO_DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/

  constructor(value: string) {
    if (!ActionDate.ISO_DATE_REGEX.test(value)) {
      throw new InvalidActionDateError('Action Date must be in YYYY-MM-DD format')
    }

    const parsed = new Date(value)

    if (isNaN(parsed.getTime())) {
      throw new InvalidActionDateError()
    }

    if (parsed > new Date()) {
      throw new InvalidActionDateError('Action Date cannot be in the future')
    }

    this.date = parsed
  }

  getValue(): Date {
    return this.date
  }
}
