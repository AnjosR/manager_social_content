// src/domain/entity/entity.ts
import type { UniqueEntityId } from '../valueObjects/uniqueId.js'

export class Entity<Props> {
  private _id: UniqueEntityId
  protected props: Props

  get id() {
    return this._id
  }

  protected constructor(props: Props, id: UniqueEntityId) {
    this.props = props
    this._id = id
  }
}
