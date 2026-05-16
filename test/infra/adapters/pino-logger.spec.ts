import { PinoLogger, type PinoLoggerLevel } from '#src/infra/adapters/pino-logger'

type CapturedLog = Record<string, unknown>

function buildSut(level: PinoLoggerLevel = 'debug'): { sut: PinoLogger; logs: CapturedLog[] } {
  const logs: CapturedLog[] = []
  const stream = {
    write: (chunk: string) => {
      logs.push(JSON.parse(chunk) as CapturedLog)
    },
  }
  const sut = new PinoLogger({ level, stream })
  return { sut, logs }
}

describe('PinoLogger', () => {
  describe('Levels', () => {
    it('Should write info records with pino level 30', () => {
      const { sut, logs } = buildSut()

      sut.info('hello')

      expect(logs).toHaveLength(1)
      expect(logs[0]?.['level']).toBe(30)
    })

    it('Should write warn records with pino level 40', () => {
      const { sut, logs } = buildSut()

      sut.warn('careful')

      expect(logs[0]?.['level']).toBe(40)
    })

    it('Should write error records with pino level 50', () => {
      const { sut, logs } = buildSut()

      sut.error('boom')

      expect(logs[0]?.['level']).toBe(50)
    })

    it('Should write debug records with pino level 20', () => {
      const { sut, logs } = buildSut()

      sut.debug('trace')

      expect(logs[0]?.['level']).toBe(20)
    })

    it('Should not write debug records when configured level is info', () => {
      const { sut, logs } = buildSut('info')

      sut.debug('trace')

      expect(logs).toHaveLength(0)
    })
  })

  describe('Record structure', () => {
    it('Should include time, level and msg on every record', () => {
      const { sut, logs } = buildSut()

      sut.info('hello')

      const record = logs[0]
      expect(record?.['time']).toStrictEqual(expect.any(Number))
      expect(record?.['level']).toStrictEqual(expect.any(Number))
      expect(record?.['msg']).toBe('hello')
    })

    it('Should merge meta fields into the record at top level', () => {
      const { sut, logs } = buildSut()

      sut.info('hello', { userId: 'abc', traceId: 'xyz' })

      expect(logs[0]).toMatchObject({ userId: 'abc', traceId: 'xyz' })
    })

    it('Should include err.name, err.message and err.stack when error is provided', () => {
      const { sut, logs } = buildSut()
      const error = new TypeError('something went wrong')

      sut.error('failed', error)

      const err = logs[0]?.['err'] as Record<string, unknown> | undefined
      expect(err?.['name']).toBe('TypeError')
      expect(err?.['message']).toBe('something went wrong')
      expect(typeof err?.['stack']).toBe('string')
    })
  })

  describe('Redaction', () => {
    const sensitiveKeys = [
      'password',
      'passwordHash',
      'authorization',
      'Authorization',
      'accessToken',
      'token',
      'secret',
    ]

    it.each(sensitiveKeys)('Should redact top-level field "%s"', (key) => {
      const { sut, logs } = buildSut()

      sut.info('hi', { [key]: 'super-secret-value' })

      expect(logs[0]?.[key]).toBe('[REDACTED]')
      expect(JSON.stringify(logs[0])).not.toContain('super-secret-value')
    })

    it('Should redact sensitive fields in nested objects', () => {
      const { sut, logs } = buildSut()

      sut.info('hi', { user: { profile: { password: 'super-secret-value' } } })

      const serialized = JSON.stringify(logs[0])
      expect(serialized).not.toContain('super-secret-value')
      expect(serialized).toContain('[REDACTED]')
    })

    it('Should redact sensitive fields inside arrays', () => {
      const { sut, logs } = buildSut()

      sut.info('hi', { users: [{ password: 'super-secret-value' }, { token: 'jwt-x' }] })

      const serialized = JSON.stringify(logs[0])
      expect(serialized).not.toContain('super-secret-value')
      expect(serialized).not.toContain('jwt-x')
    })

    it('Should not redact the msg argument', () => {
      const { sut, logs } = buildSut()

      sut.info('user password reset requested')

      expect(logs[0]?.['msg']).toBe('user password reset requested')
    })
  })
})
