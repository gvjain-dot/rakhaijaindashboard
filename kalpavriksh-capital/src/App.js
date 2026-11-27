import React from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import SiteLayout from './site/SiteLayout';
import AboutPage from './site/pages/AboutPage';
import BookSummariesPage from './site/pages/BookSummariesPage';
import ContactPage from './site/pages/ContactPage';
import DisclosuresPage from './site/pages/DisclosuresPage';
import FaqsPage from './site/pages/FaqsPage';
import HomePage from './site/pages/HomePage';
import NotFoundPage from './site/pages/NotFoundPage';
import ServicePage from './site/pages/ServicePage';
import ServicesPage from './site/pages/ServicesPage';
import TestimonialsPage from './site/pages/TestimonialsPage';
import WorkshopsPage from './site/pages/WorkshopsPage';
import routes from './site/routes.json';
import { legacyPath, pageByKey } from './site/navigation';

const PAGE_COMPONENTS = {
  home: HomePage,
  about: AboutPage,
  services: ServicesPage,
  faqs: FaqsPage,
  contact: ContactPage,
  workshops: WorkshopsPage,
  testimonials: TestimonialsPage,
  'book-summaries': BookSummariesPage,
  disclosures: DisclosuresPage,
};

const NOT_FOUND = {
  key: 'not-found',
  path: '/404',
  title: 'Page not found | Kalpvriksh Global',
  description: pageByKey('home').description,
  noindex: true,
};

/** Home, but old `/?page=<key>` links go to the page's own address. */
function HomeRoute() {
  const target = legacyPath(useLocation().search);
  if (target) return <Navigate to={target} replace />;
  return <SiteLayout page={pageByKey('home')}><HomePage /></SiteLayout>;
}

function pageElement(page) {
  if (page.key === 'home') return <HomeRoute />;
  const Page = PAGE_COMPONENTS[page.key];
  return (
    <SiteLayout key={page.key} page={page}>
      {page.service ? <ServicePage serviceKey={page.key} /> : <Page />}
    </SiteLayout>
  );
}

/** Routes of the main site. The blog and admin routes live in index.js. */
export default function App() {
  return (
    <Routes>
      {routes.pages.map((page) => (
        <Route key={page.key} path={page.path} element={pageElement(page)} />
      ))}
      <Route path="*" element={<SiteLayout page={NOT_FOUND}><NotFoundPage /></SiteLayout>} />
    </Routes>
  );
}
