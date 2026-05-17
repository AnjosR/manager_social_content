import { User, userRole } from '#src/domain/entity/user'
import { UniqueEntityId } from '#src/domain/value-objects/uniqueId'
import { InvalidUserRowError, UserMapper, type UserRow } from '#src/infra/persistence/postgres/user-mapper'

const VALID_ID = '9a11f510-56c7-41f3-b5c0-6fc52a6d4fd4'
const CREATED_AT = new Date('2026-05-14T12:00:00Z')

function buildRow(overrides: Partial<UserRow> = {}): UserRow {
  return {
    id: VALID_ID,
    name: 'João da Silva',
    email: 'joao@cerac.org',
    password_hash: '$2b$10$abc',
    role: 'Editor',
    created_at: CREATED_AT,
    deleted_at: null,
    ...overrides,
  }
}

function buildUser(deletedAt: Date | null = null): User {
  return new User(
    {
      name: 'João da Silva',
      email: 'joao@cerac.org',
      passwordHash: '$2b$10$abc',
      role: userRole.EDITOR,
      createdAt: CREATED_AT,
      deletedAt,
    },
    new UniqueEntityId(VALID_ID),
  )
}

describe('UserMapper', () => {
  describe('toEntity(row)', () => {
    it('Should return a User instance', () => {
      const entity = UserMapper.toEntity(buildRow())

      expect(entity).toBeInstanceOf(User)
    })

    it('Should preserve row.id as user.id.toValue()', () => {
      const entity = UserMapper.toEntity(buildRow())

      expect(entity.id.toValue()).toBe(VALID_ID)
    })

    it('Should preserve name, email, passwordHash and createdAt', () => {
      const entity = UserMapper.toEntity(buildRow())

      expect(entity.name).toBe('João da Silva')
      expect(entity.email).toBe('joao@cerac.org')
      expect(entity.passwordHash).toBe('$2b$10$abc')
      expect(entity.createdAt).toBe(CREATED_AT)
    })

    it('Should map deleted_at = null to entity.deletedAt = null', () => {
      const entity = UserMapper.toEntity(buildRow({ deleted_at: null }))

      expect(entity.deletedAt).toBeNull()
    })

    it('Should preserve deleted_at when the user is soft-deleted', () => {
      const deletedAt = new Date('2026-06-01T09:00:00Z')
      const entity = UserMapper.toEntity(buildRow({ deleted_at: deletedAt }))

      expect(entity.deletedAt).toBe(deletedAt)
    })

    it('Should map role string "Editor" to userRole.EDITOR', () => {
      const entity = UserMapper.toEntity(buildRow({ role: 'Editor' }))

      expect(entity.role).toBe(userRole.EDITOR)
    })

    it('Should map role string "Admin" to userRole.ADMIN', () => {
      const entity = UserMapper.toEntity(buildRow({ role: 'Admin' }))

      expect(entity.role).toBe(userRole.ADMIN)
    })

    it('Should throw InvalidUserRowError when role does not match any userRole enum value', () => {
      expect(() => UserMapper.toEntity(buildRow({ role: 'Hacker' }))).toThrow(InvalidUserRowError)
    })
  })

  describe('toPersistence(user)', () => {
    it('Should expose every schema column', () => {
      const row = UserMapper.toPersistence(buildUser())

      expect(Object.keys(row).sort()).toStrictEqual([
        'created_at',
        'deleted_at',
        'email',
        'id',
        'name',
        'password_hash',
        'role',
      ])
    })

    it('Should serialize deletedAt = null as deleted_at = null', () => {
      const row = UserMapper.toPersistence(buildUser(null))

      expect(row.deleted_at).toBeNull()
    })

    it('Should serialize deletedAt Date as deleted_at Date', () => {
      const deletedAt = new Date('2026-06-01T09:00:00Z')
      const row = UserMapper.toPersistence(buildUser(deletedAt))

      expect(row.deleted_at).toBe(deletedAt)
    })

    it('Should serialize user.id via toValue()', () => {
      const row = UserMapper.toPersistence(buildUser())

      expect(row.id).toBe(VALID_ID)
    })

    it('Should serialize role as the enum string value', () => {
      const row = UserMapper.toPersistence(buildUser())

      expect(row.role).toBe('Editor')
    })

    it('Should keep createdAt as a Date instance', () => {
      const row = UserMapper.toPersistence(buildUser())

      expect(row.created_at).toBeInstanceOf(Date)
      expect(row.created_at).toBe(CREATED_AT)
    })

    it('Should not leak internal entity fields like props or _id', () => {
      const row = UserMapper.toPersistence(buildUser())

      expect(row).not.toHaveProperty('props')
      expect(row).not.toHaveProperty('_id')
    })
  })

  describe('Round-trip', () => {
    it('toEntity(toPersistence(user)) should produce an equivalent entity', () => {
      const original = buildUser()

      const reconstructed = UserMapper.toEntity(UserMapper.toPersistence(original))

      expect(reconstructed.id.toValue()).toBe(original.id.toValue())
      expect(reconstructed.name).toBe(original.name)
      expect(reconstructed.email).toBe(original.email)
      expect(reconstructed.passwordHash).toBe(original.passwordHash)
      expect(reconstructed.role).toBe(original.role)
      expect(reconstructed.createdAt).toBe(original.createdAt)
      expect(reconstructed.deletedAt).toBe(original.deletedAt)
    })

    it('toPersistence(toEntity(row)) should produce an equivalent row', () => {
      const original = buildRow()

      const reconstructed = UserMapper.toPersistence(UserMapper.toEntity(original))

      expect(reconstructed).toStrictEqual(original)
    })
  })
})
