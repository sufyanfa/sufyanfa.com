import { useDB } from '~/server/utils/db'
import { hashPassword } from '~/server/utils/auth'

interface CreateBody {
  slug: string
  title: string
  client_name: string
  client_label?: string
  proposal_date: string
  password: string
  content_md: string
  cta_label?: string
  cta_url?: string
  expires_at?: number | null
}

function isValidSlug(s: string): boolean {
  return /^[a-z0-9](?:[a-z0-9-]{0,80}[a-z0-9])?$/.test(s)
}

export default defineEventHandler(async (event) => {
  const body = await readBody<CreateBody>(event)
  for (const f of ['slug', 'title', 'client_name', 'proposal_date', 'password', 'content_md'] as const) {
    if (!body?.[f]) throw createError({ statusCode: 400, statusMessage: `Missing field: ${f}` })
  }
  if (!isValidSlug(body.slug)) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid slug. Use lowercase letters, numbers, hyphens.' })
  }

  const db = useDB(event)
  const existing = await db
    .prepare('SELECT id FROM proposals WHERE slug = ?')
    .bind(body.slug)
    .first()
  if (existing) {
    throw createError({ statusCode: 409, statusMessage: 'Slug already in use' })
  }

  const passwordHash = await hashPassword(body.password)
  const now = Date.now()

  const result = await db
    .prepare(`
      INSERT INTO proposals
      (slug, title, client_name, client_label, proposal_date, password_hash, content_md,
       cta_label, cta_url, status, expires_at, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'draft', ?, ?, ?)
    `)
    .bind(
      body.slug,
      body.title,
      body.client_name,
      body.client_label ?? null,
      body.proposal_date,
      passwordHash,
      body.content_md,
      body.cta_label ?? null,
      body.cta_url ?? null,
      body.expires_at ?? null,
      now,
      now
    )
    .run()

  return { ok: true, id: result.meta?.last_row_id }
})
