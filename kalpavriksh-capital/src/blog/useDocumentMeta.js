import { useEffect } from 'react';

const META_SELECTORS = {
  description: 'meta[name="description"]',
  'og:title': 'meta[property="og:title"]',
  'og:description': 'meta[property="og:description"]',
  'og:image': 'meta[property="og:image"]',
  'twitter:title': 'meta[name="twitter:title"]',
  'twitter:description': 'meta[name="twitter:description"]',
  'twitter:image': 'meta[name="twitter:image"]',
};

function applyMeta(values) {
  const previous = [];
  Object.entries(values).forEach(([key, value]) => {
    if (!value) return;
    document.querySelectorAll(META_SELECTORS[key]).forEach((element) => {
      previous.push([element, element.getAttribute('content')]);
      element.setAttribute('content', value);
    });
  });
  return previous;
}

/**
 * Updates the tab title and description/share tags while a page is mounted, then restores them.
 * Crawlers and link previews get these tags from api/post-page.js; this keeps the tab in sync for visitors.
 */
export default function useDocumentMeta({ title, description, image }) {
  useEffect(() => {
    const previousTitle = document.title;
    if (title) document.title = title;
    const previous = applyMeta({
      description,
      'og:title': title,
      'og:description': description,
      'og:image': image,
      'twitter:title': title,
      'twitter:description': description,
      'twitter:image': image,
    });
    return () => {
      document.title = previousTitle;
      previous.forEach(([element, content]) => element.setAttribute('content', content || ''));
    };
  }, [title, description, image]);
}
