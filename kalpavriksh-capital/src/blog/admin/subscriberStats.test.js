import { weeklyCounts } from './subscriberStats';

const NOW = new Date('2026-06-17T12:00:00Z'); // a Wednesday

test('buckets signups into the last N weeks, oldest first, ending with the current week', () => {
  const rows = [
    { created_at: '2026-06-17T01:00:00Z' }, // this week (Mon 15 Jun)
    { created_at: '2026-06-15T00:00:00Z' }, // this week
    { created_at: '2026-06-10T00:00:00Z' }, // last week
    { created_at: '2026-05-01T00:00:00Z' }, // before the window
  ];
  const weeks = weeklyCounts(rows, NOW, 3);
  expect(weeks.map((week) => week.count)).toEqual([0, 1, 2]);
  expect(weeks[2].start).toBe('2026-06-15');
  expect(weeks[0].start).toBe('2026-06-01');
});

test('copes with no rows and ignores unreadable dates', () => {
  expect(weeklyCounts([], NOW, 2).map((week) => week.count)).toEqual([0, 0]);
  expect(weeklyCounts([{ created_at: 'nope' }, {}], NOW, 2).map((week) => week.count)).toEqual([0, 0]);
});
