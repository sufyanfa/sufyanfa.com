import type { H3Event } from 'h3'

export interface D1Database {
  prepare(query: string): D1PreparedStatement
  exec(query: string): Promise<D1Result>
  batch(statements: D1PreparedStatement[]): Promise<D1Result[]>
}

export interface D1PreparedStatement {
  bind(...values: unknown[]): D1PreparedStatement
  first<T = unknown>(column?: string): Promise<T | null>
  all<T = unknown>(): Promise<{ results: T[]; success: boolean }>
  run(): Promise<D1Result>
}

export interface D1Result {
  success: boolean
  meta?: { last_row_id?: number; changes?: number }
}

export function useDB(event: H3Event): D1Database {
  const db = (event.context as any)?.cloudflare?.env?.DB as D1Database | undefined
  if (!db) {
    throw createError({
      statusCode: 500,
      statusMessage: 'D1 database binding (DB) is not available. Check wrangler.toml and that you are running via wrangler/nitro-cloudflare-dev.'
    })
  }
  return db
}
