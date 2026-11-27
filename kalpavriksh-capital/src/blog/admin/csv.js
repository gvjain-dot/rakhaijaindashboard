// Minimal CSV writer for exporting subscribers.

const FORMULA_START = /^[=+\-@\t\r]/;
const NEEDS_QUOTES = /[",\n\r]/;

/**
 * One CSV cell. A value beginning with = + - @ would be run as a formula by Excel/Sheets, so it gets a
 * leading apostrophe (visitors choose these values, so they must be treated as untrusted).
 */
function cell(value) {
  let text = value === null || value === undefined ? '' : String(value);
  if (FORMULA_START.test(text)) text = `'${text}`;
  return NEEDS_QUOTES.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

/** columns: [{ key, label }], rows: objects → CSV text with CRLF line endings. */
export function toCsv(columns, rows) {
  const header = columns.map((column) => cell(column.label)).join(',');
  const lines = rows.map((row) => columns.map((column) => cell(row[column.key])).join(','));
  return [header, ...lines].join('\r\n');
}
