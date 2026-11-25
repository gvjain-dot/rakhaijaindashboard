import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import EditorSidebar from './EditorSidebar';

jest.mock('../api', () => ({
  uploadImage: jest.fn(),
  UnauthorizedError: class UnauthorizedError extends Error {},
}));

const baseForm = {
  title: 'T', slug: 'a-post', excerpt: 'E', content: 'Body', category: '', tags: [], external_url: '',
  feature_image: '', feature_image_alt: '', seo_title: '', seo_description: '', social_image: '',
  canonical_url: '', noindex: false, focus_keyword: '', published: false, published_at: '',
  featured: false, author_name: '', author_bio: '',
};

const setup = (formOverrides = {}) => {
  const setField = jest.fn();
  render(
    <EditorSidebar
      form={{ ...baseForm, ...formOverrides }}
      setField={setField}
      onSlugChange={jest.fn()}
      categories={[]}
      tagSuggestions={[]}
      token="t"
      onUnauthorized={jest.fn()}
      onUploadBusyChange={jest.fn()}
      busy={false}
      submitLabel="Save draft"
      showExternalLink={false}
      previewUrl=""
    />
  );
  return setField;
};

test('offers a Featured switch that explains only one article can be featured', () => {
  const setField = setup();
  const featured = screen.getByRole('switch', { name: /featured/i });
  expect(featured).not.toBeChecked();
  expect(screen.getByText(/only one article can be featured/i)).toBeInTheDocument();
  userEvent.click(featured);
  expect(setField).toHaveBeenCalledWith('featured', true);
});

test('the Featured switch reflects the saved state', () => {
  setup({ featured: true });
  expect(screen.getByRole('switch', { name: /featured/i })).toBeChecked();
});

test('has author name and bio fields that default to Rakhi Jain when empty', () => {
  const setField = setup();
  const name = screen.getByLabelText(/author name/i);
  expect(name).toHaveAttribute('maxLength', '80');
  expect(screen.getByText(/leave empty for rakhi jain/i)).toBeInTheDocument();
  fireEvent.change(name, { target: { value: 'Jane Doe' } });
  expect(setField).toHaveBeenCalledWith('author_name', 'Jane Doe');

  const bio = screen.getByLabelText(/author bio/i);
  expect(bio).toHaveAttribute('maxLength', '500');
  fireEvent.change(bio, { target: { value: 'Writes about tax.' } });
  expect(setField).toHaveBeenCalledWith('author_bio', 'Writes about tax.');
});

test('shows the author already saved on the article', () => {
  setup({ author_name: 'Jane Doe', author_bio: 'Writes about tax.' });
  expect(screen.getByLabelText(/author name/i)).toHaveValue('Jane Doe');
  expect(screen.getByLabelText(/author bio/i)).toHaveValue('Writes about tax.');
});
