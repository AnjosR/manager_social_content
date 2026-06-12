import { z } from 'zod'

import { userRole } from '#src/domain/entity/user'

export const jwtPayloadSchema = z.object({
  sub: z.uuid(),
  role: z.enum(userRole),
})

export type JwtPayloadShape = z.infer<typeof jwtPayloadSchema>
