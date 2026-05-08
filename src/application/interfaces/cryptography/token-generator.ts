import type { UniqueEntityId } from '#src/domain/valueObjects/uniqueId'

export interface TokenGenerator {
  generate(userId: UniqueEntityId): Promise<string>
}
