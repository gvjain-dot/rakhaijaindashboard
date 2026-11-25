import React, { useState } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TagInput from './TagInput';

const SAVED = ['estate planning', 'nri', 'swp'];

function Harness({ initial = [], onChange = () => {} }) {
  const [tags, setTags] = useState(initial);
  return <TagInput value={tags} suggestions={SAVED} onChange={(next) => { setTags(next); onChange(next); }} />;
}

const optionNames = () => screen.queryAllByRole('option').map((option) => option.textContent);

test('focusing the box shows every saved tag', () => {
  render(<Harness />);
  userEvent.click(screen.getByRole('combobox'));
  expect(optionNames()).toEqual(['estate planning', 'nri', 'swp']);
});

test('clicking a saved tag adds it and removes it from the list', () => {
  const onChange = jest.fn();
  render(<Harness onChange={onChange} />);
  userEvent.click(screen.getByRole('combobox'));
  userEvent.click(screen.getByRole('option', { name: 'nri' }));
  expect(onChange).toHaveBeenLastCalledWith(['nri']);
  expect(optionNames()).toEqual(['estate planning', 'swp']);
});

test('typing filters the saved tags', () => {
  render(<Harness />);
  userEvent.type(screen.getByRole('combobox'), 'es');
  expect(optionNames()).toEqual(['Create “es”', 'estate planning']);
});

test('typing a new name offers to create it, and Enter adds it', () => {
  const onChange = jest.fn();
  render(<Harness onChange={onChange} />);
  userEvent.type(screen.getByRole('combobox'), 'Succession{enter}');
  expect(onChange).toHaveBeenLastCalledWith(['succession']);
});

test('no create row when the typed name is already a saved tag', () => {
  render(<Harness />);
  userEvent.type(screen.getByRole('combobox'), 'SWP');
  expect(optionNames()).toEqual(['swp']);
});

test('arrow keys choose a saved tag and Enter adds it', () => {
  const onChange = jest.fn();
  render(<Harness onChange={onChange} />);
  userEvent.click(screen.getByRole('combobox'));
  userEvent.keyboard('{arrowdown}{arrowdown}{enter}');
  expect(onChange).toHaveBeenLastCalledWith(['nri']);
});

test('Escape closes the list', () => {
  render(<Harness />);
  userEvent.click(screen.getByRole('combobox'));
  userEvent.keyboard('{esc}');
  expect(screen.queryByRole('listbox')).toBeNull();
});

test('the list is hidden once ten tags are chosen', () => {
  const ten = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j'];
  render(<Harness initial={ten} />);
  expect(screen.getByRole('combobox')).toBeDisabled();
  expect(screen.queryByRole('listbox')).toBeNull();
});
