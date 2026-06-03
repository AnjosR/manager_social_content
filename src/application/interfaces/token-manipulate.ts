import type { userRole } from '#src/domain/entity/user'
import type { UniqueEntityId } from '#src/domain/value-objects/uniqueId'

export type Payload = {
  sub: UniqueEntityId
  role: userRole
}

export interface AccessTokenGenerator {
  generateToken(payload: Payload): Promise<string>
}
export interface AccessTokenVerifier {
  verifyToken(token: string): Promise<Payload>
}
export interface AccessTokenDisabler {
  disableToken(token: string): Promise<void>
}
