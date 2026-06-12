import { sign, verify } from 'jsonwebtoken'

import { InvalidTokenError } from '#src/application/erros/invalid-token-error'
import type {
  AccessTokenDisabler,
  AccessTokenGenerator,
  AccessTokenVerifier,
  Payload,
} from '#src/application/interfaces/token-manipulate'
import { UniqueEntityId } from '#src/domain/value-objects/uniqueId'

import { jwtPayloadSchema } from './schemas/jwt-payload-schema.js'

export class JwtAdapter implements AccessTokenGenerator, AccessTokenVerifier, AccessTokenDisabler {
  constructor(private readonly secret: string) {}

  async generateToken(payload: Payload): Promise<string> {
    return sign(payload, this.secret)
  }

  async verifyToken(token: string): Promise<Payload> {
    let decoded: unknown
    try {
      decoded = verify(token, this.secret)
    } catch {
      throw new InvalidTokenError()
    }

    const result = jwtPayloadSchema.safeParse(decoded)
    if (!result.success) {
      throw new InvalidTokenError()
    }

    return {
      sub: new UniqueEntityId(result.data.sub),
      role: result.data.role,
    }
  }

  async disableToken(token: string): Promise<void> {
    throw new Error('Method not implemented.')
  }
}
