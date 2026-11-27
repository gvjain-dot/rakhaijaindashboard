import React from 'react';
import { act, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import BlogList from './BlogList';
import { fetchPosts } from './api';

jest.mock('./api', () => ({ fetchPosts: jest.fn(), subscribe: jest.fn() }));

const makePost = (id, extra = {}) => ({
  id,
  slug: `post-${id}`,
  title: `Article ${id}`,
  excerpt: 'About saving',
  category: 'Asset Allocation',
  feature_image: null,
  external_url: null,
  reading_minutes: 3,
  published_at: '2026-02-01T00:00:00Z',
  ...extra,
});

const post = makePost(1, { title: 'Alpha Article', slug: 'alpha' });
const CATEGORIES = ['Asset Allocation', 'Retirement Planning'];

const respond = (extra = {}) => ({
  posts: [post],
  featured: null,
  archive: [],
  categories: CATEGORIES,
  tags: [],
  pagination: { total: 1, page: 1, limit: 11, offset: 0 },
  ...extra,
});

const renderList = (route = '/blogs') =>
  render(
    <MemoryRouter initialEntries={[route]}>
      <BlogList />
    </MemoryRouter>
  );

const lastParams = () => fetchPosts.mock.calls[fetchPosts.mock.calls.length - 1][0];

beforeEach(() => {
  fetchPosts.mockReset();
  fetchPosts.mockResolvedValue(respond());
});

test('sets the blog list title and description', async () => {
  const tag = document.createElement('meta');
  tag.setAttribute('name', 'description');
  document.head.appendChild(tag);
  const { unmount } = renderList();
  await screen.findByRole('button', { name: 'Asset Allocation' });
  expect(document.title).toBe('Wealth Management & Financial Planning Insights | Blog');
  expect(tag).toHaveAttribute('content', 'Explore wealth management insights, financial planning strategies, investment knowledge and expert perspectives to make informed financial decisions.');
  unmount();
  tag.remove();
});

// --- categories ----------------------------------------------------------------------------------
test('offers categories as tabs, with "All articles" first', async () => {
  renderList();
  await screen.findByRole('button', { name: 'Asset Allocation' }); // categories arrive with the first response
  const nav = screen.getByRole('navigation', { name: /categories/i });
  const labels = within(nav).getAllByRole('button').map((button) => button.textContent);
  expect(labels).toEqual(['All articles', ...CATEGORIES]);
  expect(within(nav).getByRole('button', { name: 'All articles' })).toHaveAttribute('aria-current', 'true');
});

test('choosing a category tab reloads the articles for that category', async () => {
  renderList();
  userEvent.click(await screen.findByRole('button', { name: 'Asset Allocation' }));
  await waitFor(() => expect(lastParams()).toEqual(expect.objectContaining({ category: 'Asset Allocation' })));
  expect(screen.getByRole('button', { name: 'Asset Allocation' })).toHaveAttribute('aria-current', 'true');
});

test('keeps an active category selectable even if the list does not include it', async () => {
  renderList('/blogs?category=Old%20Topic');
  const tab = await screen.findByRole('button', { name: 'Old Topic' });
  expect(tab).toHaveAttribute('aria-current', 'true');
});

test('summarises the result and clears the active filters', async () => {
  renderList('/blogs?category=Asset%20Allocation');
  expect(await screen.findByText(/1 article/i)).toBeInTheDocument();
  userEvent.click(screen.getByRole('button', { name: /clear filters/i }));
  await waitFor(() => expect(lastParams()).toEqual(expect.objectContaining({ category: '' })));
  expect(screen.queryByRole('button', { name: /clear filters/i })).not.toBeInTheDocument();
});

// --- tags ----------------------------------------------------------------------------------------
const withTags = (tags) => fetchPosts.mockResolvedValue(respond({ tags }));

test('lists popular tags and filters by the one you click', async () => {
  withTags(['risk', 'tax']);
  renderList();
  userEvent.click(await screen.findByRole('button', { name: '#risk' }));
  await waitFor(() => expect(lastParams()).toEqual(expect.objectContaining({ tag: 'risk' })));
  expect(screen.getByRole('button', { name: '#risk' })).toHaveAttribute('aria-pressed', 'true');
});

test('clicking the active tag again removes the tag filter', async () => {
  withTags(['risk']);
  renderList('/blogs?tag=risk');
  userEvent.click(await screen.findByRole('button', { name: '#risk' }));
  await waitFor(() => expect(lastParams()).toEqual(expect.objectContaining({ tag: '' })));
});

test('an active tag is named in the summary and removed by Clear filters', async () => {
  withTags(['risk']);
  renderList('/blogs?tag=risk');
  expect(await screen.findByText(/tagged/i)).toBeInTheDocument();
  userEvent.click(screen.getByRole('button', { name: /clear filters/i }));
  await waitFor(() => expect(lastParams()).toEqual(expect.objectContaining({ tag: '' })));
});

test('no tag row appears when no articles have tags', async () => {
  withTags([]);
  renderList();
  await screen.findByRole('navigation', { name: /categories/i });
  expect(screen.queryByText(/popular tags/i)).not.toBeInTheDocument();
});

// --- search + sort -------------------------------------------------------------------------------
test('the search box can be cleared with its clear button', async () => {
  renderList('/blogs?q=risk');
  const search = await screen.findByRole('searchbox', { name: /search articles/i });
  expect(search).toHaveValue('risk');
  userEvent.click(screen.getByRole('button', { name: /clear search/i }));
  expect(search).toHaveValue('');
});

test('sorting oldest first reloads with sort=oldest', async () => {
  renderList();
  const sort = await screen.findByRole('combobox', { name: /sort articles/i });
  expect(within(sort).getAllByRole('option').map((option) => option.textContent)).toEqual(['Newest first', 'Oldest first']);
  userEvent.selectOptions(sort, 'oldest');
  await waitFor(() => expect(lastParams()).toEqual(expect.objectContaining({ sort: 'oldest' })));
});

// --- featured post + lead card --------------------------------------------------------------------
test('shows the featured post above the grid when the API returns one', async () => {
  fetchPosts.mockResolvedValue(respond({ featured: makePost(9, { title: 'The Featured One', slug: 'featured-one' }) }));
  renderList();
  const link = await screen.findByRole('link', { name: 'The Featured One' });
  expect(link).toHaveAttribute('href', '/blogs/featured-one');
  expect(screen.getByText(/featured/i, { selector: '.kj-tag' })).toBeInTheDocument();
});

test('shows no featured block when the API has none', async () => {
  renderList();
  await screen.findByText('Alpha Article');
  expect(document.querySelector('.kj-featured')).toBeNull();
});

test('the first card is the wide lead card only while nothing is filtered', async () => {
  fetchPosts.mockResolvedValue(respond({ posts: [makePost(1), makePost(2)], pagination: { total: 2 } }));
  const { unmount } = renderList();
  await screen.findByText('Article 1');
  expect(document.querySelectorAll('.kj-card--lead')).toHaveLength(1);
  expect(document.querySelector('.kj-card--lead')).toHaveTextContent('Article 1');
  unmount();

  renderList('/blogs?category=Asset%20Allocation');
  await screen.findByText('Article 1');
  expect(document.querySelector('.kj-card--lead')).toBeNull();
});

// --- archive -------------------------------------------------------------------------------------
const ARCHIVE = [
  { year: 2026, month: 3, count: 2 },
  { year: 2025, month: 12, count: 1 },
];

test('the archive lists years and months, and filtering by a month reloads the list', async () => {
  fetchPosts.mockResolvedValue(respond({ archive: ARCHIVE }));
  renderList();
  const latest = await screen.findByRole('button', { name: /2026/ });
  expect(latest).toHaveAttribute('aria-expanded', 'true');
  expect(screen.getByRole('button', { name: /2025/ })).toHaveAttribute('aria-expanded', 'false');

  userEvent.click(screen.getByRole('button', { name: /march/i }));
  await waitFor(() => expect(lastParams()).toEqual(expect.objectContaining({ month: '2026-03' })));
  expect(screen.getByRole('button', { name: /march/i })).toHaveAttribute('aria-pressed', 'true');

  userEvent.click(screen.getByRole('button', { name: /march/i }));
  await waitFor(() => expect(lastParams()).toEqual(expect.objectContaining({ month: '' })));
});

test('opening an older year reveals its months', async () => {
  fetchPosts.mockResolvedValue(respond({ archive: ARCHIVE }));
  renderList();
  userEvent.click(await screen.findByRole('button', { name: /2025/ }));
  expect(screen.getByRole('button', { name: /december/i })).toBeInTheDocument();
});

test('there is no archive section when there are no dated posts', async () => {
  renderList();
  await screen.findByText('Alpha Article');
  expect(screen.queryByRole('heading', { name: /archive/i })).not.toBeInTheDocument();
});

// --- load more -----------------------------------------------------------------------------------
test('the first request asks for 11 articles from offset 0', async () => {
  renderList();
  await screen.findByText('Alpha Article');
  expect(lastParams()).toEqual(expect.objectContaining({ limit: 11, offset: 0 }));
});

test('"Load more" appends the next 6 articles and reports progress', async () => {
  const first = Array.from({ length: 11 }, (_, index) => makePost(index + 1));
  const next = Array.from({ length: 6 }, (_, index) => makePost(index + 12));
  fetchPosts
    .mockResolvedValueOnce(respond({ posts: first, pagination: { total: 20, page: 1, limit: 11, offset: 0 } }))
    .mockResolvedValueOnce(respond({ posts: next, pagination: { total: 20, page: 2, limit: 6, offset: 11 } }));
  renderList();

  expect(await screen.findByText(/showing 11 of 20/i)).toBeInTheDocument();
  userEvent.click(screen.getByRole('link', { name: /load more articles/i }));

  expect(await screen.findByText('Article 17')).toBeInTheDocument();
  expect(screen.getByText('Article 1')).toBeInTheDocument();
  expect(lastParams()).toEqual(expect.objectContaining({ limit: 6, offset: 11 }));
  expect(screen.getByText(/showing 17 of 20/i)).toBeInTheDocument();
});

test('no "Load more" once every article is showing', async () => {
  renderList();
  await screen.findByText('Alpha Article');
  expect(screen.queryByRole('link', { name: /load more articles/i })).not.toBeInTheDocument();
});

test('opening ?page=2 loads both windows so the first articles are not lost', async () => {
  fetchPosts.mockImplementation((params) =>
    Promise.resolve(
      respond({
        posts: params.offset === 0 ? [makePost(1)] : [makePost(12)],
        pagination: { total: 20, page: 1, limit: params.limit, offset: params.offset },
      })
    )
  );
  renderList('/blogs?page=2');
  expect(await screen.findByText('Article 12')).toBeInTheDocument();
  expect(screen.getByText('Article 1')).toBeInTheDocument();
  expect(fetchPosts).toHaveBeenCalledWith(expect.objectContaining({ offset: 11, limit: 6 }), expect.anything());
});

// --- states --------------------------------------------------------------------------------------
test('offers the newsletter signup in the list', async () => {
  renderList();
  expect(await screen.findByRole('button', { name: /subscribe/i })).toBeInTheDocument();
});

test('shows an empty state when nothing matches', async () => {
  fetchPosts.mockResolvedValue(respond({ posts: [], pagination: { total: 0 } }));
  renderList('/blogs?q=zzz');
  expect(await screen.findByText(/no articles found/i)).toBeInTheDocument();
});

test('shows an error with a retry when loading fails', async () => {
  fetchPosts.mockRejectedValue(new Error('Could not reach the server.'));
  renderList();
  expect(await screen.findByRole('alert')).toHaveTextContent(/could not reach the server/i);
  expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument();
});

// --- load more robustness -------------------------------------------------------------------------
test('a "Load more" that finishes after the filter changed is ignored', async () => {
  const first = Array.from({ length: 11 }, (_, index) => makePost(index + 1));
  let finishLoadMore;
  fetchPosts.mockImplementation((params) => {
    if (params.offset === 11) return new Promise((resolve) => { finishLoadMore = resolve; });
    if (params.category === 'Retirement Planning') {
      return Promise.resolve(respond({ posts: [makePost(99, { title: 'Retirement piece' })], pagination: { total: 1 } }));
    }
    return Promise.resolve(respond({ posts: first, pagination: { total: 20 } }));
  });
  renderList();
  userEvent.click(await screen.findByRole('link', { name: /load more articles/i }));
  userEvent.click(screen.getByRole('button', { name: 'Retirement Planning' }));
  expect(await screen.findByText('Retirement piece')).toBeInTheDocument();

  await act(async () => {
    finishLoadMore(respond({ posts: [makePost(50, { title: 'Stale old-filter article' })], pagination: { total: 20 } }));
  });
  expect(screen.queryByText('Stale old-filter article')).not.toBeInTheDocument();
  expect(screen.getByText('Retirement piece')).toBeInTheDocument();
});

test('a failed "Load more" tells the reader and keeps what is already shown', async () => {
  const first = Array.from({ length: 11 }, (_, index) => makePost(index + 1));
  fetchPosts
    .mockResolvedValueOnce(respond({ posts: first, pagination: { total: 20 } }))
    .mockRejectedValueOnce(new Error('Could not reach the server.'));
  renderList();
  userEvent.click(await screen.findByRole('link', { name: /load more articles/i }));
  expect(await screen.findByRole('alert')).toHaveTextContent(/could not reach the server/i);
  expect(screen.getByText('Article 1')).toBeInTheDocument();
  expect(screen.getByRole('link', { name: /load more articles/i })).toBeInTheDocument();
});
