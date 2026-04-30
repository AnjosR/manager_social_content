import { Action } from '#src/Domain/entities/action'
import {
  InvalidDateError,
  InvalidDescriptionError,
  InvalidMediaError,
  InvalidTitleError,
} from '#src/Domain/errors/domain-error'

describe('Action', () => {
  const makeValidInput = () => ({
    title: 'valid_title',
    description: 'any_valid_description',
    images: ['valid_image_1.jpg', 'valid_image_2.png'],
    actionDate: new Date().toISOString(),
  })

  describe('Valid input', () => {
    test('Should create an Action when input is valid', () => {
      const input = makeValidInput()

      expect(() => new Action(input.title, input.description, input.images, input.actionDate)).not.toThrow()
    })
  })

  describe('Title Validations', () => {
    test.each([undefined, null, '', '   ', 'any'])(
      'Should throw InvalidTitleError when title is invalid: %s',
      (title: unknown) => {
        const input = { ...makeValidInput(), title: title as string }

        expect(() => new Action(input.title, input.description, input.images, input.actionDate)).toThrow(
          InvalidTitleError,
        )
      },
    )
  })

  describe('Description Validations', () => {
    test.each([undefined, null, '', '   '])(
      'Should throw InvalidDescriptionError when description is invalid: %s',
      (description: unknown) => {
        const input = { ...makeValidInput(), description: description as string }

        expect(() => new Action(input.title, input.description, input.images, input.actionDate)).toThrow(
          InvalidDescriptionError,
        )
      },
    )
  })

  describe('ActionDate Validations', () => {
    test.each([undefined, null, '', 'invalid_date_format'])(
      'Should throw InvalidDateError when actionDate is invalid or missing: %s',
      (actionDate: unknown) => {
        const input = { ...makeValidInput(), actionDate: actionDate as string }

        expect(() => new Action(input.title, input.description, input.images, input.actionDate)).toThrow(
          InvalidDateError,
        )
      },
    )

    test('Should throw InvalidDateError when actionDate is more than 30 days in the future', () => {
      const futureDate = new Date()
      futureDate.setDate(futureDate.getDate() + 31)

      const input = { ...makeValidInput(), actionDate: futureDate.toISOString() }

      expect(() => new Action(input.title, input.description, input.images, input.actionDate)).toThrow(InvalidDateError)
    })
  })

  describe('Media (Images) Validations', () => {
    test.each([undefined, null, 'not_an_array'])(
      'Should throw InvalidMediaError when images is missing or not an array: %s',
      (images: unknown) => {
        const input = { ...makeValidInput(), images: images as string[] }

        expect(() => new Action(input.title, input.description, input.images, input.actionDate)).toThrow(
          InvalidMediaError,
        )
      },
    )

    test('Should throw InvalidMediaError when images array is empty (0 items)', () => {
      const input = { ...makeValidInput(), images: [] }

      expect(() => new Action(input.title, input.description, input.images, input.actionDate)).toThrow(
        InvalidMediaError,
      )
    })

    test('Should throw InvalidMediaError when images array contains more than 10 items', () => {
      const tooManyImages = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11']
      const input = { ...makeValidInput(), images: tooManyImages }

      expect(() => new Action(input.title, input.description, input.images, input.actionDate)).toThrow(
        InvalidMediaError,
      )
    })

    test.each([[['valid.png', '']], [['valid.png', '   ']], [['valid.png', null]]])(
      'Should throw InvalidMediaError when images array contains invalid strings: %j',
      (images) => {
        const input = { ...makeValidInput(), images: images as string[] }

        expect(() => new Action(input.title, input.description, input.images, input.actionDate)).toThrow(
          InvalidMediaError,
        )
      },
    )
  })
})
