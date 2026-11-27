const { siteUrl, pages } = require('../src/site/routes.json');

const BRAND = 'Kalpvriksh Global';
const CONTEXT = 'https://schema.org';

const pageByKey = (key) => pages.find((page) => page.key === key);
const urlOf = (page) => `${siteUrl}${page.path}`;

function breadcrumbs(page) {
  const trail = [pageByKey('home'), ...(page.service ? [pageByKey('services')] : []), page];
  return {
    '@context': CONTEXT,
    '@type': 'BreadcrumbList',
    itemListElement: trail.map((item, index) => ({
      '@type': 'ListItem', position: index + 1, name: item.label, item: urlOf(item),
    })),
  };
}

function service(page, detail) {
  return {
    '@context': CONTEXT,
    '@type': 'Service',
    name: detail.heading,
    description: page.description,
    url: urlOf(page),
    provider: { '@type': 'Organization', name: BRAND, url: siteUrl },
  };
}

function faqPage(faqs) {
  return {
    '@context': CONTEXT,
    '@type': 'FAQPage',
    mainEntity: faqs.map(({ question, answer }) => ({
      '@type': 'Question', name: question, acceptedAnswer: { '@type': 'Answer', text: answer },
    })),
  };
}

/** Structured data for one page. `detail` is a service page's content; `faqs` the questions shown on it. */
function buildStructuredData(page, { detail, faqs } = {}) {
  return [
    breadcrumbs(page),
    ...(detail ? [service(page, detail)] : []),
    ...(faqs ? [faqPage(faqs)] : []),
  ];
}

module.exports = { buildStructuredData };
