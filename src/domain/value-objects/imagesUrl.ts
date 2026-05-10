import { InvalidImageUrlError } from '../errors/image-url-error.js'

export class ImagesURL {
  private static readonly MIN_URL = 1
  private static readonly MAX_URL = 6
  constructor(private readonly value: string[]) {
    if (this.value.length < ImagesURL.MIN_URL || this.value.length > ImagesURL.MAX_URL) {
      throw new InvalidImageUrlError()
    }

    for (const image of this.value) {
      try {
        new URL(image)
      } catch {
        throw new InvalidImageUrlError()
      }
    }
  }

  getValue(): string[] {
    return this.value
  }
}
