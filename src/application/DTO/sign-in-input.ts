import type { Email } from '#src/domain/email'
import type { Password } from '#src/domain/password'

export type SignInInput = {
  email: Email
  password: Password
}
