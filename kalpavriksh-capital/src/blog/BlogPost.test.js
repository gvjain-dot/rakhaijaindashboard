import React from 'react';
import { render, screen, within } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import BlogPost from './BlogPost';
import { fetchPost } from './api';
import useTrackView from './useTrackView';

// react-markdown is ESM-only and cannot be loaded by this Jest setup; the heading-id plugin it hosts
// has its own unit test in toc.test.js. The mock renders the inline newsletter the way the real one does:
// as an element injected into the content.
jest.mock('./PostContent', () => ({ markdown, insertBefore }) => (
  <div data-testid="content" data-insert-before={insertBefore ? insertBefore.id : ''}>
    {markdown}
    {insertBefore && insertBefore.element}
  </div>
));
jest.mock('./api', () => ({ fetchPost: jest.fn(), subscribe: jest.fn(), trackView: jest.fn() }));
jest.mock('./useTrackView', () => ({ __esModule: true, default: jest.fn() }));

const LONG_ARTICLE = '## Why it matters\n\ntext\n\n## How to start\n\ntext\n\n### A detail\n\ntext';

const post = (extra = {}) => ({
  id: 1,
  slug: 'asset-allocation-101',
  title: 'Asset Allocation 101',
  excerpt: 'Why allocation matters.',
  content: LONG_ARTICLE,
  category: 'Investing',
  tags: ['risk', 'tax planning'],
  feature_image: 'https://img.test/tree.png',
  feature_image_alt: 'A tree with coins for leaves',
  reading_minutes: 4,
  published_at: '2026-02-01T00:00:00Z',
  ...extra,
});

const renderPost = (route = '/blogs/asset-allocation-101') =>
  render(
    <MemoryRouter initialEntries={[route]}>
      <Routes>
        <Route path="/blogs/:slug" element={<BlogPost />} />
      </Routes>
    </MemoryRouter>
  );

const respondWith = (postFields, extra = {}) =>
  fetchPost.mockResolvedValue({ post: post(postFields), related: [], preview: false, ...extra });

beforeEach(() => fetchPost.mockReset());

test('builds a table of contents that links to each heading', async () => {
  respondWith();
  renderPost();
  const nav = await screen.findByRole('navigation', { name: /table of contents/i });
  expect(nav).toHaveTextContent('Why it matters');
  expect(within(nav).getByRole('link', { name: 'Why it matters' })).toHaveAttribute('href', '#why-it-matters');
  expect(within(nav).getByRole('link', { name: 'A detail' })).toHaveAttribute('href', '#a-detail');
});

test('skips the table of contents for short articles', async () => {
  respondWith({ content: '## Only one\n\ntext' });
  renderPost();
  await screen.findByRole('heading', { level: 1, name: 'Asset Allocation 101' });
  expect(screen.queryByRole('navigation', { name: /table of contents/i })).not.toBeInTheDocument();
});

test('shows tags that link to the filtered article list', async () => {
  respondWith();
  renderPost();
  expect(await screen.findByRole('link', { name: '#risk' })).toHaveAttribute('href', '/blogs?tag=risk');
  expect(screen.getByRole('link', { name: '#tax planning' })).toHaveAttribute('href', '/blogs?tag=tax%20planning');
});

test('uses the alt text for the feature image, falling back to the title', async () => {
  respondWith();
  const { unmount } = renderPost();
  expect(await screen.findByRole('img', { name: 'A tree with coins for leaves' })).toBeInTheDocument();
  unmount();

  respondWith({ feature_image_alt: null });
  renderPost();
  expect(await screen.findByRole('img', { name: 'Asset Allocation 101' })).toBeInTheDocument();
});

test('shows the author box and the newsletter signup', async () => {
  respondWith();
  renderPost();
  expect(await screen.findByRole('complementary', { name: /about the author/i })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /subscribe/i })).toBeInTheDocument();
});

test('a live article has no preview banner and is not marked noindex', async () => {
  respondWith();
  renderPost();
  await screen.findByRole('heading', { level: 1, name: 'Asset Allocation 101' });
  expect(screen.queryByText(/not public yet/i)).not.toBeInTheDocument();
  expect(document.querySelector('meta[name="robots"][content="noindex, nofollow"]')).toBeNull();
});

