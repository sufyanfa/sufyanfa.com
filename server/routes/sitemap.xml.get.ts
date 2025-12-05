import { serverQueryContent } from '#content/server'

export default defineEventHandler(async (event) => {
    const contentList = await serverQueryContent(event).find()
    const siteUrl = 'https://sufyanfa.com'

    // Static pages
    const staticPages = [
        { loc: '/', priority: 1.0, changefreq: 'daily', lastmod: new Date().toISOString() },
        { loc: '/projects', priority: 0.9, changefreq: 'weekly', lastmod: new Date().toISOString() },
        { loc: '/articles', priority: 0.9, changefreq: 'weekly', lastmod: new Date().toISOString() },
        { loc: '/services', priority: 0.8, changefreq: 'monthly', lastmod: new Date().toISOString() },
        { loc: '/bookmarks', priority: 0.7, changefreq: 'monthly', lastmod: new Date().toISOString() },
        { loc: '/build', priority: 0.8, changefreq: 'monthly', lastmod: new Date().toISOString() },
    ]

    // Dynamic content pages (only articles)
    const dynamicPages = contentList
        .filter((c) => {
            // Only include articles, exclude projects, services, build content
            return c._path &&
                c._path.startsWith('/articles/') &&
                !c._path.includes('/_') &&
                c._path !== '/'
        })
        .map((c) => ({
            loc: c._path,
            lastmod: c.updatedAt || c.createdAt || new Date().toISOString(),
            changefreq: 'weekly',
            priority: 0.8,
        }))

    const allPages = [...staticPages, ...dynamicPages]

    // Generate XML sitemap
    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allPages
            .map(
                (page) => `  <url>
    <loc>${siteUrl}${page.loc}</loc>${page.lastmod ? `
    <lastmod>${page.lastmod}</lastmod>` : ''}
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`
            )
            .join('\n')}
</urlset>`

    setResponseHeader(event, 'Content-Type', 'application/xml; charset=utf-8')
    setResponseHeader(event, 'Cache-Control', 'public, max-age=3600')

    return sitemap
})
