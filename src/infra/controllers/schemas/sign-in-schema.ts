import { z } from 'zod'

export const signInBodySchema = z.object({
  email: z.string().min(1, 'email is required'),
  password: z.string().min(1, 'password is required'),
})

export type SignInBody = z.infer<typeof signInBodySchema>
