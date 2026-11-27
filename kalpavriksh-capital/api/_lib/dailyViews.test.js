const test = require('node:test');
const assert = require('node:assert/strict');
const { fillDailyViews } = require('./dailyViews');

test('fills missing days with zero, oldest first, ending today', () => {
  const series = fillDailyViews([{ day: '2026-06-10', views: 4 }, { day: '2026-06-08', views: '2' }], '2026-06-10', 5);
  assert.deepEqual(series, [
    { day: '2026-06-06', views: 0 },
    { day: '2026-06-07', views: 0 },
    { day: '2026-06-08', views: 2 },
    { day: '2026-06-09', views: 0 },
    { day: '2026-06-10', views: 4 },
  ]);
});

test('ignores rows outside the window and handles no rows', () => {
  assert.equal(fillDailyViews([{ day: '2020-01-01', views: 9 }], '2026-06-10', 3).every((point) => point.views === 0), true);
  assert.equal(fillDailyViews([], '2026-06-10').length, 30);
});

test('accepts Date-like day strings from the driver', () => {
  const [point] = fillDailyViews([{ day: '2026-06-10T00:00:00.000Z', views: 7 }], '2026-06-10', 1);
  assert.equal(point.views, 7);
});
