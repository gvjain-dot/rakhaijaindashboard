import React from 'react';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SubscribersPanel from './SubscribersPanel';
import { deleteSubscribers, listSubscribers } from '../api';

jest.mock('../api', () => ({
  listSubscribers: jest.fn(),
  deleteSubscriber: jest.fn(),
  deleteSubscribers: jest.fn(),
  UnauthorizedError: class UnauthorizedError extends Error {},
}));

const ROWS = [
  { id: 1, email: 'a@example.com', source: 'home', created_at: '2026-06-10T00:00:00Z' },
  { id: 2, email: 'b@example.com', source: null, created_at: '2026-06-11T00:00:00Z' },
  { id: 3, email: 'c@sample.org', source: null, created_at: '2026-06-12T00:00:00Z' },
];

const setup = () => {
  const props = { token: 't', onUnauthorized: jest.fn(), notify: jest.fn() };
  render(<SubscribersPanel {...props} />);
  return props;
};

beforeEach(() => {
  listSubscribers.mockReset().mockResolvedValue({ subscribers: ROWS });
  deleteSubscribers.mockReset().mockResolvedValue({ deleted: 2 });
});

test('shows the weekly growth chart above the list', async () => {
  setup();
  expect(await screen.findByRole('img', { name: /new subscribers per week/i })).toBeInTheDocument();
});

test('selected subscribers can be removed together after confirming', async () => {
  const { notify } = setup();
  await screen.findByText('a@example.com');
  userEvent.click(screen.getByRole('checkbox', { name: /select a@example.com/i }));
  userEvent.click(screen.getByRole('checkbox', { name: /select b@example.com/i }));
  expect(screen.getByText('2 selected')).toBeInTheDocument();
  userEvent.click(screen.getByRole('button', { name: /remove selected/i }));
  expect(deleteSubscribers).not.toHaveBeenCalled();
  userEvent.click(within(screen.getByRole('alertdialog')).getByRole('button', { name: /^remove$/i }));
  await waitFor(() => expect(deleteSubscribers).toHaveBeenCalledWith('t', [1, 2]));
  await waitFor(() => expect(notify).toHaveBeenCalledWith('2 subscribers removed'));
  expect(listSubscribers).toHaveBeenCalledTimes(2);
});

test('searching drops hidden rows from the selection', async () => {
  setup();
  await screen.findByText('a@example.com');
  userEvent.click(screen.getByRole('checkbox', { name: /select a@example.com/i }));
  userEvent.type(screen.getByLabelText(/search subscribers/i), 'sample.org');
  await waitFor(() => expect(screen.queryByText(/selected/i)).not.toBeInTheDocument());
});
