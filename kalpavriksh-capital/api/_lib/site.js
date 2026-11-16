const DEFAULT_SITE_URL = 'https://www.kalpvrikshglobal.com';

function siteUrl() {
  return (process.env.SITE_URL || DEFAULT_SITE_URL).replace(/\/+$/, '');
}

function escapeXml(text) {
  return String(text ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/** Absolute URL for a post: link-out posts point at their external target. */
function postUrl(post) {
  if (post.external_url) {
    return post.external_url.startsWith('/') ? `${siteUrl()}${post.external_url}` : post.external_url;
  }
  return `${siteUrl()}/blogs/${post.slug}`;
}

module.exports = { siteUrl, escapeXml, postUrl };
