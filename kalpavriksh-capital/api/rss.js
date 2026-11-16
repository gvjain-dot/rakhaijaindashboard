const { getSql } = require('./_lib/db');
const { methodNotAllowed, serverError } = require('./_lib/http');
const { siteUrl, escapeXml, postUrl } = require('./_lib/site');

const FEED_LIMIT = 30;

function itemXml(post) {
  const link = escapeXml(postUrl(post));
  return [
    '    <item>',
    `      <title>${escapeXml(post.title)}</title>`,
    `      <link>${link}</link>`,
    `      <guid isPermaLink="true">${link}</guid>`,
    post.published_at ? `      <pubDate>${new Date(post.published_at).toUTCString()}</pubDate>` : '',
    post.category ? `      <category>${escapeXml(post.category)}</category>` : '',
    `      <description>${escapeXml(post.excerpt)}</description>`,
    '    </item>',
  ]
    .filter(Boolean)
    .join('\n');
}

/** GET /rss.xml (rewritten to this function). The latest published posts as an RSS 2.0 feed. */
module.exports = async function handler(req, res) {
  if (req.method !== 'GET') return methodNotAllowed(res, ['GET']);

  try {
    const sql = getSql();
    const base = siteUrl();
    const posts = await sql`
      SELECT slug, title, excerpt, category, external_url, published_at
      FROM posts
      WHERE published = true
      ORDER BY published_at DESC NULLS LAST
      LIMIT ${FEED_LIMIT}`;

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>Kalpvriksh Global - Insights</title>
    <link>${escapeXml(base)}/blogs</link>
    <description>Articles on personal finance, investing and wealth building by Rakhi Jain, Chartered Accountant.</description>
    <language>en-in</language>
${posts.map(itemXml).join('\n')}
  </channel>
</rss>
`;
    res.setHeader('Content-Type', 'application/rss+xml; charset=utf-8');
    res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=86400');
    return res.status(200).send(xml);
  } catch (error) {
    return serverError(res, error);
  }
};
