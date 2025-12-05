import { serverQueryContent } from '#content/server'
import type { H3Event } from 'h3'

export default defineEventHandler(async (event: H3Event) => {
    const contentList = await serverQueryContent(event).find()

    const urls = contentList
        .map((c) => {
            return {
                loc: c._path,
                lastmod: c.updatedAt || c.createdAt || new Date().toISOString(),
                changefreq: 'weekly',
                priority: c._path === '/' ? 1.0 : 0.8,
            }
        })
        .filter((entry) => {
            // Filter out any paths that shouldn't be in sitemap
            return entry.loc &&
                !entry.loc.includes('/_') &&
                !entry.loc.includes('/api/') &&
                entry.loc !== '/error'
        })

    return urls
})
