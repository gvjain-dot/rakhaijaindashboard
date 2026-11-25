const DAY_MS = 86400000;
const WEEK_DAYS = 7;

/** Monday (UTC) of the week containing `date`, as a timestamp. */
function weekStart(date) {
  const midnight = Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
  const sinceMonday = (date.getUTCDay() + 6) % WEEK_DAYS;
  return midnight - sinceMonday * DAY_MS;
}

/** New signups per week for the last `weeks` weeks (Monday-based, UTC), oldest first: [{ start: 'YYYY-MM-DD', count }]. */
export function weeklyCounts(rows, now = new Date(), weeks = 8) {
  const thisWeek = weekStart(now);
  const buckets = Array.from({ length: weeks }, (_, index) => ({
    start: new Date(thisWeek - (weeks - 1 - index) * WEEK_DAYS * DAY_MS).toISOString().slice(0, 10),
    count: 0,
  }));
  const first = Date.parse(`${buckets[0].start}T00:00:00Z`);
  rows.forEach((row) => {
    const time = Date.parse(row.created_at);
    if (Number.isNaN(time) || time < first) return;
    const index = Math.floor((weekStart(new Date(time)) - first) / (WEEK_DAYS * DAY_MS));
    if (index >= 0 && index < weeks) buckets[index].count += 1;
  });
  return buckets;
}
