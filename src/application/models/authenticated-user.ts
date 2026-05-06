import type { Email } from '#src/domain/email'

export type AuthenticatedUser = {
  id: string
  email: Email
  hashedPassword: string
}
