// 22-char URL-safe random slug for public invoice links.
// 132 bits of entropy -- effectively zero collision probability.

const ALPHABET = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-_'

export function randomSlug(length = 22): string {
  const bytes = crypto.getRandomValues(new Uint8Array(length))
  let out = ''
  for (let i = 0; i < length; i++) out += ALPHABET[bytes[i] & 63]
  return out
}
