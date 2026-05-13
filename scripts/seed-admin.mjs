#!/usr/bin/env node
// Seeds the first admin user via wrangler d1.
// Usage:
//   node scripts/seed-admin.mjs <email> <password> [--local]
// Add --local to seed the local D1 dev DB; omit for remote (production).

import { spawnSync } from 'node:child_process'
import { webcrypto as crypto } from 'node:crypto'
import { writeFileSync, unlinkSync, mkdtempSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

const PBKDF2_ITERATIONS = 100_000
const SALT_LENGTH = 16
const KEY_LENGTH = 32

function b64url(bytes) {
  return Buffer.from(bytes)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '')
}

async function hashPassword(password) {
  const salt = crypto.getRandomValues(new Uint8Array(SALT_LENGTH))
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(password),
    'PBKDF2',
    false,
    ['deriveBits']
  )
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt, iterations: PBKDF2_ITERATIONS, hash: 'SHA-256' },
    key,
    KEY_LENGTH * 8
  )
  return `pbkdf2$${PBKDF2_ITERATIONS}$${b64url(salt)}$${b64url(new Uint8Array(bits))}`
}

const args = process.argv.slice(2)
const local = args.includes('--local')
const positional = args.filter(a => !a.startsWith('--'))
const [email, password] = positional

if (!email || !password) {
  console.error('Usage: node scripts/seed-admin.mjs <email> <password> [--local]')
  process.exit(1)
}

const hash = await hashPassword(password)
const now = Date.now()
const safeEmail = email.replace(/'/g, "''")
// First delete any existing user with this email so re-seeding is idempotent
const sql = `DELETE FROM users WHERE email = '${safeEmail}';
INSERT INTO users (email, password_hash, is_admin, created_at) VALUES ('${safeEmail}', '${hash}', 1, ${now});`

const dir = mkdtempSync(join(tmpdir(), 'seed-admin-'))
const sqlFile = join(dir, 'seed.sql')
writeFileSync(sqlFile, sql, 'utf8')

console.log(`> ${local ? 'LOCAL' : 'REMOTE'} D1: seeding ${email}`)
const result = spawnSync(
  'npx',
  [
    'wrangler', 'd1', 'execute', 'sufyanfa-proposals',
    local ? '--local' : '--remote',
    '--file', sqlFile,
    '--yes'
  ],
  { stdio: 'inherit' }
)
try { unlinkSync(sqlFile) } catch {}

if (result.status !== 0) {
  console.error('Seed failed')
  process.exit(1)
}
console.log('Done.')
