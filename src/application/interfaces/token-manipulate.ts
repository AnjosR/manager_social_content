import type { userRole } from '#src/domain/entity/user'
import type { UniqueEntityId } from '#src/domain/value-objects/uniqueId'

export type Payload = {
  sub: UniqueEntityId
  role: userRole
}

export interface TokenGenerator {
  generate(payload: Payload): Promise<string>
}
export interface TokenVerifier {
  verify(token: string): Promise<Payload>
}
export interface TokenDisabler {
  disable(token: string): Promise<void>
}
