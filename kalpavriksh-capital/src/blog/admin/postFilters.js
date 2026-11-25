// Pure helpers for the admin article list: status, category and text filters plus sorting.

export const SORTS = [
  { id: 'newest', label: 'Newest first' },
  { id: 'oldest', label: 'Oldest first' },
  { id: 'views', label: 'Most viewed' },
  { id: 'title', label: 'Title A–Z' },
];

/** published (live now), scheduled (published with a future date) or draft. */
export function postStatus(post, now = new Date()) {
  if (!post.published) return 'draft';
  return post.published_at && new Date(post.published_at) > now ? 'scheduled' : 'published';
}

export function countByStatus(posts, now = new Date()) {
  return posts.reduce(
    (counts, post) => ({ ...counts, [postStatus(post, now)]: counts[postStatus(post, now)] + 1 }),
    { all: posts.length, published: 0, scheduled: 0, draft: 0 }
  );
}

export function categoriesOf(posts) {
  return [...new Set(posts.map((post) => post.category).filter(Boolean))].sort((a, b) => a.localeCompare(b));
}

const sortDate = (post) => new Date(post.published_at || post.created_at).getTime();

const COMPARATORS = {
  newest: (a, b) => sortDate(b) - sortDate(a),
  oldest: (a, b) => sortDate(a) - sortDate(b),
  views: (a, b) => (b.view_count || 0) - (a.view_count || 0) || sortDate(b) - sortDate(a),
  title: (a, b) => a.title.localeCompare(b.title),
};

function matchesText(post, query) {
  if (!query) return true;
  return [post.title, post.category, post.excerpt].filter(Boolean).join(' ').toLowerCase().includes(query);
}

/** Returns a new, filtered and sorted array; the input is never modified. */
export function applyPostView(posts, { status = 'all', category = '', query = '', sort = 'newest' } = {}, now = new Date()) {
  const needle = query.trim().toLowerCase();
  return posts
    .filter((post) => status === 'all' || postStatus(post, now) === status)
    .filter((post) => !category || post.category === category)
    .filter((post) => matchesText(post, needle))
    .sort(COMPARATORS[sort] || COMPARATORS.newest);
}
