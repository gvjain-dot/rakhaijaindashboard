const DAY_MS = 86400000;

/**
 * Turns the sparse per-day counts from the database into a continuous series, oldest first, with 0 for days
 * nobody read anything. `today` is a YYYY-MM-DD string (UTC) so the result does not depend on the server clock.
 */
function fillDailyViews(rows, today, days = 30) {
  const byDay = new Map(rows.map((row) => [String(row.day).slice(0, 10), Number(row.views) || 0]));
  const end = Date.parse(`${today}T00:00:00Z`);
  return Array.from({ length: days }, (_, index) => {
    const day = new Date(end - (days - 1 - index) * DAY_MS).toISOString().slice(0, 10);
    return { day, views: byDay.get(day) || 0 };
  });
}

module.exports = { fillDailyViews };
