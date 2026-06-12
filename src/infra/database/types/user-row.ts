export type UserRow = {
  id: string
  name: string
  email: string
  password_hash: string
  role: string
  created_at: Date
  updated_at: Date | null
  deleted_at: Date | null
}
