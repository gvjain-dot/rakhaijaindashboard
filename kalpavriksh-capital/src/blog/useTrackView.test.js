import React from 'react';
import { render, act } from '@testing-library/react';
import useTrackView, { VIEW_DELAY_MS } from './useTrackView';
import { trackView } from './api';

jest.mock('./api', () => ({ trackView: jest.fn() }));

function Probe({ slug, enabled }) {
  useTrackView(slug, enabled);
  return null;
}

const setVisibility = (state) =>
  Object.defineProperty(document, 'visibilityState', { configurable: true, get: () => state });

beforeEach(() => {
  jest.useFakeTimers();
  trackView.mockReset();
  setVisibility('visible');
});
afterEach(() => {
  jest.useRealTimers();
  setVisibility('visible');
});

test('counts a read once, after the delay', () => {
  render(<Probe slug="asset-allocation-101" enabled />);
  act(() => jest.advanceTimersByTime(VIEW_DELAY_MS - 1));
  expect(trackView).not.toHaveBeenCalled();
  act(() => jest.advanceTimersByTime(1));
  expect(trackView).toHaveBeenCalledTimes(1);
  expect(trackView).toHaveBeenCalledWith('asset-allocation-101');
  act(() => jest.advanceTimersByTime(VIEW_DELAY_MS * 5));
  expect(trackView).toHaveBeenCalledTimes(1);
});

test('does not count a visitor who leaves before the delay', () => {
  const { unmount } = render(<Probe slug="a" enabled />);
  act(() => jest.advanceTimersByTime(VIEW_DELAY_MS - 1));
  unmount();
  act(() => jest.advanceTimersByTime(VIEW_DELAY_MS * 2));
  expect(trackView).not.toHaveBeenCalled();
});

test('does nothing while disabled (loading, previews, missing articles)', () => {
  render(<Probe slug="a" enabled={false} />);
  act(() => jest.advanceTimersByTime(VIEW_DELAY_MS * 2));
  expect(trackView).not.toHaveBeenCalled();
});

test('does not count a tab the reader is not looking at', () => {
  setVisibility('hidden');
  render(<Probe slug="a" enabled />);
  act(() => jest.advanceTimersByTime(VIEW_DELAY_MS * 2));
  expect(trackView).not.toHaveBeenCalled();
});

test('moving to another article counts that one separately', () => {
  const { rerender } = render(<Probe slug="first" enabled />);
  act(() => jest.advanceTimersByTime(VIEW_DELAY_MS));
  rerender(<Probe slug="second" enabled />);
  act(() => jest.advanceTimersByTime(VIEW_DELAY_MS));
  expect(trackView.mock.calls).toEqual([['first'], ['second']]);
});
