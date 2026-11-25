const { send } = require('./http');

const MAX_CATEGORY_LENGTH = 50;
const MAX_TAG_LENGTH = 30;
const LIMITS = { category: MAX_CATEGORY_LENGTH, tag: MAX_TAG_LENGTH };

const UNDEFINED_TABLE = '42P01'; // db/migrations/004_taxonomy_terms.sql has not been run yet

const collapse = (value) => (typeof value === 'string' ? value.trim().replace(/\s+/g, ' ') : '');
/** Tags are stored lowercase, so they are normalised the same way everywhere. */
const normaliseName = (kind, value) => (kind === 'tag' ? collapse(value).toLowerCase() : collapse(value));
const isKnownKind = (kind) => Object.prototype.hasOwnProperty.call(LIMITS, kind);

/** Validates an "add a new category/tag" request. */
function validateTaxonomyAdd(input) {
  if (!input || typeof input !== 'object') return { error: 'Invalid request' };
  const kind = input.kind;
  if (!isKnownKind(kind)) return { error: 'kind must be "category" or "tag"' };
  const name = normaliseName(kind, input.name);
  if (!name) return { error: 'A name is required' };
  if (name.length > LIMITS[kind]) return { error: `Names can be at most ${LIMITS[kind]} characters` };
  return { value: { kind, name } };
}

/**
 * Adds saved names (categories/tags created in the manager) to the ones counted from articles.
 * A saved name an article already uses (ignoring case) is skipped; the rest appear with a count of 0.
 */
function mergeSavedNames(counted, savedNames) {
  const known = new Set(counted.map((item) => item.name.toLowerCase()));
  const extra = savedNames.filter((name) => !known.has(name.toLowerCase())).map((name) => ({ name, count: 0 }));
  return [...counted, ...extra];
}

/** Runs a query on the saved-names table, treating "table not created yet" as an empty table. */
async function withSavedTable(run, fallback) {
  try {
    return await run();
  } catch (error) {
    if (error && error.code === UNDEFINED_TABLE) {
      console.warn('[api] taxonomy_terms is missing; run db/migrations/004_taxonomy_terms.sql in the Neon SQL editor.');
      return fallback;
    }
    throw error;
  }
}

/** Validates a rename/merge/remove request. */
function validateTaxonomyChange(input) {
  if (!input || typeof input !== 'object') return { error: 'Invalid request' };
  const kind = input.kind;
  if (!isKnownKind(kind)) return { error: 'kind must be "category" or "tag"' };
  // A missing `to` must never be read as "remove": removal is an explicit empty string.
  if (typeof input.to !== 'string') return { error: 'The new name is required (use an empty string to remove)' };
  const normalise = (value) => normaliseName(kind, value);

  const from = normalise(input.from);
  const to = normalise(input.to);
  if (!from) return { error: 'The name to change is required' };
  if (from.length > LIMITS[kind] || to.length > LIMITS[kind]) return { error: `Names can be at most ${LIMITS[kind]} characters` };
  if (from === to) return { error: 'The new name is the same as the old one' };
  return { value: { kind, from, to } };
}

const byName = (a, b) => a.name.localeCompare(b.name);
const byCountThenName = (a, b) => b.count - a.count || byName(a, b);

/** GET ?action=taxonomy - every category and tag (used by an article, or saved in the manager) with its article count. */
async function listTaxonomy(sql, req, res) {
  const [categories, tags] = await Promise.all([
    sql`SELECT category AS name, COUNT(*)::int AS count FROM posts
        WHERE category IS NOT NULL AND category <> '' GROUP BY category ORDER BY category`,
    sql`SELECT tag AS name, COUNT(*)::int AS count
        FROM (SELECT unnest(tags) AS tag FROM posts) AS all_tags
        GROUP BY tag ORDER BY count DESC, tag`,
  ]);
  const saved = await withSavedTable(() => sql`SELECT kind, name FROM taxonomy_terms`, []);
  const savedNames = (kind) => saved.filter((row) => row.kind === kind).map((row) => row.name);
  return send(res, 200, {
    categories: mergeSavedNames(categories, savedNames('category')).sort(byName),
    tags: mergeSavedNames(tags, savedNames('tag')).sort(byCountThenName),
  });
}

/** POST ?action=taxonomy-add { kind, name } - saves a new category or tag so it can be picked before any article uses it. */
async function addTaxonomyTerm(sql, req, res) {
  const result = validateTaxonomyAdd(req.body);
  if (result.error) return send(res, 400, null, result.error);
  const { kind, name } = result.value;

  const inUse = kind === 'category'
    ? await sql`SELECT 1 FROM posts WHERE lower(category) = lower(${name}) LIMIT 1`
    : await sql`SELECT 1 FROM posts, unnest(tags) AS t WHERE lower(t) = lower(${name}) LIMIT 1`;
  if (inUse.length > 0) return send(res, 200, { created: false });

  try {
    const rows = await sql`INSERT INTO taxonomy_terms (kind, name) VALUES (${kind}, ${name}) ON CONFLICT DO NOTHING RETURNING id`;
    return send(res, 200, { created: rows.length > 0 });
  } catch (error) {
    if (error && error.code === UNDEFINED_TABLE) {
      return send(res, 503, null, 'Run db/migrations/004_taxonomy_terms.sql in the Neon SQL editor to enable adding names.');
    }
    throw error;
  }
}

/** Keeps saved names in step with a rename/merge/remove: the old name goes, the new one (if any) is saved. */
async function syncSavedNames(sql, kind, from, to) {
  await withSavedTable(async () => {
    await sql`DELETE FROM taxonomy_terms WHERE kind = ${kind} AND lower(name) = lower(${from})`;
    if (to !== '') await sql`INSERT INTO taxonomy_terms (kind, name) VALUES (${kind}, ${to}) ON CONFLICT DO NOTHING`;
  }, undefined);
}

/**
 * POST ?action=taxonomy { kind, from, to } - renames `from` to `to` on every article. When `to` already exists the
 * two merge (tags are de-duplicated per article); an empty `to` removes the name from every article.
 */
async function changeTaxonomy(sql, req, res) {
  const result = validateTaxonomyChange(req.body);
  if (result.error) return send(res, 400, null, result.error);
  const { kind, from, to } = result.value;

  let rows;
  if (kind === 'category') {
    rows = await sql`UPDATE posts SET category = ${to === '' ? null : to}, updated_at = now() WHERE category = ${from} RETURNING id`;
  } else if (to === '') {
    rows = await sql`UPDATE posts SET tags = array_remove(tags, ${from}), updated_at = now() WHERE ${from} = ANY(tags) RETURNING id`;
  } else {
    rows = await sql`UPDATE posts
                     SET tags = ARRAY(SELECT DISTINCT t FROM unnest(array_replace(tags, ${from}, ${to})) AS t), updated_at = now()
                     WHERE ${from} = ANY(tags) RETURNING id`;
  }
  await syncSavedNames(sql, kind, from, to);
  return send(res, 200, { affected: rows.length });
}

module.exports = { validateTaxonomyChange, validateTaxonomyAdd, mergeSavedNames, listTaxonomy, addTaxonomyTerm, changeTaxonomy };
