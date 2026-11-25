import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import PostEditor from './PostEditor';

jest.mock('./PostContent', () => ({ __esModule: true, default: ({ markdown }) => <div>{markdown}</div> }));

jest.mock('./api', () => ({
  createPost: jest.fn(),
  updatePost: jest.fn(),
  ConflictError: class ConflictError extends Error {},
  UnauthorizedError: class UnauthorizedError extends Error {},
  uploadImage: jest.fn(),
}));

const renderEditor = () =>
  render(<PostEditor token="t" post={null} categories={[]} tagSuggestions={[]} onSaved={jest.fn()} onCancel={jest.fn()} onUnauthorized={jest.fn()} />);

test('SEO fields live in their own tab, not in the sidebar', () => {
  renderEditor();
  const articleTab = screen.getByRole('tab', { name: /^article/i });
  const seoTab = screen.getByRole('tab', { name: /^seo/i });
  expect(articleTab).toHaveAttribute('aria-selected', 'true');
  expect(screen.getByLabelText(/seo title/i)).not.toBeVisible(); // kept mounted so typed values survive

  userEvent.click(seoTab);
  expect(seoTab).toHaveAttribute('aria-selected', 'true');
  expect(screen.getByLabelText(/seo title/i)).toBeVisible();
  expect(screen.getByRole('region', { name: /search appearance/i })).toBeInTheDocument();
  expect(screen.getByLabelText('Title')).not.toBeVisible();
});

test('typed SEO values survive switching tabs', () => {
  renderEditor();
  userEvent.click(screen.getByRole('tab', { name: /^seo/i }));
  userEvent.type(screen.getByLabelText(/focus keyword/i), 'asset allocation');
  userEvent.click(screen.getByRole('tab', { name: /^article/i }));
  userEvent.click(screen.getByRole('tab', { name: /^seo/i }));
  expect(screen.getByLabelText(/focus keyword/i)).toHaveValue('asset allocation');
});

test('the SEO tab shows how many checklist items need work', () => {
  renderEditor();
  expect(screen.getByRole('tab', { name: /seo/i })).toHaveTextContent(/\d/);
});

test('arrow keys move between the tabs and only the selected tab is a tab stop', () => {
  renderEditor();
  const articleTab = screen.getByRole('tab', { name: /^article/i });
  const seoTab = screen.getByRole('tab', { name: /^seo/i });
  expect(articleTab).toHaveAttribute('tabindex', '0');
  expect(seoTab).toHaveAttribute('tabindex', '-1');
  articleTab.focus();
  userEvent.keyboard('{arrowright}');
  expect(seoTab).toHaveAttribute('aria-selected', 'true');
  expect(seoTab).toHaveFocus();
  userEvent.keyboard('{arrowleft}');
  expect(articleTab).toHaveAttribute('aria-selected', 'true');
});

test('an invalid field in the visible SEO tab does not switch tabs', () => {
  renderEditor();
  userEvent.click(screen.getByRole('tab', { name: /^seo/i }));
  userEvent.type(screen.getByLabelText(/canonical url/i), 'not a url');
  userEvent.click(screen.getAllByRole('button', { name: /save draft/i })[0]);
  expect(screen.getByRole('tab', { name: /^seo/i })).toHaveAttribute('aria-selected', 'true');
});
