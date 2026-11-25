import React, { useState } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CategorySelect from './CategorySelect';

const CATEGORIES = ['Estate Planning', 'Tax'];

function Harness({ initial = '', onChange }) {
  const [value, setValue] = useState(initial);
  return <CategorySelect value={value} categories={CATEGORIES} onChange={(next) => { setValue(next); onChange(next); }} />;
}

test('lists every saved category plus the new-category choice', () => {
  render(<Harness onChange={jest.fn()} />);
  const names = screen.getAllByRole('option').map((option) => option.textContent);
  expect(names).toEqual(['No category', 'Estate Planning', 'Tax', '+ New category…']);
});

test('picking a saved category selects it', () => {
  const onChange = jest.fn();
  render(<Harness onChange={onChange} />);
  userEvent.selectOptions(screen.getByRole('combobox'), 'Tax');
  expect(onChange).toHaveBeenCalledWith('Tax');
});

test('a category on the article that is not in the saved list stays selectable', () => {
  render(<Harness initial="Legacy" onChange={jest.fn()} />);
  expect(screen.getByRole('combobox')).toHaveValue('Legacy');
});

test('choosing + New category lets you type a name and use it', () => {
  const onChange = jest.fn();
  render(<Harness onChange={onChange} />);
  userEvent.selectOptions(screen.getByRole('combobox'), '+ New category…');
  userEvent.type(screen.getByLabelText(/new category name/i), '  Succession   Plans ');
  userEvent.click(screen.getByRole('button', { name: /^use$/i }));
  expect(onChange).toHaveBeenCalledWith('Succession Plans');
  expect(screen.getByRole('combobox')).toHaveValue('Succession Plans');
});

test('a new name matching a saved one (ignoring case) reuses the saved spelling', () => {
  const onChange = jest.fn();
  render(<Harness onChange={onChange} />);
  userEvent.selectOptions(screen.getByRole('combobox'), '+ New category…');
  userEvent.type(screen.getByLabelText(/new category name/i), 'tax{enter}');
  expect(onChange).toHaveBeenCalledWith('Tax');
});

test('cancelling the new-category box changes nothing', () => {
  const onChange = jest.fn();
  render(<Harness onChange={onChange} />);
  userEvent.selectOptions(screen.getByRole('combobox'), '+ New category…');
  userEvent.click(screen.getByRole('button', { name: /cancel/i }));
  expect(onChange).not.toHaveBeenCalled();
  expect(screen.getByRole('combobox')).toHaveValue('');
});
