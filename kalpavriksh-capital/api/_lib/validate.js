const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const WORDS_PER_MINUTE = 200;

const LIMITS = {
  slug: 100,
  title: 200,
  excerpt: 500,
  category: 50,
  url: 1000,
  seoTitle: 120,
  seoDescription: 300,
  content: 200000,
};

/** Only https URLs without embedded credentials are accepted. */
function isHttpUrl(value) {
  try {
    const url = new URL(value);
    return url.protocol === 'https:' && !url.username && !url.password;
  } catch (error) {
    return false;
  }
}

function readingMinutes(content) {
  const words = String(content || '').trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / WORDS_PER_MINUTE));
}

function slugify(text) {
  return String(text || '')
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, LIMITS.slug);
}

function optionalString(input, field, max, errors) {
  const value = input[field];
  if (value === undefined || value === null || value === '') return null;
  if (typeof value !== 'string' || value.length > max) {
    errors.push(`${field} must be text up to ${max} characters`);
    return null;
  }
  return value.trim();
}

// Same-site paths only: no `//host`, backslashes, percent-escapes or control characters.
function isSitePath(value) {
  return /^\/(?!\/)[A-Za-z0-9\-._~/?=&#]*$/.test(value);
}

function optionalUrl(input, field, errors, allowSitePath = false) {
  const value = optionalString(input, field, LIMITS.url, errors);
  if (!value) return value;
  if (isHttpUrl(value) || (allowSitePath && isSitePath(value))) return value;
  errors.push(allowSitePath ? `${field} must be an https URL or a path starting with /` : `${field} must be a valid https URL`);
  return null;
}

/**
 * Validates an admin post payload. Returns { value } on success or { errors } on failure.
 * Never trusts the client: every field is re-checked here.
 */
function validatePost(input) {
  const errors = [];
  if (!input || typeof input !== 'object') {
    return { errors: ['Request body must be a JSON object'] };
  }

  const title = typeof input.title === 'string' ? input.title.trim() : '';
  if (!title || title.length > LIMITS.title) {
    errors.push(`title is required (max ${LIMITS.title} characters)`);
  }

  const excerpt = typeof input.excerpt === 'string' ? input.excerpt.trim() : '';
  if (!excerpt || excerpt.length > LIMITS.excerpt) {
    errors.push(`excerpt is required (max ${LIMITS.excerpt} characters)`);
  }

  const slug = typeof input.slug === 'string' && input.slug.trim() ? input.slug.trim() : slugify(title);
  if (!slug || slug.length > LIMITS.slug || !SLUG_PATTERN.test(slug)) {
    errors.push('slug may only contain lowercase letters, numbers and hyphens');
  }

  const content = typeof input.content === 'string' ? input.content : '';
  if (content.length > LIMITS.content) {
    errors.push(`content is too long (max ${LIMITS.content} characters)`);
  }

  const externalUrl = optionalUrl(input, 'external_url', errors, true);
  if (!content.trim() && !externalUrl) {
    errors.push('content is required unless an external_url is provided');
  }

  const value = {
    slug,
    title,
    excerpt,
    content,
    feature_image: optionalUrl(input, 'feature_image', errors),
    external_url: externalUrl,
    category: optionalString(input, 'category', LIMITS.category, errors),
    seo_title: optionalString(input, 'seo_title', LIMITS.seoTitle, errors),
    seo_description: optionalString(input, 'seo_description', LIMITS.seoDescription, errors),
    published: input.published === true,
    reading_minutes: readingMinutes(content),
  };

  return errors.length > 0 ? { errors } : { value };
}

function parsePositiveInt(raw, fallback, max) {
  const parsed = Number.parseInt(raw, 10);
  if (!Number.isFinite(parsed) || parsed < 1) return fallback;
  return Math.min(parsed, max);
}

/** Escapes LIKE wildcards so user search text is matched literally. */
function escapeLike(text) {
  return String(text).replace(/[\\%_]/g, (char) => `\\${char}`);
}

module.exports = {
  SLUG_PATTERN,
  validatePost,
  parsePositiveInt,
  escapeLike,
  readingMinutes,
  slugify,
};
