import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import PostCard from './PostCard';
import { formatDate, readingTimeLabel, slugify } from './format';

const basePost = {
  id: 1,
  slug: 'asset-allocation-101',
  title: 'Asset Allocation 101',
  excerpt: 'Why allocation matters.',
  category: 'Investing',
  feature_image: null,
  external_url: null,
  reading_minutes: 4,
  published_at: '2026-02-23T09:00:00Z',
};

const renderCard = (post) =>
  render(
    <MemoryRouter>
      <PostCard post={post} />
    </MemoryRouter>
  );

test('links an on-site post to its blog page', () => {
  renderCard(basePost);
  expect(screen.getByRole('link')).toHaveAttribute('href', '/blogs/asset-allocation-101');
  expect(screen.getByText('4 min read', { exact: false })).toBeInTheDocument();
});

test('opens external articles in a new tab safely', () => {
  renderCard({ ...basePost, external_url: 'https://www.linkedin.com/pulse/x' });
  const link = screen.getByRole('link');
  expect(link).toHaveAttribute('href', 'https://www.linkedin.com/pulse/x');
  expect(link).toHaveAttribute('target', '_blank');
  expect(link).toHaveAttribute('rel', expect.stringContaining('noopener'));
});

test('keeps site-relative links in the same tab', () => {
  renderCard({ ...basePost, external_url: '/asset-allocation' });
  expect(screen.getByRole('link')).not.toHaveAttribute('target');
});

test('shows the fallback emblem when there is no feature image', () => {
  const { container } = renderCard(basePost);
  expect(container.querySelector('img[src="/icon.svg"]')).not.toBeNull();
});

test('format helpers behave', () => {
  expect(formatDate('not-a-date')).toBe('');
  expect(readingTimeLabel(0)).toBe('1 min read');
  expect(slugify("The Smart Person's Blind Spot")).toBe('the-smart-person-s-blind-spot');
});
