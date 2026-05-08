import { randomUUID } from 'node:crypto'

import type { IdGenerator } from '#src/application/interfaces/cryptography/id-generator'

export class NodeIdGenerator implements IdGenerator {
  generate(): string {
    return randomUUID()
  }
}
