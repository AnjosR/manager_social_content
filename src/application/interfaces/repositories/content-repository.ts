import type { Content } from '#src/domain/entity/content'

import type { Repository } from './repository.js'

export interface ContentRepository extends Repository<Content> {
  save(value: Content): Promise<void>
  findByTitle(value: string): Promise<Content | null>
}
