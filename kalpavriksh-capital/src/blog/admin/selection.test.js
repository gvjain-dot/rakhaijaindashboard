import { toggleId, allSelected, pruneSelection } from './selection';

test('toggleId adds an id that is missing and removes one that is present, without mutating', () => {
  const selected = [1, 2];
  expect(toggleId(selected, 3)).toEqual([1, 2, 3]);
  expect(toggleId(selected, 2)).toEqual([1]);
  expect(selected).toEqual([1, 2]);
});

test('allSelected is true only when every visible id is selected (and there is at least one)', () => {
  expect(allSelected([1, 2, 3], [1, 2])).toBe(true);
  expect(allSelected([1], [1, 2])).toBe(false);
  expect(allSelected([], [])).toBe(false);
});

test('pruneSelection drops ids that are no longer in the list (deleted, filtered out)', () => {
  expect(pruneSelection([1, 2, 3], [2, 3, 4])).toEqual([2, 3]);
  expect(pruneSelection([], [1])).toEqual([]);
});
