import { toDateTimeLocal, fromDateTimeLocal, isFuture } from './dateInput';

test('round-trips a timestamp through the datetime-local format (minute precision)', () => {
  const iso = '2026-12-01T09:30:00.000Z';
  expect(fromDateTimeLocal(toDateTimeLocal(iso))).toBe(iso);
});

test('formats as YYYY-MM-DDTHH:mm in local time', () => {
  expect(toDateTimeLocal('2026-12-01T09:30:00.000Z')).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/);
});

test('empty and invalid values convert to an empty string', () => {
  expect(toDateTimeLocal('')).toBe('');
  expect(toDateTimeLocal(null)).toBe('');
  expect(toDateTimeLocal('nonsense')).toBe('');
  expect(fromDateTimeLocal('')).toBe('');
  expect(fromDateTimeLocal('nonsense')).toBe('');
});

test('isFuture compares against the supplied clock', () => {
  const now = Date.parse('2026-06-01T00:00:00Z');
  expect(isFuture('2026-06-02T00:00:00Z', now)).toBe(true);
  expect(isFuture('2026-05-31T00:00:00Z', now)).toBe(false);
  expect(isFuture('', now)).toBe(false);
  expect(isFuture(null, now)).toBe(false);
  expect(isFuture('nonsense', now)).toBe(false);
});
