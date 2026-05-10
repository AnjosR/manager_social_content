export interface HashComparer {
  compare(plainPassword: string, hashedPassword: string): Promise<boolean>
}
