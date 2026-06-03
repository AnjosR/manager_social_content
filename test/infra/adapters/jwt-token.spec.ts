import { decodeJwt, SignJWT, UnsecuredJWT } from 'jose'

import { InvalidTokenError } from '#src/application/erros/invalid-token-error'
import { TokenGenerationError } from '#src/application/erros/token-generator-error'
import type { Payload } from '#src/application/interfaces/token-manipulate'
import { userRole } from '#src/domain/entity/user'
import { UniqueEntityId } from '#src/domain/value-objects/uniqueId'
import { type JwtConfig, JwtTokenGenerator, JwtTokenVerifier } from '#src/infra/adapters/jwt-token'

const SECRET_BYTES = new TextEncoder().encode('a'.repeat(64))

const config: JwtConfig = {
  secret: 'a'.repeat(64),
  ttl: '15m',
  issuer: 'cerac-cms',
  audience: 'cerac-cms-clients',
}

function buildPayload(): Payload {
  return {
    sub: new UniqueEntityId('9a11f510-56c7-41f3-b5c0-6fc52a6d4fd4'),
    role: userRole.EDITOR,
  }
}

describe('JwtTokenGenerator (integration with real jose)', () => {
  let sut: JwtTokenGenerator
  let payload: Payload

  beforeEach(() => {
    sut = new JwtTokenGenerator(config)
    payload = buildPayload()
  })

  it('Should return a non-empty string', async () => {
    const token = await sut.generate(payload)

    expect(typeof token).toBe('string')
    expect(token.length).toBeGreaterThan(0)
  })

  it('Should return a JWT with three dot-separated segments', async () => {
    const token = await sut.generate(payload)

    expect(token.split('.')).toHaveLength(3)
  })

  it('Should encode HS256 in the protected header', async () => {
    const token = await sut.generate(payload)
    const [headerB64] = token.split('.')

    const header = JSON.parse(Buffer.from(headerB64 ?? '', 'base64url').toString()) as Record<string, unknown>
    expect(header['alg']).toBe('HS256')
  })

  it('Should put userId.toValue() in the sub claim', async () => {
    const token = await sut.generate(payload)

    const claims = decodeJwt(token)
    expect(claims.sub).toBe(payload.sub.toValue())
  })

  it('Should put the user role in the role claim', async () => {
    const token = await sut.generate(payload)

    const claims = decodeJwt(token)
    expect(claims['role']).toBe(payload.role)
  })

  it('Should set iss and aud from config', async () => {
    const token = await sut.generate(payload)

    const claims = decodeJwt(token)
    expect(claims.iss).toBe(config.issuer)
    expect(claims.aud).toBe(config.audience)
  })

  it('Should set an exp claim consistent with the configured ttl', async () => {
    const token = await sut.generate(payload)

    const claims = decodeJwt(token)
    const fifteenMinutesInSeconds = 15 * 60
    expect(claims.exp).toBeDefined()
    expect(claims.iat).toBeDefined()
    expect((claims.exp ?? 0) - (claims.iat ?? 0)).toBe(fifteenMinutesInSeconds)
  })

  it('Should not include sensitive user data such as passwordHash or email', async () => {
    const token = await sut.generate(payload)

    const claims = decodeJwt(token)
    expect(claims).not.toHaveProperty('passwordHash')
    expect(claims).not.toHaveProperty('email')
    expect(claims).not.toHaveProperty('password')
  })

  it('Should throw TokenGenerationError when the underlying sign call fails', async () => {
    const spy = vi.spyOn(SignJWT.prototype, 'sign').mockRejectedValueOnce(new Error('jose internal failure'))

    await expect(sut.generate(payload)).rejects.toBeInstanceOf(TokenGenerationError)
    spy.mockRestore()
  })
})

