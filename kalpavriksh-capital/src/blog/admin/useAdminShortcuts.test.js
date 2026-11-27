import React from 'react';
import { fireEvent, render } from '@testing-library/react';
import useAdminShortcuts from './useAdminShortcuts';

function Harness({ handlers, enabled = true }) {
  useAdminShortcuts({ ...handlers, enabled });
  return (
    <div>
      <input aria-label="field" />
      <textarea aria-label="area" />
    </div>
  );
}

const handlers = () => ({ onNew: jest.fn(), onSearch: jest.fn() });

test('N starts a new article and / jumps to search', () => {
  const h = handlers();
  render(<Harness handlers={h} />);
  fireEvent.keyDown(document.body, { key: 'n' });
  fireEvent.keyDown(document.body, { key: '/' });
  expect(h.onNew).toHaveBeenCalledTimes(1);
  expect(h.onSearch).toHaveBeenCalledTimes(1);
});

test('does nothing while typing in a field', () => {
  const h = handlers();
  const { getByLabelText } = render(<Harness handlers={h} />);
  fireEvent.keyDown(getByLabelText('field'), { key: 'n' });
  fireEvent.keyDown(getByLabelText('area'), { key: '/' });
  expect(h.onNew).not.toHaveBeenCalled();
  expect(h.onSearch).not.toHaveBeenCalled();
});

test('ignores keys pressed with a modifier, so browser shortcuts still work', () => {
  const h = handlers();
  render(<Harness handlers={h} />);
  fireEvent.keyDown(document.body, { key: 'n', ctrlKey: true });
  fireEvent.keyDown(document.body, { key: 'n', metaKey: true });
  fireEvent.keyDown(document.body, { key: 'n', altKey: true });
  expect(h.onNew).not.toHaveBeenCalled();
});

test('is inactive while disabled (for example inside the editor)', () => {
  const h = handlers();
  render(<Harness handlers={h} enabled={false} />);
  fireEvent.keyDown(document.body, { key: 'n' });
  expect(h.onNew).not.toHaveBeenCalled();
});

test('is inactive while a dialog is open', () => {
  const h = handlers();
  render(<><div role="alertdialog" /><Harness handlers={h} /></>);
  fireEvent.keyDown(document.body, { key: 'n' });
  expect(h.onNew).not.toHaveBeenCalled();
});
