// Live SEO checklist for the editor. Pure function: form fields in, scored checks out.

const TITLE_MIN = 30;
const TITLE_MAX = 60;
const DESCRIPTION_MIN = 120;
const DESCRIPTION_MAX = 160;
const INTRO_WORDS = 100;
const WORDS_GOOD = 600;
const WORDS_OK = 300;
const SLUG_MAX = 60;
const LEVEL_GOOD = 80;
const LEVEL_OK = 50;

const SCORE_VALUE = { good: 1, warn: 0.5, bad: 0 };
const INTERNAL_LINK = /\]\(\/(?!\/)[^)\s]*\)/g; // a Markdown link to a path on this site
const SUBHEADING = /^#{2,3}\s+\S/gm;

const check = (id, label, status, tip) => ({ id, label, status, tip });
const keywordSlug = (keyword) => keyword.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

function lengthStatus(length, min, max) {
  if (length === 0) return 'bad';
  return length >= min && length <= max ? 'good' : 'warn';
}

function basicChecks(form, title, description) {
  return [
    check(
      'title-length',
      `Search title length (${title.length})`,
      lengthStatus(title.length, TITLE_MIN, TITLE_MAX),
      `Aim for ${TITLE_MIN}–${TITLE_MAX} characters so Google shows the whole title. Set an SEO title if the article title is longer.`
    ),
    check(
      'description-length',
      `Search description length (${description.length})`,
      lengthStatus(description.length, DESCRIPTION_MIN, DESCRIPTION_MAX),
      `Aim for ${DESCRIPTION_MIN}–${DESCRIPTION_MAX} characters. It is the snippet people read before clicking.`
    ),
  ];
}

function keywordChecks(form, title, description, words) {
  const keyword = (form.focus_keyword || '').trim().toLowerCase();
  if (!keyword) {
    return [check('keyword-set', 'Focus keyword', 'warn', 'Add the phrase you want this article to rank for to unlock the keyword checks.')];
  }
  const intro = words.slice(0, INTRO_WORDS).join(' ').toLowerCase();
  const found = (hit) => (hit ? 'good' : 'bad');
  return [
    check('keyword-set', 'Focus keyword', 'good', 'Keyword is set.'),
    check('keyword-in-title', 'Keyword in the search title', found(title.toLowerCase().includes(keyword)), 'Use the focus keyword in the title, ideally near the start.'),
    check('keyword-in-description', 'Keyword in the search description', found(description.toLowerCase().includes(keyword)), 'Mention the focus keyword once in the description.'),
    check('keyword-in-intro', `Keyword in the first ${INTRO_WORDS} words`, found(intro.includes(keyword)), 'Say the focus keyword early so readers and Google see the topic straight away.'),
    check('keyword-in-slug', 'Keyword in the URL', found((form.slug || '').includes(keywordSlug(keyword))), 'Include the focus keyword in the URL slug.'),
  ];
}

function contentChecks(form, content, words) {
  const wordStatus = words.length >= WORDS_GOOD ? 'good' : words.length >= WORDS_OK ? 'warn' : 'bad';
  const subheadings = (content.match(SUBHEADING) || []).length;
  const internalLinks = (content.match(INTERNAL_LINK) || []).length;
  const hasImage = Boolean((form.feature_image || '').trim());

  const checks = [
    check('word-count', `Article length (${words.length} words)`, wordStatus, `Long, useful articles tend to rank better. Aim for ${WORDS_GOOD}+ words.`),
    check('subheadings', 'Sub-headings', subheadings >= 2 ? 'good' : subheadings === 1 ? 'warn' : 'bad', 'Break the article up with at least two ## or ### headings.'),
    check('internal-links', 'Links to other pages on your site', internalLinks >= 1 ? 'good' : 'warn', 'Link to a related article or service, e.g. [risk profiling](/blogs/some-article).'),
    check('has-image', 'Feature image', hasImage ? 'good' : 'warn', 'A feature image makes the article stand out in search and when shared.'),
  ];
  if (hasImage) {
    const hasAlt = Boolean((form.feature_image_alt || '').trim());
    checks.push(check('image-alt', 'Image alt text', hasAlt ? 'good' : 'bad', 'Describe the image in a few words for screen readers and image search.'));
  }
  checks.push(check('slug-length', 'URL length', (form.slug || '').length <= SLUG_MAX ? 'good' : 'warn', `Keep the URL under ${SLUG_MAX} characters.`));
  return checks;
}

/** Returns { score (0-100), level ('good' | 'ok' | 'poor'), checks: [{ id, label, status, tip }] }. */
export function analyzeSeo(form) {
  const title = (form.seo_title || form.title || '').trim();
  const description = (form.seo_description || form.excerpt || '').trim();
  const content = form.content || '';
  const words = content.trim().split(/\s+/).filter(Boolean);

  const checks = [
    ...basicChecks(form, title, description),
    ...keywordChecks(form, title, description, words),
    ...contentChecks(form, content, words),
  ];
  const total = checks.reduce((sum, item) => sum + SCORE_VALUE[item.status], 0);
  const score = Math.round((total / checks.length) * 100);
  return { score, level: score >= LEVEL_GOOD ? 'good' : score >= LEVEL_OK ? 'ok' : 'poor', checks };
}
