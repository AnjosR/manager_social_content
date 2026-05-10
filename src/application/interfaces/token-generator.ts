import type { userRole } from '#src/domain/entity/user'
import type { UniqueEntityId } from '#src/domain/value-objects/uniqueId'

type Payload = {
  sub: UniqueEntityId
  role: userRole
}

export interface TokenGenerator {
  generate(payload: Payload): Promise<string>
}
