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
  altText: 200,
  focusKeyword: 100,
  authorName: 80,
  authorBio: 500,
};
const MAX_TAGS = 10;
const MAX_TAG_LENGTH = 30;
const MIN_PUBLISH_YEAR = 2000;
const MAX_PUBLISH_YEAR = 2100;
const MAX_EMAIL_LENGTH = 254;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

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

/** Tags are stored lowercase with single spaces, de-duplicated, so filtering by tag is exact. */
function normalizeTags(input, errors) {
  const raw = input.tags;
  if (raw === undefined || raw === null) return [];
  if (!Array.isArray(raw) || raw.some((tag) => typeof tag !== 'string')) {
    errors.push('tags must be a list of text values');
    return [];
  }
  const tags = [...new Set(raw.map((tag) => tag.trim().replace(/\s+/g, ' ').toLowerCase()).filter(Boolean))];
  if (tags.length > MAX_TAGS) {
    errors.push(`use at most ${MAX_TAGS} tags`);
    return [];
  }
  if (tags.some((tag) => tag.length > MAX_TAG_LENGTH)) {
    errors.push(`each tag may be up to ${MAX_TAG_LENGTH} characters`);
    return [];
  }
  return tags;
}

/** Returns an ISO timestamp for a valid date string, null when absent, and records an error otherwise. */
function optionalDate(input, field, errors) {
  const value = input[field];
  if (value === undefined || value === null || value === '') return null;
  const date = typeof value === 'string' ? new Date(value) : null;
  const year = date ? date.getUTCFullYear() : NaN;
  if (!date || Number.isNaN(date.getTime()) || year < MIN_PUBLISH_YEAR || year > MAX_PUBLISH_YEAR) {
    errors.push(`${field} must be a valid date`);
    return null;
  }
  return date.toISOString();
}

/** Returns the trimmed, lowercased address, or null when it is not a plausible email. */
function validateEmail(value) {
  if (typeof value !== 'string') return null;
  const email = value.trim().toLowerCase();
  return email.length <= MAX_EMAIL_LENGTH && EMAIL_PATTERN.test(email) ? email : null;
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
    feature_image_alt: optionalString(input, 'feature_image_alt', LIMITS.altText, errors),
    social_image: optionalUrl(input, 'social_image', errors),
    canonical_url: optionalUrl(input, 'canonical_url', errors),
    noindex: input.noindex === true,
    focus_keyword: optionalString(input, 'focus_keyword', LIMITS.focusKeyword, errors),
    tags: normalizeTags(input, errors),
    featured: input.featured === true,
    author_name: optionalString(input, 'author_name', LIMITS.authorName, errors),
    author_bio: optionalString(input, 'author_bio', LIMITS.authorBio, errors),
    published: input.published === true,
    published_at: optionalDate(input, 'published_at', errors),
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
  validateEmail,
  parsePositiveInt,
  escapeLike,
  readingMinutes,
  slugify,
};
