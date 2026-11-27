import routes from './routes.json';
import { NAV_PAGES, SERVICE_PAGES, legacyPath, pageHref, pageLabel } from './navigation';

const PDF_PATHS = [
  '/', '/about-us', '/services', '/goal-based-financial-planning', '/investment-solutions',
  '/insurance-planning', '/income-tax-planning', '/estate-planning', '/financial-learning-academy',
  '/faqs', '/contact-us',
];
const EXTRA_PATHS = ['/workshops', '/testimonials', '/book-summaries', '/disclosures'];

test('defines every page from the SEO recommendation and the existing sections', () => {
  const paths = routes.pages.map((page) => page.path);
  expect(paths.sort()).toEqual([...PDF_PATHS, ...EXTRA_PATHS].sort());
});

test('gives every page a unique key, path, title and description', () => {
  ['key', 'path', 'title', 'description'].forEach((field) => {
    const values = routes.pages.map((page) => page[field]);
    values.forEach((value) => expect(value).toBeTruthy());
    expect(new Set(values).size).toBe(values.length);
  });
});

// The supplied tags, with the advisory terms reworded.
const APPROVED_TAGS = [
  ['/', 'Financial Planning & Wealth Management | Kalp Vriksh Global', 'Kalp Vriksh Global offers financial planning, wealth management and investment planning solutions to help individuals and families build and secure their wealth.'],
  ['/about-us', 'About Kalp Vriksh Global | Wealth Management', 'Learn about Kalp Vriksh Global, our approach to wealth management, financial planning and helping individuals and families make informed financial decisions.'],
  ['/contact-us', 'Contact Kalp Vriksh Global | Financial Planning', 'Connect with Kalp Vriksh Global for personalised financial planning, investment planning and wealth management guidance. Get in touch with our team.'],
  ['/services', 'Wealth Management & Financial Planning Services | Kalp Vriksh', 'Explore wealth management, investment planning, financial planning, insurance, tax and estate planning services designed to help you manage and grow your wealth.'],
  ['/goal-based-financial-planning', 'Goal-Based Financial Planning & Wealth Management | Kalpvriksh', 'Plan for your financial goals with personalised wealth management and financial planning strategies. Build a roadmap for major life milestones, retirement and long-term wealth creation.'],
  ['/investment-solutions', 'Investment Planning & Wealth Management Solutions | Kalpvriksh', 'Explore personalised investment solutions and expert investment planning services to build, manage and diversify your portfolio while aligning investments with your financial goals.'],
  ['/insurance-planning', 'Insurance Planning & Wealth Protection Services | Kalpvriksh', 'Protect your family and financial future with strategic insurance planning. Explore personalised protection solutions to manage financial risks and safeguard your wealth.'],
  ['/income-tax-planning', 'Income Tax Planning & Tax Management Services | Kalpvriksh', 'Discover effective income tax planning and tax-saving strategies to manage your tax liabilities. Align tax planning with your financial goals and long-term wealth management strategy.'],
  ['/estate-planning', 'Estate & Succession Planning for Family Wealth | Kalpvriksh', 'Preserve and transfer your wealth with strategic estate and succession planning. Explore family wealth management, wealth structuring and intergenerational wealth planning.'],
  ['/financial-learning-academy', 'Financial Learning Academy | Wealth & Investment Education', 'Enhance your financial knowledge with insights on wealth management, investment planning, financial literacy and personal finance to make informed financial decisions.'],
];

test.each(APPROVED_TAGS)('uses the approved title and description for %s', (path, title, description) => {
  const page = routes.pages.find((item) => item.path === path);
  expect(page.title).toBe(title);
  expect(page.description).toBe(description);
});

test('keeps descriptions within the longest approved length', () => {
  routes.pages.forEach((page) => expect(page.description.length).toBeLessThanOrEqual(190));
});

test('keeps adviser wording out of every page tag', () => {
  routes.pages.forEach((page) => expect(`${page.title} ${page.description}`).not.toMatch(/advis/i));
});

test('lists the six service pages in the PDF order', () => {
  expect(SERVICE_PAGES.map((key) => pageHref(key))).toEqual(PDF_PATHS.slice(3, 9));
});

test('links pages to real URLs and leaves the blog where it is', () => {
  expect(pageHref('home')).toBe('/');
  expect(pageHref('contact')).toBe('/contact-us');
  expect(pageHref('workshops')).toBe('/workshops');
  expect(pageHref('blogs')).toBe('/blogs');
  NAV_PAGES.forEach((key) => expect(pageHref(key)).not.toContain('?page='));
});

test('falls back to the home page for an unknown key', () => {
  expect(pageHref('nope')).toBe('/');
});

test('labels the blog as Journal', () => {
  expect(pageLabel('blogs')).toBe('Journal');
  expect(pageLabel('about')).toBe('About');
});

test('maps old ?page= links to the new URLs and ignores unknown ones', () => {
  expect(legacyPath('?page=contact')).toBe('/contact-us');
  expect(legacyPath('?page=book-summaries')).toBe('/book-summaries');
  expect(legacyPath('?page=nope')).toBeNull();
  expect(legacyPath('?page=__proto__')).toBeNull();
  expect(legacyPath('?utm_source=x')).toBeNull();
  expect(legacyPath('?page=home')).toBeNull();
});
