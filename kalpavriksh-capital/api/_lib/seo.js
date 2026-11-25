const { escapeXml } = require('./site');

// Pure helpers that turn a post row into the <head> tags and structured data search engines and
// link previews read. Nothing here touches the network or database, so it is fully unit-testable.

const BRAND = 'Kalpvriksh Global';
const ROBOTS_INDEX = 'index, follow, max-image-preview:large';
const ROBOTS_NOINDEX = 'noindex, nofollow';
const MAX_HEADLINE = 110; // Google truncates BlogPosting headlines past ~110 characters
const ROBOTS_PATTERN = /<meta\s+name="robots"[^>]*>/i;
const IMAGE_DETAIL_PATTERN = /[ \t]*<meta\s+property="og:image:(?:width|height|alt)"[^>]*>\n?/gi;
const LIST_TITLE = `Insights & Articles | ${BRAND}`;
const LIST_DESCRIPTION = 'Articles on personal finance, investing and wealth building by Rakhi Jain, Chartered Accountant.';

const AUTHOR = {
  '@type': 'Person',
  name: 'Rakhi Jain',
  jobTitle: 'Chartered Accountant and Chartered Wealth Manager (CWM®)',
};

/** A post's own author wins; only the default author carries Rakhi's credentials. */
function authorFor(post, base) {
  const name = typeof post.author_name === 'string' ? post.author_name.trim() : '';
  const person = name ? { '@type': 'Person', name } : AUTHOR;
  return { ...person, url: `${base}/` };
}

function metaTag(attribute, key, content) {
  return `<meta ${attribute}="${key}" content="${escapeXml(content)}" />`;
}

/** Replaces every existing tag matching `pattern` with `tag`, or inserts it before </head>. */
function upsert(html, pattern, tag) {
  // Replacer functions are used so `$&` / `$'` sequences in post text are never interpreted as patterns.
  return pattern.test(html)
    ? html.replace(new RegExp(pattern.source, 'gi'), () => tag)
    : html.replace('</head>', () => `${tag}\n</head>`);
}

/** Serialises structured data for an inline script tag; `<`, `>` and `&` are escaped so text can't close it. */
function jsonLdScript(objects) {
  const json = JSON.stringify(objects)
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(/&/g, '\\u0026')
    .split(String.fromCharCode(0x2028)).join('\\u2028')
    .split(String.fromCharCode(0x2029)).join('\\u2029');
  return `<script type="application/ld+json">${json}</script>`;
}

/** BlogPosting + BreadcrumbList structured data for one post. */
function buildJsonLd(post, { base, url, imageUrl }) {
  const published = post.published_at ? new Date(post.published_at).toISOString() : undefined;
  const modified = post.updated_at ? new Date(post.updated_at).toISOString() : published;

  const article = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: String(post.title).slice(0, MAX_HEADLINE),
    description: post.seo_description || post.excerpt,
    image: imageUrl,
    datePublished: published,
    dateModified: modified,
    author: authorFor(post, base),
    publisher: {
      '@type': 'Organization',
      name: BRAND,
      logo: { '@type': 'ImageObject', url: `${base}/icon-512.png` },
    },
    mainEntityOfPage: { '@type': 'WebPage', '@id': url },
  };
  if (post.tags && post.tags.length > 0) article.keywords = post.tags.join(', ');
  if (post.category) article.articleSection = post.category;

  const breadcrumbs = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: `${base}/` },
      { '@type': 'ListItem', position: 2, name: 'Insights', item: `${base}/blogs` },
      { '@type': 'ListItem', position: 3, name: post.title, item: url },
    ],
  };
  return [article, breadcrumbs];
}

/** Tags that only exist for articles, appended rather than matched against the shell. */
function articleTags(post) {
  const tags = [];
  if (post.published_at) tags.push(metaTag('property', 'article:published_time', new Date(post.published_at).toISOString()));
  if (post.updated_at) tags.push(metaTag('property', 'article:modified_time', new Date(post.updated_at).toISOString()));
  if (post.category) tags.push(metaTag('property', 'article:section', post.category));
  (post.tags || []).forEach((tag) => tags.push(metaTag('property', 'article:tag', tag)));
  return tags;
}

