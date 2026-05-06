import type { Email } from '#src/domain/email'

export type User = {
  id: string
  email: Email
  hashedPassword: string
}