describe('JwtTokenVerifier (integration with real jose)', () => {
  let generator: JwtTokenGenerator
  let sut: JwtTokenVerifier
  let payload: Payload

  beforeEach(() => {
    generator = new JwtTokenGenerator(config)
    sut = new JwtTokenVerifier(config)
    payload = buildPayload()
  })

  it('Should return { sub, role } for a valid token (round-trip)', async () => {
    const token = await generator.generate(payload)

    const result = await sut.verify(token)

    expect(result.sub.toValue()).toBe(payload.sub.toValue())
    expect(result.role).toBe(payload.role)
  })

  it('Should return sub as a UniqueEntityId instance', async () => {
    const token = await generator.generate(payload)

    const result = await sut.verify(token)

    expect(result.sub).toBeInstanceOf(UniqueEntityId)
  })

  it('Should throw InvalidTokenError when the token signature is invalid', async () => {
    const token = await generator.generate(payload)
    const tampered = `${token.slice(0, -4)}AAAA`

    await expect(sut.verify(tampered)).rejects.toBeInstanceOf(InvalidTokenError)
  })

  it('Should throw InvalidTokenError when the token is expired', async () => {
    const expiredToken = await new SignJWT({ role: payload.role })
      .setProtectedHeader({ alg: 'HS256' })
      .setSubject(payload.sub.toValue())
      .setIssuer(config.issuer)
      .setAudience(config.audience)
      .setExpirationTime(Math.floor(Date.now() / 1000) - 60)
      .sign(SECRET_BYTES)

    await expect(sut.verify(expiredToken)).rejects.toBeInstanceOf(InvalidTokenError)
  })

  it('Should throw InvalidTokenError when the token was signed with a different secret', async () => {
    const otherSecret = new TextEncoder().encode('b'.repeat(64))
    const foreignToken = await new SignJWT({ role: payload.role })
      .setProtectedHeader({ alg: 'HS256' })
      .setSubject(payload.sub.toValue())
      .setIssuer(config.issuer)
      .setAudience(config.audience)
      .setExpirationTime('15m')
      .sign(otherSecret)

    await expect(sut.verify(foreignToken)).rejects.toBeInstanceOf(InvalidTokenError)
  })

  it('Should throw InvalidTokenError when iss does not match', async () => {
    const wrongIssuerToken = await new SignJWT({ role: payload.role })
      .setProtectedHeader({ alg: 'HS256' })
      .setSubject(payload.sub.toValue())
      .setIssuer('attacker')
      .setAudience(config.audience)
      .setExpirationTime('15m')
      .sign(SECRET_BYTES)

    await expect(sut.verify(wrongIssuerToken)).rejects.toBeInstanceOf(InvalidTokenError)
  })

  it('Should throw InvalidTokenError when aud does not match', async () => {
    const wrongAudienceToken = await new SignJWT({ role: payload.role })
      .setProtectedHeader({ alg: 'HS256' })
      .setSubject(payload.sub.toValue())
      .setIssuer(config.issuer)
      .setAudience('attacker-clients')
      .setExpirationTime('15m')
      .sign(SECRET_BYTES)

    await expect(sut.verify(wrongAudienceToken)).rejects.toBeInstanceOf(InvalidTokenError)
  })

  it('Should throw InvalidTokenError when the token is malformed', async () => {
    await expect(sut.verify('not-a-jwt')).rejects.toBeInstanceOf(InvalidTokenError)
  })

  it('Should reject unsecured tokens (alg: "none")', async () => {
    const unsecuredToken = new UnsecuredJWT({ role: payload.role })
      .setSubject(payload.sub.toValue())
      .setIssuer(config.issuer)
      .setAudience(config.audience)
      .setExpirationTime('15m')
      .encode()

    await expect(sut.verify(unsecuredToken)).rejects.toBeInstanceOf(InvalidTokenError)
  })

  it('Should throw InvalidTokenError when the payload is missing sub', async () => {
    const noSubToken = await new SignJWT({ role: payload.role })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuer(config.issuer)
      .setAudience(config.audience)
      .setExpirationTime('15m')
      .sign(SECRET_BYTES)

    await expect(sut.verify(noSubToken)).rejects.toBeInstanceOf(InvalidTokenError)
  })

  it('Should throw InvalidTokenError when the payload is missing role', async () => {
    const noRoleToken = await new SignJWT({})
      .setProtectedHeader({ alg: 'HS256' })
      .setSubject(payload.sub.toValue())
      .setIssuer(config.issuer)
      .setAudience(config.audience)
      .setExpirationTime('15m')
      .sign(SECRET_BYTES)

    await expect(sut.verify(noRoleToken)).rejects.toBeInstanceOf(InvalidTokenError)
  })

  it('Should throw InvalidTokenError when role is not part of the userRole enum', async () => {
    const invalidRoleToken = await new SignJWT({ role: 'Hacker' })
      .setProtectedHeader({ alg: 'HS256' })
      .setSubject(payload.sub.toValue())
      .setIssuer(config.issuer)
      .setAudience(config.audience)
      .setExpirationTime('15m')
      .sign(SECRET_BYTES)

    await expect(sut.verify(invalidRoleToken)).rejects.toBeInstanceOf(InvalidTokenError)
  })
})
