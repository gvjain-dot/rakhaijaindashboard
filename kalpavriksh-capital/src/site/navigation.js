import routes from './routes.json';

export const NAV_PAGES = ['home', 'about', 'services', 'workshops', 'testimonials', 'blogs', 'faqs', 'contact'];

export const SERVICE_PAGES = routes.pages.filter((page) => page.service).map((page) => page.key);

// The blog keeps its own routes, so it is not listed in routes.json.
const BLOG_PAGE = { key: 'blogs', path: '/blogs', label: 'Journal' };

const PAGES_BY_KEY = new Map([...routes.pages, BLOG_PAGE].map((page) => [page.key, page]));

export const pageByKey = (key) => PAGES_BY_KEY.get(key) || null;

export const pageLabel = (key) => pageByKey(key)?.label || '';

export const pageHref = (key) => pageByKey(key)?.path || '/';

/** The new URL for an old `/?page=<key>` link, or null when there is nothing to redirect to. */
export const legacyPath = (search) => {
  const key = new URLSearchParams(search).get('page');
  const page = key ? pageByKey(key) : null;
  return page && page.path !== '/' ? page.path : null;
};

/** Link props: a real href for crawlers and new tabs, in-app navigation for a plain click. */
export const pageLinkProps = (page, onNavigate) => ({
  href: pageHref(page),
  onClick: (event) => {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) return;
    event.preventDefault();
    onNavigate(page);
  },
});
