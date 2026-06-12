import type { Content } from '#src/domain/entity/content'
import type { UniqueEntityId } from '#src/domain/value-objects/uniqueId'

import type { Repository } from './repository.js'

export interface ContentRepository extends Repository<Content> {
  save(value: Content): Promise<void>
  findByTitle(value: string): Promise<Content | null>
  findById(value: UniqueEntityId): Promise<Content | null>
  findAll(page: number, limit: number): Promise<{ items: Content[]; total: number }>
  delete(value: UniqueEntityId): Promise<void>
}
