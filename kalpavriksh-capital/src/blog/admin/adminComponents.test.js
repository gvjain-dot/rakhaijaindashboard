import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import PostList from './PostList';
import ImageField from './ImageField';
import ConfirmDialog from './ConfirmDialog';
import { uploadImage } from '../api';

jest.mock('../api', () => ({
  uploadImage: jest.fn(),
  UnauthorizedError: class UnauthorizedError extends Error {},
}));

const posts = [
  { id: 1, slug: 'alpha', title: 'Alpha Article', excerpt: 'About saving', category: 'Saving', published: true, published_at: '2026-02-01T00:00:00Z', created_at: '2026-01-30T00:00:00Z', feature_image: null, external_url: null },
  { id: 2, slug: 'beta', title: 'Beta Draft', excerpt: 'About risk', category: 'Risk', published: false, published_at: null, created_at: '2026-02-02T00:00:00Z', feature_image: null, external_url: null },
];

const renderList = (props = {}) =>
  render(
    <MemoryRouter>
      <PostList posts={posts} status="ready" error="" onRetry={() => {}} onEdit={() => {}} onDelete={() => {}} onNew={() => {}} {...props} />
    </MemoryRouter>
  );

describe('PostList', () => {
  test('shows counts and filters to drafts', () => {
    renderList();
    expect(screen.getByRole('button', { name: /^All/ })).toHaveTextContent('2');
    userEvent.click(screen.getByRole('button', { name: /^Drafts/ }));
    expect(screen.queryByText('Alpha Article')).not.toBeInTheDocument();
    expect(screen.getByText('Beta Draft')).toBeInTheDocument();
  });

  test('search narrows the list and offers to clear when nothing matches', () => {
    renderList();
    userEvent.type(screen.getByLabelText('Search articles'), 'risk');
    expect(screen.queryByText('Alpha Article')).not.toBeInTheDocument();
    expect(screen.getByText('Beta Draft')).toBeInTheDocument();

    userEvent.clear(screen.getByLabelText('Search articles'));
    userEvent.type(screen.getByLabelText('Search articles'), 'zzz');
    expect(screen.getByText('No matching articles')).toBeInTheDocument();
    userEvent.click(screen.getByRole('button', { name: 'Clear filters' }));
    expect(screen.getByText('Alpha Article')).toBeInTheDocument();
  });

  test('shows an empty state with a create button', () => {
    const onNew = jest.fn();
    renderList({ posts: [], onNew });
    expect(screen.getByText('No articles yet')).toBeInTheDocument();
    userEvent.click(screen.getAllByRole('button', { name: '+ New article' })[1]);
    expect(onNew).toHaveBeenCalled();
  });

  test('shows the error with a retry button', () => {
    const onRetry = jest.fn();
    renderList({ posts: [], status: 'error', error: 'Boom', onRetry });
    expect(screen.getByRole('alert')).toHaveTextContent('Boom');
    userEvent.click(screen.getByRole('button', { name: 'Try again' }));
    expect(onRetry).toHaveBeenCalled();
  });

  test('delete and edit buttons pass the right post', () => {
    const onDelete = jest.fn();
    const onEdit = jest.fn();
    renderList({ onDelete, onEdit });
    userEvent.click(screen.getByRole('button', { name: 'Delete Beta Draft' }));
    expect(onDelete).toHaveBeenCalledWith(posts[1]);
    userEvent.click(screen.getByRole('button', { name: 'Edit Alpha Article' }));
    expect(onEdit).toHaveBeenCalledWith(posts[0]);
  });
});

describe('ImageField', () => {
  beforeEach(() => uploadImage.mockReset());
  const file = new File(['x'], 'photo.png', { type: 'image/png' });

  test('uploads a chosen file and reports the returned url', async () => {
    uploadImage.mockResolvedValue('https://blob.test/blog/a.png');
    const onChange = jest.fn();
    render(<ImageField token="t" value="" onChange={onChange} onUnauthorized={() => {}} />);
    userEvent.upload(screen.getByLabelText('Upload feature image'), file);
    await waitFor(() => expect(onChange).toHaveBeenCalledWith('https://blob.test/blog/a.png'));
    expect(uploadImage).toHaveBeenCalledWith('t', file);
  });

  test('shows the server message inline when the upload fails', async () => {
    uploadImage.mockRejectedValue(new Error('Image storage is not configured.'));
    render(<ImageField token="t" value="" onChange={() => {}} onUnauthorized={() => {}} />);
    userEvent.upload(screen.getByLabelText('Upload feature image'), file);
    expect(await screen.findByRole('alert')).toHaveTextContent('Image storage is not configured.');
  });

  test('can remove an existing image', () => {
    const onChange = jest.fn();
    render(<ImageField token="t" value="https://x.test/a.png" onChange={onChange} onUnauthorized={() => {}} />);
    userEvent.click(screen.getByRole('button', { name: 'Remove' }));
    expect(onChange).toHaveBeenCalledWith('');
  });

  test('tells the parent while an upload is in flight', async () => {
    let finish;
    uploadImage.mockReturnValue(new Promise((resolve) => { finish = resolve; }));
    const onBusyChange = jest.fn();
    render(<ImageField token="t" value="" onChange={() => {}} onUnauthorized={() => {}} onBusyChange={onBusyChange} />);
    userEvent.upload(screen.getByLabelText('Upload feature image'), file);
    await waitFor(() => expect(onBusyChange).toHaveBeenLastCalledWith(true));
    finish('https://blob.test/b.png');
    await waitFor(() => expect(onBusyChange).toHaveBeenLastCalledWith(false));
  });
});

describe('ConfirmDialog', () => {
  const baseProps = { open: true, title: 'Delete?', message: 'Gone forever', confirmLabel: 'Delete it' };

  test('focuses the safe action, confirms, and cancels with Escape', () => {
    const onConfirm = jest.fn();
    const onCancel = jest.fn();
    render(<ConfirmDialog {...baseProps} onConfirm={onConfirm} onCancel={onCancel} />);
    expect(screen.getByRole('button', { name: 'Cancel' })).toHaveFocus();
    fireEvent.keyDown(screen.getByRole('alertdialog'), { key: 'Escape' });
    expect(onCancel).toHaveBeenCalled();
    userEvent.click(screen.getByRole('button', { name: 'Delete it' }));
    expect(onConfirm).toHaveBeenCalled();
  });

  test('renders nothing when closed and ignores Escape while busy', () => {
    const onCancel = jest.fn();
    const { rerender } = render(<ConfirmDialog {...baseProps} open={false} onConfirm={() => {}} onCancel={onCancel} />);
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
    rerender(<ConfirmDialog {...baseProps} busy onConfirm={() => {}} onCancel={onCancel} />);
    fireEvent.keyDown(screen.getByRole('alertdialog'), { key: 'Escape' });
    expect(onCancel).not.toHaveBeenCalled();
  });
});
