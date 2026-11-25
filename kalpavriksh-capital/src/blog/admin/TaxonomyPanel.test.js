import React from 'react';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TaxonomyPanel from './TaxonomyPanel';
import { addTaxonomyTerm, changeTaxonomy, fetchTaxonomy } from '../api';

jest.mock('../api', () => ({
  fetchTaxonomy: jest.fn(),
  changeTaxonomy: jest.fn(),
  addTaxonomyTerm: jest.fn(),
  UnauthorizedError: class UnauthorizedError extends Error {},
}));

const DATA = { categories: [{ name: 'Tax', count: 2 }, { name: 'Investing', count: 1 }], tags: [{ name: 'sip', count: 3 }] };
const setup = () => {
  const props = { token: 't', onUnauthorized: jest.fn(), notify: jest.fn() };
  render(<TaxonomyPanel {...props} />);
  return props;
};

beforeEach(() => {
  fetchTaxonomy.mockReset().mockResolvedValue(DATA);
  changeTaxonomy.mockReset().mockResolvedValue({ affected: 2 });
  addTaxonomyTerm.mockReset().mockResolvedValue({ created: true });
});

test('adding a new category calls the API, reports it, reloads and clears the box', async () => {
  const props = { token: 't', onUnauthorized: jest.fn(), notify: jest.fn(), onChanged: jest.fn() };
  render(<TaxonomyPanel {...props} />);
  await screen.findByText('Tax');
  userEvent.type(screen.getByLabelText(/new category name/i), 'Estate Planning');
  userEvent.click(screen.getByRole('button', { name: /add category/i }));

  await waitFor(() => expect(addTaxonomyTerm).toHaveBeenCalledWith('t', 'category', 'Estate Planning'));
  await waitFor(() => expect(props.notify).toHaveBeenCalledWith('“Estate Planning” added', 'success'));
  expect(props.onChanged).toHaveBeenCalled();
  expect(fetchTaxonomy).toHaveBeenCalledTimes(2);
  expect(screen.getByLabelText(/new category name/i)).toHaveValue('');
});

test('adding a tag that already exists says so and keeps the text', async () => {
  addTaxonomyTerm.mockResolvedValue({ created: false });
  const props = { token: 't', onUnauthorized: jest.fn(), notify: jest.fn() };
  render(<TaxonomyPanel {...props} />);
  await screen.findByText('sip');
  userEvent.type(screen.getByLabelText(/new tag name/i), 'SIP');
  userEvent.click(screen.getByRole('button', { name: /add tag/i }));

  await waitFor(() => expect(props.notify).toHaveBeenCalledWith('“SIP” is already in the list', 'error'));
  expect(screen.getByLabelText(/new tag name/i)).toHaveValue('SIP');
});

test('the add button is disabled until a name is typed', async () => {
  setup();
  await screen.findByText('Tax');
  expect(screen.getByRole('button', { name: /add category/i })).toBeDisabled();
});

test('lists categories and tags with how many articles use each', async () => {
  setup();
  const categories = await screen.findByRole('list', { name: /categories/i });
  expect(within(categories).getByText('Tax')).toBeInTheDocument();
  expect(within(categories).getByText('2 articles')).toBeInTheDocument();
  expect(within(screen.getByRole('list', { name: /tags/i })).getByText('3 articles')).toBeInTheDocument();
});

test('renaming a category calls the API, reports it and reloads', async () => {
  const { notify } = setup();
  await screen.findByText('Tax');
  userEvent.click(screen.getByRole('button', { name: /rename tax/i }));
  const input = screen.getByLabelText(/new name for tax/i);
  userEvent.clear(input);
  userEvent.type(input, 'Taxes');
  userEvent.click(screen.getByRole('button', { name: /^save$/i }));
  await waitFor(() => expect(changeTaxonomy).toHaveBeenCalledWith('t', 'category', 'Tax', 'Taxes'));
  await waitFor(() => expect(notify).toHaveBeenCalledWith(expect.stringMatching(/2 articles updated/i)));
  expect(fetchTaxonomy).toHaveBeenCalledTimes(2);
});

test('removing a tag asks for confirmation first', async () => {
  setup();
  await screen.findByText('sip');
  userEvent.click(screen.getByRole('button', { name: /remove sip/i }));
  expect(changeTaxonomy).not.toHaveBeenCalled();
  userEvent.click(within(screen.getByRole('alertdialog')).getByRole('button', { name: /^remove$/i }));
  await waitFor(() => expect(changeTaxonomy).toHaveBeenCalledWith('t', 'tag', 'sip', ''));
});

test('shows the server message when a change fails', async () => {
  changeTaxonomy.mockRejectedValue(new Error('Names can be at most 30 characters'));
  const { notify } = setup();
  await screen.findByText('Tax');
  userEvent.click(screen.getByRole('button', { name: /rename tax/i }));
  userEvent.type(screen.getByLabelText(/new name for tax/i), 'x');
  userEvent.click(screen.getByRole('button', { name: /^save$/i }));
  await waitFor(() => expect(notify).toHaveBeenCalledWith('Names can be at most 30 characters', 'error'));
});

test('tells the parent when a change was saved so its article list can reload', async () => {
  const onChanged = jest.fn();
  render(<TaxonomyPanel token="t" onUnauthorized={jest.fn()} notify={jest.fn()} onChanged={onChanged} />);
  await screen.findByText('Tax');
  userEvent.click(screen.getByRole('button', { name: /rename tax/i }));
  const input = screen.getByLabelText(/new name for tax/i);
  userEvent.clear(input);
  userEvent.type(input, 'Taxes');
  userEvent.click(screen.getByRole('button', { name: /^save$/i }));
  await waitFor(() => expect(onChanged).toHaveBeenCalledTimes(1));
});
