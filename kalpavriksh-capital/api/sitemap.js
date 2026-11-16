const { getSql } = require('./_lib/db');
const { methodNotAllowed, serverError } = require('./_lib/http');
const { siteUrl, escapeXml } = require('./_lib/site');

const STATIC_PATHS = [
  { path: '/', priority: '1.0', changefreq: 'weekly' },
  { path: '/blogs', priority: '0.8', changefreq: 'weekly' },
  { path: '/asset-allocation', priority: '0.6', changefreq: 'monthly' },
];

function urlEntry({ loc, lastmod, changefreq, priority }) {
  return [
    '  <url>',
    `    <loc>${escapeXml(loc)}</loc>`,
    lastmod ? `    <lastmod>${lastmod}</lastmod>` : '',
    `    <changefreq>${changefreq}</changefreq>`,
    `    <priority>${priority}</priority>`,
    '  </url>',
  ]
    .filter(Boolean)
    .join('\n');
}

/** GET /sitemap.xml (rewritten to this function). Lists the main pages and every published on-site post. */
module.exports = async function handler(req, res) {
  if (req.method !== 'GET') return methodNotAllowed(res, ['GET']);

  try {
    const sql = getSql();
    const base = siteUrl();
    const posts = await sql`
      SELECT slug, updated_at
      FROM posts
      WHERE published = true AND external_url IS NULL
      ORDER BY published_at DESC NULLS LAST`;

    const entries = [
      ...STATIC_PATHS.map((item) => urlEntry({ ...item, loc: `${base}${item.path}` })),
      ...posts.map((post) =>
        urlEntry({
          loc: `${base}/blogs/${post.slug}`,
          lastmod: post.updated_at ? new Date(post.updated_at).toISOString().slice(0, 10) : undefined,
          changefreq: 'monthly',
          priority: '0.7',
        })
      ),
    ];

    const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries.join('\n')}\n</urlset>\n`;
    res.setHeader('Content-Type', 'application/xml; charset=utf-8');
    res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=86400');
    return res.status(200).send(xml);
  } catch (error) {
    return serverError(res, error);
  }
};
