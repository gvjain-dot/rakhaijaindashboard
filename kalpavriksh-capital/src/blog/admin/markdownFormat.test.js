import { applyMarkdownFormat, countWords } from './markdownFormat';

test('bold wraps the selection and keeps it selected', () => {
  const result = applyMarkdownFormat('make this bold', 5, 9, 'bold');
  expect(result.value).toBe('make **this** bold');
  expect(result.value.slice(result.selectionStart, result.selectionEnd)).toBe('this');
});

test('bold with nothing selected inserts a selected placeholder', () => {
  const result = applyMarkdownFormat('', 0, 0, 'bold');
  expect(result.value).toBe('**bold text**');
  expect(result.value.slice(result.selectionStart, result.selectionEnd)).toBe('bold text');
});

test('h2 prefixes the current line and toggles off when applied again', () => {
  const once = applyMarkdownFormat('Intro\nSecond line', 8, 8, 'h2');
  expect(once.value).toBe('Intro\n## Second line');
  const twice = applyMarkdownFormat(once.value, once.selectionStart, once.selectionEnd, 'h2');
  expect(twice.value).toBe('Intro\nSecond line');
});

test('h3 replaces an existing heading prefix instead of stacking', () => {
  const result = applyMarkdownFormat('## Title', 0, 0, 'h3');
  expect(result.value).toBe('### Title');
});

test('bullet list prefixes every selected line', () => {
  const result = applyMarkdownFormat('one\ntwo\nthree', 0, 13, 'ul');
  expect(result.value).toBe('- one\n- two\n- three');
});

test('numbered list numbers the selected lines', () => {
  const result = applyMarkdownFormat('one\ntwo', 0, 7, 'ol');
  expect(result.value).toBe('1. one\n2. two');
});

test('quote prefixes the line', () => {
  expect(applyMarkdownFormat('wise words', 0, 0, 'quote').value).toBe('> wise words');
});

test('link wraps the selected text and selects the url placeholder', () => {
  const result = applyMarkdownFormat('see site now', 4, 8, 'link');
  expect(result.value).toBe('see [site](https://) now');
  expect(result.value.slice(result.selectionStart, result.selectionEnd)).toBe('https://');
});

test('does not mutate or throw on an unknown action', () => {
  const result = applyMarkdownFormat('text', 0, 4, 'nope');
  expect(result).toEqual({ value: 'text', selectionStart: 0, selectionEnd: 4 });
});

test('countWords ignores markdown punctuation and blank input', () => {
  expect(countWords('')).toBe(0);
  expect(countWords('## Hello   world\n\n- one two')).toBe(4);
});