/** Fills the app shell's head with one post's title, description, canonical, robots, share tags and JSON-LD. */
function injectSeo(html, post, { base }) {
  const pageUrl = `${base}/blogs/${post.slug}`;
  const canonical = post.canonical_url || pageUrl;
  const title = `${post.seo_title || post.title} | ${BRAND}`;
  const description = post.seo_description || post.excerpt;
  const defaultImage = `${base}/icon-512.png`;
  const shareImage = post.social_image || post.feature_image || defaultImage;
  const schemaImage = post.feature_image || post.social_image || defaultImage;

  const withTitle = html.replace(/<title>[\s\S]*?<\/title>/i, () => `<title>${escapeXml(title)}</title>`);
  const tags = [
    [/<meta\s+name="description"[^>]*>/i, metaTag('name', 'description', description)],
    [ROBOTS_PATTERN, metaTag('name', 'robots', post.noindex ? ROBOTS_NOINDEX : ROBOTS_INDEX)],
    [/<meta\s+property="og:title"[^>]*>/i, metaTag('property', 'og:title', title)],
    [/<meta\s+property="og:description"[^>]*>/i, metaTag('property', 'og:description', description)],
    [/<meta\s+property="og:image"[^>]*>/i, metaTag('property', 'og:image', shareImage)],
    [/<meta\s+property="og:url"[^>]*>/i, metaTag('property', 'og:url', canonical)],
    [/<meta\s+property="og:type"[^>]*>/i, metaTag('property', 'og:type', 'article')],
    [/<meta\s+property="og:site_name"[^>]*>/i, metaTag('property', 'og:site_name', BRAND)],
    [/<meta\s+name="twitter:card"[^>]*>/i, metaTag('name', 'twitter:card', 'summary_large_image')],
    [/<meta\s+name="twitter:title"[^>]*>/i, metaTag('name', 'twitter:title', title)],
    [/<meta\s+name="twitter:description"[^>]*>/i, metaTag('name', 'twitter:description', description)],
    [/<meta\s+name="twitter:image"[^>]*>/i, metaTag('name', 'twitter:image', shareImage)],
    [/<link\s+rel="canonical"[^>]*>/i, `<link rel="canonical" href="${escapeXml(canonical)}" />`],
  ];
  const withTags = tags
    .reduce((current, [pattern, tag]) => upsert(current, pattern, tag), withTitle)
    .replace(IMAGE_DETAIL_PATTERN, ''); // the shell's 1200x630 size and alt describe the default image, not this post's

  const extra = [...articleTags(post), jsonLdScript(buildJsonLd(post, { base, url: canonical, imageUrl: schemaImage }))];
  return withTags.replace('</head>', () => `${extra.join('\n')}\n</head>`);
}

/** Fills the app shell's head for the /blogs list page: its own title, description, canonical, share tags and JSON-LD. */
function injectListSeo(html, { base }) {
  const pageUrl = `${base}/blogs`;
  const withTitle = html.replace(/<title>[\s\S]*?<\/title>/i, () => `<title>${escapeXml(LIST_TITLE)}</title>`);
  const tags = [
    [/<meta\s+name="description"[^>]*>/i, metaTag('name', 'description', LIST_DESCRIPTION)],
    [/<meta\s+property="og:title"[^>]*>/i, metaTag('property', 'og:title', LIST_TITLE)],
    [/<meta\s+property="og:description"[^>]*>/i, metaTag('property', 'og:description', LIST_DESCRIPTION)],
    [/<meta\s+property="og:url"[^>]*>/i, metaTag('property', 'og:url', pageUrl)],
    [/<meta\s+name="twitter:title"[^>]*>/i, metaTag('name', 'twitter:title', LIST_TITLE)],
    [/<meta\s+name="twitter:description"[^>]*>/i, metaTag('name', 'twitter:description', LIST_DESCRIPTION)],
    [/<meta\s+name="twitter:url"[^>]*>/i, metaTag('name', 'twitter:url', pageUrl)],
    [/<link\s+rel="canonical"[^>]*>/i, `<link rel="canonical" href="${escapeXml(pageUrl)}" />`],
  ];
  const withTags = tags.reduce((current, [pattern, tag]) => upsert(current, pattern, tag), withTitle);
  const schema = [
    {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      name: LIST_TITLE,
      description: LIST_DESCRIPTION,
      url: pageUrl,
      isPartOf: { '@type': 'WebSite', name: BRAND, url: `${base}/` },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: `${base}/` },
        { '@type': 'ListItem', position: 2, name: 'Insights', item: pageUrl },
      ],
    },
  ];
  return withTags.replace('</head>', () => `${jsonLdScript(schema)}\n</head>`);
}

/** Adds (or replaces) a robots meta tag, e.g. 'noindex, nofollow' for private draft previews. */
function injectRobots(html, content) {
  return upsert(html, ROBOTS_PATTERN, metaTag('name', 'robots', content));
}

module.exports = { injectSeo, injectListSeo, injectRobots, buildJsonLd, jsonLdScript, ROBOTS_NOINDEX };
