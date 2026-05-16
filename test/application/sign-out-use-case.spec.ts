import { mock, type MockProxy } from 'vitest-mock-extended'

import { DataBaseConnectionError } from '#src/application/erros/database-connection-error'
import type { Payload, TokenDisabler, TokenVerifier } from '#src/application/interfaces/token-manipulate'
import { InvalidTokenError } from '#src/application/use-cases/sign-out/errors/invalid-token-error'
import { SignOutUseCase, type SignOutInput } from '#src/application/use-cases/sign-out/sign-out-use-case'
import { userRole } from '#src/domain/entity/user'
import { UniqueEntityId } from '#src/domain/value-objects/uniqueId'

describe('SignOut UseCase', () => {
  let input: SignOutInput
  let mockPayload: Payload
  let tokenVerifier: MockProxy<TokenVerifier>
  let tokenDisabler: MockProxy<TokenDisabler>

  let sut: SignOutUseCase

  beforeEach(() => {
    mockPayload = {
      sub: new UniqueEntityId(),
      role: userRole.EDITOR,
    }

    tokenVerifier = mock<TokenVerifier>()
    tokenVerifier.verify.mockResolvedValue(mockPayload)

    tokenDisabler = mock<TokenDisabler>()
    tokenDisabler.disable.mockResolvedValue(undefined)

    input = {
      userToken: 'any_valid_token',
    }

    sut = new SignOutUseCase(tokenVerifier, tokenDisabler)
  })

  describe('Behavior', () => {
    it('Should garanted TokenVerifier is called with received token', async () => {
      await sut.execute(input)

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(tokenVerifier.verify).toHaveBeenLastCalledWith(input.userToken)
    })

    it('Should garanted TokenDisabler is called with received token when verify passes', async () => {
      await sut.execute(input)

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(tokenDisabler.disable).toHaveBeenLastCalledWith(input.userToken)
    })

    it('Should resolve when token is valid and disabled successfully', async () => {
      await expect(sut.execute(input)).resolves.toBeUndefined()
    })

    it('Should resolve when token is already disabled (idempotent)', async () => {
      tokenDisabler.disable.mockResolvedValueOnce(undefined)

      await expect(sut.execute(input)).resolves.toBeUndefined()
    })

    it('Should throw InvalidTokenError when TokenVerifier fails', async () => {
      tokenVerifier.verify.mockRejectedValueOnce(new Error('jwt malformed'))

      await expect(sut.execute(input)).rejects.toThrow(InvalidTokenError)
    })

    it('Should not call TokenDisabler when token is invalid', async () => {
      tokenVerifier.verify.mockRejectedValueOnce(new Error('jwt malformed'))

      await expect(sut.execute(input)).rejects.toThrow(InvalidTokenError)
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(tokenDisabler.disable).not.toHaveBeenCalled()
    })
  })

  describe('Infrastructure', () => {
    it('Should throw DataBaseConnectionError if TokenDisabler failure', async () => {
      tokenDisabler.disable.mockImplementation(() => {
        throw new DataBaseConnectionError()
      })

      await expect(() => sut.execute(input)).rejects.toThrow(DataBaseConnectionError)
    })
  })
})
