import { Entity } from './entity.js'

type ContentProps = {
  title: string
  description: string
  Actiondate: Date
  imagesUrl: string[]
}

export class Content extends Entity<ContentProps> {
  get title() {
    return this.props.title
  }
  get description() {
    return this.props.description
  }
  get Actiondate() {
    return this.props.Actiondate
  }
  get imagesUrl() {
    return this.props.imagesUrl
  }
}
