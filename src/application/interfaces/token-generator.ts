import type { UniqueEntityId } from '#src/domain/uniqueId'

export interface TokenGenerator {
  generate(userId: UniqueEntityId): Promise<string>
}
