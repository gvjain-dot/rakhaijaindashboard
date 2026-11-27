const CATEGORY_WEIGHT = 5;
const TAG_WEIGHT = 2;
const DEFAULT_LIMIT = 3;

const asList = (value) => (Array.isArray(value) ? value : []);

function reasonFor(post, candidate, sharedTags) {
  const sameCategory = Boolean(post.category) && candidate.category === post.category;
  const quoted = sharedTags.map((tag) => `“${tag}”`).join(', ');
  if (sameCategory && sharedTags.length > 0) return `Same category · shares ${quoted}`;
  if (sameCategory) return `Same category: ${post.category}`;
  return `Shares ${quoted}`;
}

function compareScored(a, b) {
  if (b.score !== a.score) return b.score - a.score;
  const byDate = String(b.item.published_at || '').localeCompare(String(a.item.published_at || ''));
  return byDate !== 0 ? byDate : b.item.id - a.item.id;
}

/**
 * Ranks candidate posts against `post`: same category +5, each shared tag +2.
 * Ties go to the newest post. Returns copies of the best `limit` candidates with a `reason`.
 */
function scoreRelated(post, candidates, limit = DEFAULT_LIMIT) {
  const postTags = new Set(asList(post.tags));

  return asList(candidates)
    .filter((candidate) => candidate.id !== post.id)
    .map((candidate) => {
      const sharedTags = asList(candidate.tags).filter((tag) => postTags.has(tag));
      const sameCategory = Boolean(post.category) && candidate.category === post.category;
      const score = (sameCategory ? CATEGORY_WEIGHT : 0) + sharedTags.length * TAG_WEIGHT;
      return { item: candidate, score, sharedTags };
    })
    .filter((entry) => entry.score > 0)
    .sort(compareScored)
    .slice(0, limit)
    .map(({ item, sharedTags }) => ({ ...item, reason: reasonFor(post, item, sharedTags) }));
}

const EDITORS_PICK = 'Editor’s selection';

/**
 * Tops `related` up to `limit` with `fallback` posts (newest first), skipping the post itself and anything already
 * chosen, so the "Continue exploring" band is never empty or half-empty. Added posts carry the reason "Editor’s selection".
 */
function fillRelated(post, related, fallback, limit = DEFAULT_LIMIT) {
  const chosen = new Set([post.id, ...asList(related).map((item) => item.id)]);
  const extras = asList(fallback)
    .filter((candidate) => !chosen.has(candidate.id))
    .slice(0, Math.max(0, limit - asList(related).length))
    .map((candidate) => ({ ...candidate, reason: EDITORS_PICK }));
  return [...asList(related), ...extras];
}

module.exports = { scoreRelated, fillRelated, EDITORS_PICK, CATEGORY_WEIGHT, TAG_WEIGHT };
