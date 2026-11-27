// Tag helpers for the editor. They mirror the server's rules (api/_lib/validate.js): lowercase, single
// spaces, no duplicates, at most MAX_TAGS tags of MAX_TAG_LENGTH characters. Both return new arrays.

export const MAX_TAGS = 10;
export const MAX_TAG_LENGTH = 30;

export function normalizeTag(raw) {
  return String(raw).trim().replace(/\s+/g, ' ').toLowerCase().slice(0, MAX_TAG_LENGTH);
}

/** Adds the comma- or newline-separated tags in `raw` to `current`, skipping blanks and duplicates. */
export function addTags(current, raw) {
  const incoming = String(raw).split(/[,\n]/).map(normalizeTag).filter(Boolean);
  return incoming.reduce(
    (tags, tag) => (tags.length < MAX_TAGS && !tags.includes(tag) ? [...tags, tag] : tags),
    [...current]
  );
}

export function removeTag(current, tag) {
  return current.filter((item) => item !== tag);
}
