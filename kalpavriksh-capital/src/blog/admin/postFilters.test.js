import { applyPostView, categoriesOf, countByStatus, postStatus } from './postFilters';

const NOW = new Date('2026-06-01T00:00:00Z');
const posts = [
  { id: 1, title: 'Alpha', category: 'Tax', excerpt: 'about saving', published: true, published_at: '2026-05-01T00:00:00Z', created_at: '2026-04-01T00:00:00Z', view_count: 5 },
  { id: 2, title: 'Beta', category: 'Investing', excerpt: 'x', published: false, published_at: null, created_at: '2026-05-20T00:00:00Z', view_count: 0 },
  { id: 3, title: 'Gamma', category: 'Tax', excerpt: 'x', published: true, published_at: '2026-07-01T00:00:00Z', created_at: '2026-05-25T00:00:00Z', view_count: 0 },
  { id: 4, title: 'Delta', category: null, excerpt: 'x', published: true, published_at: '2026-05-15T00:00:00Z', created_at: '2026-05-10T00:00:00Z', view_count: 40 },
];
const ids = (list) => list.map((post) => post.id);

test('classifies posts as published, scheduled or draft', () => {
  expect(postStatus(posts[0], NOW)).toBe('published');
  expect(postStatus(posts[1], NOW)).toBe('draft');
  expect(postStatus(posts[2], NOW)).toBe('scheduled');
});

test('counts posts per status', () => {
  expect(countByStatus(posts, NOW)).toEqual({ all: 4, published: 2, scheduled: 1, draft: 1 });
});

test('lists distinct categories alphabetically', () => {
  expect(categoriesOf(posts)).toEqual(['Investing', 'Tax']);
});

test('filters by status, category and text', () => {
  expect(ids(applyPostView(posts, { status: 'scheduled' }, NOW))).toEqual([3]);
  expect(ids(applyPostView(posts, { category: 'Tax' }, NOW))).toEqual([3, 1]);
  expect(ids(applyPostView(posts, { query: 'SAVING' }, NOW))).toEqual([1]);
});

test('sorts by newest, oldest, most viewed and title without changing the input', () => {
  const before = ids(posts);
  expect(ids(applyPostView(posts, { sort: 'newest' }, NOW))).toEqual([3, 2, 4, 1]);
  expect(ids(applyPostView(posts, { sort: 'oldest' }, NOW))).toEqual([1, 4, 2, 3]);
  expect(ids(applyPostView(posts, { sort: 'views' }, NOW))).toEqual([4, 1, 3, 2]);
  expect(ids(applyPostView(posts, { sort: 'title' }, NOW))).toEqual([1, 2, 4, 3]);
  expect(ids(posts)).toEqual(before);
});