test('a private preview passes its token, shows a banner and is marked noindex until you leave', async () => {
  respondWith({}, { preview: true });
  const { unmount } = renderPost('/blogs/asset-allocation-101?preview=secret-token');
  expect(await screen.findByText(/not public yet/i)).toBeInTheDocument();
  expect(fetchPost).toHaveBeenCalledWith('asset-allocation-101', expect.anything(), 'secret-token');
  expect(document.querySelector('meta[name="robots"][content="noindex, nofollow"]')).not.toBeNull();

  unmount();
  expect(document.querySelector('meta[name="robots"][content="noindex, nofollow"]')).toBeNull();
});

test('shows breadcrumbs back to the journal and the category', async () => {
  respondWith();
  renderPost();
  const crumbs = await screen.findByRole('navigation', { name: /breadcrumb/i });
  expect(within(crumbs).getByRole('link', { name: 'Journal' })).toHaveAttribute('href', '/blogs');
  expect(within(crumbs).getByRole('link', { name: 'Investing' })).toHaveAttribute('href', '/blogs?category=Investing');
  expect(within(crumbs).getByText('Asset Allocation 101')).toHaveAttribute('aria-current', 'page');
});

test('puts the newsletter inside the article, before the section nearest the middle, and only once', async () => {
  respondWith();
  renderPost();
  const content = await screen.findByTestId('content');
  expect(content).toHaveAttribute('data-insert-before', 'how-to-start');
  expect(within(content).getByRole('button', { name: /subscribe/i })).toBeInTheDocument();
  expect(screen.getAllByRole('button', { name: /subscribe/i })).toHaveLength(1);
});

test('a short article still gets one newsletter, after the text', async () => {
  respondWith({ content: '## Only one\n\ntext' });
  renderPost();
  const content = await screen.findByTestId('content');
  expect(content).toHaveAttribute('data-insert-before', '');
  expect(within(content).queryByRole('button', { name: /subscribe/i })).not.toBeInTheDocument();
  expect(screen.getAllByRole('button', { name: /subscribe/i })).toHaveLength(1);
});

test('names the post author and shows their bio, defaulting to Rakhi Jain', async () => {
  respondWith({ author_name: 'Jane Doe', author_bio: 'Writes about tax.' });
  const { unmount } = renderPost();
  const box = await screen.findByRole('complementary', { name: /about the author/i });
  expect(box).toHaveTextContent('Jane Doe');
  expect(box).toHaveTextContent('Writes about tax.');
  expect(box).not.toHaveTextContent('Rakhi Jain');
  unmount();

  respondWith({ author_name: null, author_bio: null });
  renderPost();
  expect(await screen.findByRole('complementary', { name: /about the author/i })).toHaveTextContent('Rakhi Jain');
});

test('lists related articles with the reason each was suggested', async () => {
  const related = [{ id: 2, slug: 'tax-basics', title: 'Tax Basics', excerpt: 'x', category: 'Investing', reading_minutes: 2, reason: 'Same category: Investing' }];
  respondWith({}, { related });
  renderPost();
  expect(await screen.findByRole('heading', { name: /continue exploring/i })).toBeInTheDocument();
  expect(screen.getByRole('link', { name: 'Tax Basics' })).toHaveAttribute('href', '/blogs/tax-basics');
  expect(screen.getByText('Same category: Investing')).toBeInTheDocument();
});

test('no related section when there is nothing related', async () => {
  respondWith();
  renderPost();
  await screen.findByRole('heading', { level: 1, name: 'Asset Allocation 101' });
  expect(screen.queryByRole('heading', { name: /continue exploring/i })).not.toBeInTheDocument();
});

test('counts the read only for a live, loaded article', async () => {
  respondWith();
  const { unmount } = renderPost();
  await screen.findByRole('heading', { level: 1, name: 'Asset Allocation 101' });
  expect(useTrackView).toHaveBeenLastCalledWith('asset-allocation-101', true);
  unmount();

  useTrackView.mockClear();
  respondWith({}, { preview: true });
  renderPost('/blogs/asset-allocation-101?preview=secret-token');
  await screen.findByText(/not public yet/i);
  expect(useTrackView).toHaveBeenLastCalledWith('asset-allocation-101', false);
});

test('shows the sidebar index next to the inline contents list when there are enough headings', async () => {
  respondWith();
  renderPost();
  await screen.findByRole('navigation', { name: /table of contents/i });
  expect(screen.getByRole('navigation', { name: /in this article/i })).toBeInTheDocument();
});

test('an unknown article shows the not-found message', async () => {
  fetchPost.mockRejectedValue(new Error('Post not found'));
  renderPost();
  expect(await screen.findByText('Article not found')).toBeInTheDocument();
});
