import { HashComparerError } from '#src/application/erros/hash-comparer-error'
import { Password } from '#src/domain/value-objects/password'
import { BcryptHasher } from '#src/infra/adapters/bcrypt-hasher'

describe('BcryptHasher (integration with real bcrypt)', () => {
  const TEST_COST = 4
  let sut: BcryptHasher
  let validPassword: Password

  beforeEach(() => {
    sut = new BcryptHasher({ cost: TEST_COST })
    validPassword = new Password('SenhaForte1!')
  })

  describe('hash(password)', () => {
    it('Should return a non-empty string', async () => {
      const result = await sut.hash(validPassword)

      expect(typeof result).toBe('string')
      expect(result.length).toBeGreaterThan(0)
    })

    it('Should return a string different from the plaintext password', async () => {
      const result = await sut.hash(validPassword)

      expect(result).not.toBe(validPassword.getValue())
    })

    it('Should return different hashes for the same password on distinct calls (random salt)', async () => {
      const first = await sut.hash(validPassword)
      const second = await sut.hash(validPassword)

      expect(first).not.toBe(second)
    })

    it('Should embed the configured cost factor in the hash prefix', async () => {
      const result = await sut.hash(validPassword)

      expect(result).toMatch(/^\$2[aby]\$04\$/)
    })

    it('Should never contain the plaintext password as a substring of the hash', async () => {
      const result = await sut.hash(validPassword)

      expect(result).not.toContain(validPassword.getValue())
    })
  })

  describe('compare(plain, hash)', () => {
    it('Should return true for a matching password/hash pair', async () => {
      const hashed = await sut.hash(validPassword)

      const result = await sut.compare(validPassword.getValue(), hashed)

      expect(result).toBe(true)
    })

    it('Should return false when the password is wrong', async () => {
      const hashed = await sut.hash(validPassword)

      const result = await sut.compare('WrongPass1!', hashed)

      expect(result).toBe(false)
    })

    it('Should return false when the hash is not a bcrypt-shaped string', async () => {
      const result = await sut.compare(validPassword.getValue(), 'definitely-not-a-bcrypt-hash')

      expect(result).toBe(false)
    })

    it('Should return false when the hash is an empty string', async () => {
      const result = await sut.compare(validPassword.getValue(), '')

      expect(result).toBe(false)
    })

    it('Should propagate failures as HashComparerError when bcrypt.compare throws internally', async () => {
      const unsafe = sut as unknown as { compare(plain: unknown, hash: unknown): Promise<boolean> }

      await expect(unsafe.compare(undefined, 'anything')).rejects.toBeInstanceOf(HashComparerError)
    })
  })

  describe('Password VO coupling', () => {
    it('Should use the public Password.getValue() API rather than reading private fields', async () => {
      const spy = vi.spyOn(validPassword, 'getValue')

      await sut.hash(validPassword)

      expect(spy).toHaveBeenCalled()
    })
  })

  describe('Performance sanity check', () => {
    it('Should complete a hash + compare cycle in under 500ms at cost 4', async () => {
      const start = Date.now()

      const hashed = await sut.hash(validPassword)
      await sut.compare(validPassword.getValue(), hashed)

      const elapsed = Date.now() - start
      expect(elapsed).toBeLessThan(500)
    })
  })
})
