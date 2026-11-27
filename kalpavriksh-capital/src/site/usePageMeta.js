import { useEffect } from 'react';
import routes from './routes.json';
import { pageByKey } from './navigation';

const ROBOTS_INDEX = 'index, follow, max-image-preview:large';
const ROBOTS_NOINDEX = 'noindex, follow';

/** Finds a head tag, creating it when the page does not have one yet. */
function headElement(tag, attribute, value) {
  const found = document.head.querySelector(`${tag}[${attribute}="${value}"]`);
  if (found) return found;
  const element = document.createElement(tag);
  element.setAttribute(attribute, value);
  document.head.appendChild(element);
  return element;
}

function applyMeta({ title, description, path, noindex }) {
  const url = `${routes.siteUrl}${path}`;
  document.title = title;
  [
    ['name', 'description', description],
    ['name', 'robots', noindex ? ROBOTS_NOINDEX : ROBOTS_INDEX],
    ['property', 'og:title', title],
    ['property', 'og:description', description],
    ['property', 'og:url', url],
    ['name', 'twitter:title', title],
    ['name', 'twitter:description', description],
    ['name', 'twitter:url', url],
  ].forEach(([attribute, key, content]) => headElement('meta', attribute, key).setAttribute('content', content));
  headElement('link', 'rel', 'canonical').setAttribute('href', url);
}

/**
 * Keeps the title, description, canonical and share tags in step with the page on screen.
 * Leaving the page restores the home values, which is what public/index.html ships with.
 * Search engines get the same tags from the HTML written by scripts/prerender.js.
 */
export default function usePageMeta({ title, description, path, noindex = false }) {
  useEffect(() => {
    applyMeta({ title, description, path, noindex });
    return () => applyMeta(pageByKey('home'));
  }, [title, description, path, noindex]);
}
