import React from 'react';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import DashboardPanel from './DashboardPanel';
import { fetchStats } from '../api';

jest.mock('../api', () => ({
  fetchStats: jest.fn(),
  UnauthorizedError: class UnauthorizedError extends Error {},
}));

const STATS = {
  stats: {
    published: 5,
    drafts: 2,
    scheduled: 1,
    totalViews: 1500,
    subscribers: 14,
    views30d: 330,
    topPosts: [
      { id: 1, slug: 'alpha', title: 'Alpha Article', view_count: 1000 },
      { id: 2, slug: 'beta', title: 'Beta Article', view_count: 500 },
    ],
  },
};

const setup = (props = {}) => {
  const handlers = { onUnauthorized: jest.fn() };
  render(<DashboardPanel token="t" {...handlers} {...props} />);
  return handlers;
};

beforeEach(() => fetchStats.mockReset());

test('shows a stat tile for each headline number', async () => {
  fetchStats.mockResolvedValue(STATS);
  setup();
  const tiles = await screen.findByRole('list', { name: /summary/i });
  const text = (label) => within(tiles).getByText(label).closest('li');
  expect(text('Published')).toHaveTextContent('5');
  expect(text('Drafts')).toHaveTextContent('2');
  expect(text('Scheduled')).toHaveTextContent('1');
  expect(text('Subscribers')).toHaveTextContent('14');
  expect(text('Views, last 30 days')).toHaveTextContent('330');
  expect(text('Views, all time')).toHaveTextContent('1,500');
});

test('lists the most-read articles with their views and a proportional bar', async () => {
  fetchStats.mockResolvedValue(STATS);
  setup();
  const top = await screen.findByRole('list', { name: /most read/i });
  const items = within(top).getAllByRole('listitem');
  expect(items[0]).toHaveTextContent('Alpha Article');
  expect(items[0]).toHaveTextContent('1,000');
  expect(items[1]).toHaveTextContent('Beta Article');
  expect(items[0].querySelector('[data-bar]')).toHaveStyle({ width: '100%' });
  expect(items[1].querySelector('[data-bar]')).toHaveStyle({ width: '50%' });
});

test('explains that view counts are approximate', async () => {
  fetchStats.mockResolvedValue(STATS);
  setup();
  expect(await screen.findByText(/approximate/i)).toBeInTheDocument();
});

test('says so when no article has been read yet', async () => {
  fetchStats.mockResolvedValue({ stats: { ...STATS.stats, topPosts: [], totalViews: 0, views30d: 0 } });
  setup();
  expect(await screen.findByText(/no views recorded yet/i)).toBeInTheDocument();
});

test('shows an error with a retry that loads again', async () => {
  fetchStats.mockRejectedValueOnce(new Error('Boom')).mockResolvedValueOnce(STATS);
  setup();
  expect(await screen.findByRole('alert')).toHaveTextContent('Boom');
  userEvent.click(screen.getByRole('button', { name: /try again/i }));
  expect(await screen.findByRole('list', { name: /summary/i })).toBeInTheDocument();
});

test('an expired session is handed to the admin shell', async () => {
  const { UnauthorizedError } = require('../api');
  fetchStats.mockRejectedValue(new UnauthorizedError('expired'));
  const { onUnauthorized } = setup();
  await waitFor(() => expect(onUnauthorized).toHaveBeenCalled());
});

const WITH_EXTRAS = {
  stats: {
    ...STATS.stats,
    newSubscribers30d: 4,
    daily: [
      { day: '2026-06-09', views: 0 },
      { day: '2026-06-10', views: 8 },
    ],
    attention: [
      { id: 7, title: 'Half-written draft', published: false, published_at: null, updated_at: '2026-06-01T00:00:00Z' },
      { id: 8, title: 'Timed post', published: true, published_at: '2027-01-05T00:00:00Z', updated_at: '2026-06-01T00:00:00Z' },
    ],
  },
};

test('draws the daily reads chart with an accessible summary', async () => {
  fetchStats.mockResolvedValue(WITH_EXTRAS);
  setup();
  const chart = await screen.findByRole('img', { name: /daily reads.*8 reads/i });
  expect(chart.querySelectorAll('[data-day-bar]')).toHaveLength(2);
});

test('shows new subscribers on the subscribers tile', async () => {
  fetchStats.mockResolvedValue(WITH_EXTRAS);
  setup();
  expect(await screen.findByText('+4 in 30 days')).toBeInTheDocument();
});

test('lists drafts and scheduled articles and opens one for editing', async () => {
  fetchStats.mockResolvedValue(WITH_EXTRAS);
  const onEditPost = jest.fn();
  setup({ onEditPost });
  const list = await screen.findByRole('list', { name: /drafts and scheduled/i });
  expect(within(list).getByText(/draft · edited/i)).toBeInTheDocument();
  expect(within(list).getByText(/goes live/i)).toBeInTheDocument();
  userEvent.click(within(list).getByRole('button', { name: /open half-written draft/i }));
  expect(onEditPost).toHaveBeenCalledWith(7);
});

test('says so when nothing needs attention', async () => {
  fetchStats.mockResolvedValue({ stats: { ...STATS.stats, attention: [] } });
  setup();
  expect(await screen.findByText(/every article is published/i)).toBeInTheDocument();
});
