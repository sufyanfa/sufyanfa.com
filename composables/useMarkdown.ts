import { marked } from 'marked'

marked.setOptions({ gfm: true, breaks: true })

// Markdown content is authored by the admin only — trusted input —
// so we render via marked without an extra HTML sanitizer.
// (DOMPurify needs a DOM, which the Cloudflare Workers runtime lacks.)
export function renderMarkdown(md: string): string {
  if (!md) return ''
  return marked.parse(md, { async: false }) as string
}
