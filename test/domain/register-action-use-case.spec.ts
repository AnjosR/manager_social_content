import { mock, type MockProxy } from 'vitest-mock-extended'

import { RegisterActionUseCase } from '#src/Domain/useCases/register-action-use-case'
import type { RegisterAction } from '#src/Domain/contracts/registerAction.interface'
import type { RegisterActionInput } from '#src/Domain/dto/register-action.dto'
import {
  InvalidDateError,
  InvalidDescriptionError,
  InvalidMediaError,
  InvalidTitleError,
} from '#src/Domain/errors/domain-error'

describe('RegisterActionUseCase', () => {
  let sut: RegisterActionUseCase
  let registerActionMock: MockProxy<RegisterAction>

  let makeValidInput: RegisterActionInput

  beforeEach(() => {
    registerActionMock = mock<RegisterAction>()
    sut = new RegisterActionUseCase(registerActionMock)

    makeValidInput = {
      title: 'valid_title',
      description: 'any_valid_description',
      images: ['valid_image_1.jpg', 'valid_image_2.png'],
      actionDate: new Date().toISOString(),
    }
  })
  describe('Testes refer at domain', () => {
    describe('Title Validations', () => {
      test.each([undefined, null, '', '   ', 'any'])(
        'Should throw InvalidTitleError when title is invalid: %s',
        async (title: unknown) => {
          const input = { ...makeValidInput, title: title as string }
          await expect(sut.execute(input)).rejects.toThrow(InvalidTitleError)
        },
      )
    })

    describe('Description Validations', () => {
      test.each([undefined, null, '', '   '])(
        'Should throw InvalidDescriptionError when description is invalid: %s',
        async (description: unknown) => {
          const input = { ...makeValidInput, description: description as string }
          await expect(sut.execute(input)).rejects.toThrow(InvalidDescriptionError)
        },
      )
    })

    describe('ActionDate Validations', () => {
      test.each([undefined, null, '', 'invalid_date_format'])(
        'Should throw InvalidDateError when actionDate is invalid or missing: %s',
        async (actionDate: unknown) => {
          const input = { ...makeValidInput, actionDate: actionDate as string }
          await expect(sut.execute(input)).rejects.toThrow(InvalidDateError)
        },
      )

      test('Should throw InvalidDateError when actionDate is more than 30 days in the future', async () => {
        const futureDate = new Date()
        futureDate.setDate(futureDate.getDate() + 31)

        const input = { ...makeValidInput, actionDate: futureDate.toISOString() }
        await expect(sut.execute(input)).rejects.toThrow(InvalidDateError)
      })
    })

    describe('Media (Images) Validations', () => {
      test.each([undefined, null, 'not_an_array'])(
        'Should throw InvalidMediaError when images is missing or not an array: %s',
        async (images: unknown) => {
          const input = { ...makeValidInput, images: images as any }
          await expect(sut.execute(input)).rejects.toThrow(InvalidMediaError)
        },
      )

      test('Should throw InvalidMediaError when images array is empty (0 items)', async () => {
        const input = { ...makeValidInput, images: [] }
        await expect(sut.execute(input)).rejects.toThrow(InvalidMediaError)
      })

      test('Should throw InvalidMediaError when images array contains more than 10 items', async () => {
        const tooManyImages = Array(11).fill('valid_image_url')
        const input = { ...makeValidInput, images: tooManyImages }
        await expect(sut.execute(input)).rejects.toThrow(InvalidMediaError)
      })

      test.each([[['valid.png', '']], [['valid.png', '   ']], [['valid.png', null]]])(
        'Should throw InvalidMediaError when images array contains invalid strings: %j',
        async (images) => {
          const input = { ...makeValidInput, images: images as string[] }
          await expect(sut.execute(input)).rejects.toThrow(InvalidMediaError)
        },
      )
    })
  })
})
