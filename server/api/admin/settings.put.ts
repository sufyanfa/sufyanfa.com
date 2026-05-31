import { useDB } from '~/server/utils/db'

interface UpdateBody {
  business_name: string
  logo_url?: string
  email?: string
  phone?: string
  address?: string
  bank_name?: string
  bank_account_name?: string
  bank_account_number?: string
  bank_iban?: string
  default_due_days?: number
  default_notes?: string
}

export default defineEventHandler(async (event) => {
  const body = await readBody<UpdateBody>(event)
  if (!body?.business_name?.trim()) {
    throw createError({ statusCode: 400, statusMessage: 'اسم النشاط مطلوب' })
  }
  const dueDays = Number(body.default_due_days)
  if (!Number.isFinite(dueDays) || dueDays < 0) {
    throw createError({ statusCode: 400, statusMessage: 'مدة الاستحقاق غير صحيحة' })
  }

  const db = useDB(event)
  await db
    .prepare(`
      UPDATE settings SET
        business_name = ?, logo_url = ?, email = ?, phone = ?, address = ?,
        bank_name = ?, bank_account_name = ?, bank_account_number = ?, bank_iban = ?,
        default_due_days = ?, default_notes = ?, updated_at = ?
      WHERE id = 1
    `)
    .bind(
      body.business_name.trim(),
      body.logo_url?.trim() || null,
      body.email?.trim() || null,
      body.phone?.trim() || null,
      body.address?.trim() || null,
      body.bank_name?.trim() || null,
      body.bank_account_name?.trim() || null,
      body.bank_account_number?.trim() || null,
      body.bank_iban?.trim() || null,
      dueDays,
      body.default_notes?.trim() || null,
      Date.now(),
    )
    .run()

  return { ok: true }
})
