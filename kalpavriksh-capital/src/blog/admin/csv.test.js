import { toCsv } from './csv';

const columns = [
  { key: 'email', label: 'Email' },
  { key: 'source', label: 'Source' },
];

test('writes a header row then one row per record', () => {
  const csv = toCsv(columns, [{ email: 'a@example.com', source: 'post-one' }]);
  expect(csv).toBe('Email,Source\r\na@example.com,post-one');
});

test('quotes values containing commas, quotes or newlines', () => {
  const csv = toCsv(columns, [{ email: 'a@example.com', source: 'He said "hi", twice\nok' }]);
  expect(csv).toBe('Email,Source\r\na@example.com,"He said ""hi"", twice\nok"');
});

test('empty, null and missing values become empty cells', () => {
  expect(toCsv(columns, [{ email: 'a@example.com', source: null }, { email: 'b@example.com' }])).toBe(
    'Email,Source\r\na@example.com,\r\nb@example.com,'
  );
});

test('neutralises spreadsheet formulas so a hostile value cannot run when the file is opened', () => {
  const csv = toCsv(columns, [{ email: '=HYPERLINK("http://evil.example")', source: '+1+1' }]);
  const dataRow = csv.split('\r\n')[1];
  expect(dataRow.startsWith("\"'=HYPERLINK")).toBe(true);
  expect(dataRow.endsWith(",'+1+1")).toBe(true);
});

test('returns just the header for no rows', () => {
  expect(toCsv(columns, [])).toBe('Email,Source');
});
