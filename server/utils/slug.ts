// URL-safe slug for public project links.

const ALPHABET = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-_'

export function randomSlug(length = 22): string {
  const bytes = crypto.getRandomValues(new Uint8Array(length))
  let out = ''
  for (let i = 0; i < length; i++) out += ALPHABET[bytes[i] & 63]
  return out
}

export function nameSlug(text: string): string {
  return text
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-\u0600-\u06FF]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .toLowerCase()
    .slice(0, 120)
}

export async function uniqueSlug(base: string, db: any): Promise<string> {
  let slug = nameSlug(base)
  if (!slug) slug = 'project'
  const existing = await db
    .prepare('SELECT slug FROM projects WHERE slug = ? OR slug LIKE ?')
    .bind(slug, `${slug}-%`)
    .all()
  if (!(existing.results || []).length) return slug
  const taken = new Set((existing.results || []).map((r: any) => r.slug))
  let n = 2
  while (taken.has(`${slug}-${n}`)) n++
  return `${slug}-${n}`
}
