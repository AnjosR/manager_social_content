import { Pool, type PoolConfig, type QueryResultRow } from 'pg'

import { DataBaseConnectionError } from '#src/application/erros/database-connection-error'

export class PostgresConnection {
  private pool: Pool | null = null

  constructor(private readonly config: PoolConfig) {}

  getPool(): Pool {
    if (!this.pool) {
      this.pool = new Pool(this.config)
      this.pool.on('error', () => {})
    }
    return this.pool
  }

  async query(text: string, params?: unknown[]): Promise<{ rows: QueryResultRow[] }> {
    try {
      const pool = this.getPool()
      const result = await pool.query<QueryResultRow>(text, params)
      return { rows: result.rows }
    } catch {
      throw new DataBaseConnectionError()
    }
  }

  async close(): Promise<void> {
    if (this.pool) {
      await this.pool.end()
      this.pool = null
    }
  }
}
