const dateFormatter = new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

export function formatDate(value) {
  if (!value) return '';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '' : dateFormatter.format(date);
}

const monthFormatter = new Intl.DateTimeFormat('en-US', { month: 'long', timeZone: 'UTC' });

/** "March" for month 3. Used by the archive; months come from the API as 1-12. */
export function monthName(month) {
  return monthFormatter.format(new Date(Date.UTC(2000, Number(month) - 1, 1)));
}

/** "2026-03", the value the list API's `month` filter expects. */
export function monthKey(year, month) {
  return `${year}-${String(month).padStart(2, '0')}`;
}

export function readingTimeLabel(minutes) {
  return `${Math.max(1, Number(minutes) || 1)} min read`;
}

export function slugify(text) {
  return String(text || '')
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 100);
}
