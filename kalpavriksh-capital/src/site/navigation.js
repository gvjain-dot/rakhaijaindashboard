export const NAV_PAGES = ['home', 'services', 'workshops', 'testimonials', 'blogs', 'contact'];

// Display names for page keys whose label differs from the key shown to visitors.
const LABEL_OVERRIDES = { blogs: 'Journal' };

// Pages with their own URL; every other page is opened on the home route via ?page=<key>.
const PAGE_PATHS = { home: '/', blogs: '/blogs', 'asset-allocation': '/asset-allocation' };

export const pageLabel = (page) => LABEL_OVERRIDES[page] || page.charAt(0).toUpperCase() + page.slice(1);

export const pageHref = (page) => PAGE_PATHS[page] || `/?page=${page}`;

/** Link props: a real href for crawlers and new tabs, in-app navigation for a plain click. */
export const pageLinkProps = (page, onNavigate) => ({
  href: pageHref(page),
  onClick: (event) => {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) return;
    event.preventDefault();
    onNavigate(page);
  },
});
