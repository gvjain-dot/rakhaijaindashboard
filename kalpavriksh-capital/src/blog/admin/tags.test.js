import { addTags, removeTag, normalizeTag, MAX_TAGS, MAX_TAG_LENGTH } from './tags';

test('normalizeTag trims, lowercases, collapses spaces and caps the length', () => {
  expect(normalizeTag('  Tax   Planning ')).toBe('tax planning');
  expect(normalizeTag('x'.repeat(50))).toHaveLength(MAX_TAG_LENGTH);
});

test('addTags splits on commas and newlines and drops blanks', () => {
  expect(addTags([], 'Risk, Tax ,, \nRetirement')).toEqual(['risk', 'tax', 'retirement']);
});

test('addTags skips duplicates, including ones already present', () => {
  expect(addTags(['risk'], 'Risk, risk, Tax')).toEqual(['risk', 'tax']);
});

test('addTags stops at the tag limit', () => {
  const current = Array.from({ length: MAX_TAGS - 1 }, (_, index) => `tag${index}`);
  expect(addTags(current, 'one, two, three')).toHaveLength(MAX_TAGS);
});

test('addTags and removeTag never mutate their input', () => {
  const current = Object.freeze(['risk']);
  expect(addTags(current, 'tax')).toEqual(['risk', 'tax']);
  expect(removeTag(current, 'risk')).toEqual([]);
  expect(current).toEqual(['risk']);
});
