import React from 'react';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import PostList from './PostList';

jest.mock('../api', () => ({ UnauthorizedError: class UnauthorizedError extends Error {} }));

const posts = [
  { id: 1, slug: 'alpha', title: 'Alpha Article', excerpt: 'About saving', category: 'Saving', published: true, published_at: '2026-02-01T00:00:00Z', created_at: '2026-01-30T00:00:00Z', feature_image: null, external_url: null, view_count: 1204, featured: true },
  { id: 2, slug: 'beta', title: 'Beta Draft', excerpt: 'About risk', category: 'Risk', published: false, published_at: null, created_at: '2026-02-02T00:00:00Z', feature_image: null, external_url: null, view_count: 0, featured: false },
];

const setup = (props = {}) => {
  const handlers = { onBulk: jest.fn().mockResolvedValue(undefined), onDuplicate: jest.fn(), onEdit: jest.fn(), onDelete: jest.fn(), onNew: jest.fn(), onRetry: jest.fn() };
  render(
    <MemoryRouter>
      <PostList posts={posts} status="ready" error="" {...handlers} {...props} />
    </MemoryRouter>
  );
  return handlers;
};

const tick = (title) => userEvent.click(screen.getByRole('checkbox', { name: `Select ${title}` }));
const toolbar = () => screen.getByRole('toolbar', { name: /bulk actions/i });

test('no bulk toolbar until something is selected', () => {
  setup();
  expect(screen.queryByRole('toolbar', { name: /bulk actions/i })).not.toBeInTheDocument();
});

test('selecting an article shows the toolbar with a count, and Publish applies to it', async () => {
  const { onBulk } = setup();
  tick('Beta Draft');
  expect(within(toolbar()).getByText('1 selected')).toBeInTheDocument();
  userEvent.click(within(toolbar()).getByRole('button', { name: 'Publish' }));
  expect(onBulk).toHaveBeenCalledWith('publish', [2]);
  // cleared once the action succeeds
  await waitFor(() => expect(screen.queryByRole('toolbar', { name: /bulk actions/i })).not.toBeInTheDocument());
});

test('"Select all" selects every visible article, and ticking it again clears them', () => {
  setup();
  userEvent.click(screen.getByRole('checkbox', { name: /select all/i }));
  expect(within(toolbar()).getByText('2 selected')).toBeInTheDocument();
  userEvent.click(screen.getByRole('checkbox', { name: /select all/i }));
  expect(screen.queryByRole('toolbar', { name: /bulk actions/i })).not.toBeInTheDocument();
});

test('"Select all" only covers what the current filter shows', () => {
  setup();
  userEvent.click(screen.getByRole('button', { name: /^Drafts/ }));
  userEvent.click(screen.getByRole('checkbox', { name: /select all/i }));
  expect(within(toolbar()).getByText('1 selected')).toBeInTheDocument();
});

test('a selection is dropped when a filter hides the selected article', () => {
  setup();
  tick('Alpha Article');
  userEvent.click(screen.getByRole('button', { name: /^Drafts/ }));
  expect(screen.queryByRole('toolbar', { name: /bulk actions/i })).not.toBeInTheDocument();
});

test('Feature is only offered for a single article', () => {
  setup();
  tick('Alpha Article');
  expect(within(toolbar()).getByRole('button', { name: /feature/i })).toBeEnabled();
  tick('Beta Draft');
  expect(within(toolbar()).getByRole('button', { name: /feature/i })).toBeDisabled();
});

test('bulk delete asks for confirmation naming how many, then deletes', async () => {
  const { onBulk } = setup();
  userEvent.click(screen.getByRole('checkbox', { name: /select all/i }));
  userEvent.click(within(toolbar()).getByRole('button', { name: 'Delete' }));
  expect(onBulk).not.toHaveBeenCalled();
  const dialog = screen.getByRole('alertdialog');
  expect(dialog).toHaveTextContent(/delete 2 articles/i);
  userEvent.click(within(dialog).getByRole('button', { name: /delete articles/i }));
  expect(onBulk).toHaveBeenCalledWith('delete', expect.arrayContaining([1, 2]));
  expect(onBulk.mock.calls[0][1]).toHaveLength(2);
});

test('cancelling the bulk delete confirmation changes nothing', () => {
  const { onBulk } = setup();
  tick('Alpha Article');
  userEvent.click(within(toolbar()).getByRole('button', { name: 'Delete' }));
  userEvent.click(within(screen.getByRole('alertdialog')).getByRole('button', { name: /cancel/i }));
  expect(onBulk).not.toHaveBeenCalled();
  expect(within(toolbar()).getByText('1 selected')).toBeInTheDocument();
});

test('a failed bulk action keeps the selection so it can be retried', async () => {
  const failing = jest.fn().mockRejectedValue(new Error('nope'));
  setup({ onBulk: failing });
  tick('Beta Draft');
  userEvent.click(within(toolbar()).getByRole('button', { name: 'Publish' }));
  expect(failing).toHaveBeenCalledWith('publish', [2]);
  // the toolbar comes back to life (not busy) with the selection intact
  await waitFor(() => expect(within(toolbar()).getByRole('button', { name: 'Publish' })).toBeEnabled());
  expect(within(toolbar()).getByText('1 selected')).toBeInTheDocument();
});

test('each row can be duplicated', () => {
  const { onDuplicate } = setup();
  userEvent.click(screen.getByRole('button', { name: 'Duplicate Alpha Article' }));
  expect(onDuplicate).toHaveBeenCalledWith(posts[0]);
});

test('rows show the view count and a featured badge', () => {
  setup();
  expect(screen.getByText('1,204 views')).toBeInTheDocument();
  expect(screen.getByText('Featured')).toBeInTheDocument();
  expect(screen.getAllByText('Featured')).toHaveLength(1);
});
