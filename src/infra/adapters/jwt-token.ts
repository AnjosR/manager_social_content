import { jwtVerify, SignJWT } from 'jose'

import { InvalidTokenError } from '#src/application/erros/invalid-token-error'
import { TokenGenerationError } from '#src/application/erros/token-generator-error'
import type { Payload, TokenGenerator, TokenVerifier } from '#src/application/interfaces/token-manipulate'
import { userRole } from '#src/domain/entity/user'
import { UniqueEntityId } from '#src/domain/value-objects/uniqueId'

const ALGORITHM = 'HS256'

export type JwtConfig = {
  secret: string
  ttl: string
  issuer: string
  audience: string
}

function encodeSecret(secret: string): Uint8Array {
  return new TextEncoder().encode(secret)
}

export class JwtTokenGenerator implements TokenGenerator {
  private readonly secret: Uint8Array
  private readonly ttl: string
  private readonly issuer: string
  private readonly audience: string

  constructor(config: JwtConfig) {
    this.secret = encodeSecret(config.secret)
    this.ttl = config.ttl
    this.issuer = config.issuer
    this.audience = config.audience
  }

  async generate(payload: Payload): Promise<string> {
    try {
      return await new SignJWT({ role: payload.role })
        .setProtectedHeader({ alg: ALGORITHM })
        .setSubject(payload.sub.toValue())
        .setIssuedAt()
        .setIssuer(this.issuer)
        .setAudience(this.audience)
        .setExpirationTime(this.ttl)
        .sign(this.secret)
    } catch {
      throw new TokenGenerationError()
    }
  }
}

export class JwtTokenVerifier implements TokenVerifier {
  private readonly secret: Uint8Array
  private readonly issuer: string
  private readonly audience: string

  constructor(config: JwtConfig) {
    this.secret = encodeSecret(config.secret)
    this.issuer = config.issuer
    this.audience = config.audience
  }

  async verify(token: string): Promise<Payload> {
    let verified
    try {
      verified = await jwtVerify(token, this.secret, {
        algorithms: [ALGORITHM],
        issuer: this.issuer,
        audience: this.audience,
      })
    } catch {
      throw new InvalidTokenError()
    }

    const { sub, role } = verified.payload
    if (typeof sub !== 'string' || sub.length === 0) {
      throw new InvalidTokenError()
    }
    if (typeof role !== 'string' || !Object.values(userRole).includes(role as userRole)) {
      throw new InvalidTokenError()
    }

    return {
      sub: new UniqueEntityId(sub),
      role: role as userRole,
    }
  }
}
