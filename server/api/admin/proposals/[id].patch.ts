import { useDB } from '~/server/utils/db'
import { hashPassword } from '~/server/utils/auth'

interface PatchBody {
  title?: string
  client_name?: string
  client_label?: string | null
  proposal_date?: string
  password?: string
  content_md?: string
  cta_label?: string | null
  cta_url?: string | null
  expires_at?: number | null
  price?: number | null
  price_after_discount?: number | null
}

const ALLOWED = ['title', 'client_name', 'client_label', 'proposal_date', 'content_md', 'cta_label', 'cta_url', 'expires_at', 'price', 'price_after_discount'] as const

export default defineEventHandler(async (event) => {
  const id = parseInt(getRouterParam(event, 'id') ?? '', 10)
  if (!Number.isFinite(id)) throw createError({ statusCode: 400, statusMessage: 'Invalid id' })
  const body = await readBody<PatchBody>(event)

  const db = useDB(event)
  const existing = await db.prepare('SELECT id FROM proposals WHERE id = ?').bind(id).first()
  if (!existing) throw createError({ statusCode: 404, statusMessage: 'Not found' })

  const fields: string[] = []
  const values: unknown[] = []
  for (const k of ALLOWED) {
    if (k in body) {
      fields.push(`${k} = ?`)
      values.push(body[k] ?? null)
    }
  }
  if (body.password) {
    fields.push('password_hash = ?')
    values.push(await hashPassword(body.password))
  }
  if (fields.length === 0) return { ok: true }

  fields.push('updated_at = ?')
  values.push(Date.now())
  values.push(id)

  await db
    .prepare(`UPDATE proposals SET ${fields.join(', ')} WHERE id = ?`)
    .bind(...values)
    .run()
  return { ok: true }
})
