// Conversions between ISO timestamps (what the API stores) and the value of an
// <input type="datetime-local"> (local time, minute precision, no time zone).

const pad = (value) => String(value).padStart(2, '0');

/** ISO timestamp → 'YYYY-MM-DDTHH:mm' in the viewer's local time, or '' when empty/invalid. */
export function toDateTimeLocal(iso) {
  if (!iso) return '';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

/** 'YYYY-MM-DDTHH:mm' (local time) → ISO timestamp, or '' when empty/invalid. */
export function fromDateTimeLocal(value) {
  if (!value) return '';
  const date = new Date(value); // a date-time without an offset is parsed as local time
  return Number.isNaN(date.getTime()) ? '' : date.toISOString();
}

/** True when the timestamp is later than `now` (used to label a post as scheduled). */
export function isFuture(iso, now = Date.now()) {
  if (!iso) return false;
  const time = new Date(iso).getTime();
  return Number.isFinite(time) && time > now;
}
