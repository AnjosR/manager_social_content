export interface Repository<T> {
  save(value: T): Promise<void>
}
