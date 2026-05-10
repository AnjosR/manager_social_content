import type { Email } from '#src/domain/email'
import type { UniqueEntityId } from '#src/domain/uniqueId'

export type AuthenticatedUser = {
  id: UniqueEntityId
  email: Email
  hashedPassword: string
}
