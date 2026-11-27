import React from 'react';
import { Link } from 'react-router-dom';
import CallToAction from '../components/CallToAction';
import FaqList from '../components/FaqList';
import PageHero from '../components/PageHero';
import ProcessSection from '../components/ProcessSection';
import RegulatoryNote from '../components/RegulatoryNote';
import { SERVICE_DETAILS } from '../content/serviceDetails';
import { pageHref, pageLabel } from '../navigation';

const HEADING = 'text-xl sm:text-2xl md:text-3xl font-bold mb-4';
const GREEN = { color: '#1E5631' };

/** Landing page for one service; all of its text comes from content/serviceDetails. */
export default function ServicePage({ serviceKey }) {
  const detail = SERVICE_DETAILS[serviceKey];

  return (
    <div className="space-y-12 px-4 py-6 sm:py-8">
      <nav aria-label="Breadcrumb" className="max-w-4xl mx-auto text-sm text-gray-600">
        <Link to={pageHref('home')} className="underline">Home</Link>
        <span aria-hidden="true"> / </span>
        <Link to={pageHref('services')} className="underline">Services</Link>
        <span aria-hidden="true"> / </span>
        <span aria-current="page">{pageLabel(serviceKey)}</span>
      </nav>

      <PageHero title={detail.heading}>{detail.intro}</PageHero>

      <div className="max-w-4xl mx-auto grid gap-4">
        {detail.sections.map(({ title, body }) => (
          <section key={title} className="bg-white rounded-xl p-6 shadow-sm">
            <h2 className="text-lg sm:text-xl font-bold mb-2" style={GREEN}>{title}</h2>
            <p className="text-sm sm:text-base text-gray-700 leading-relaxed">{body}</p>
          </section>
        ))}
      </div>

      <section className="max-w-4xl mx-auto">
        <h2 className={HEADING} style={GREEN}>Who this helps</h2>
        <ul className="list-disc list-inside space-y-2 text-sm sm:text-base text-gray-700">
          {detail.audience.map((item) => <li key={item}>{item}</li>)}
        </ul>
      </section>

      <ProcessSection />

      <section className="max-w-4xl mx-auto">
        <h2 className={HEADING} style={GREEN}>Frequently asked questions</h2>
        <FaqList faqs={detail.faqs} />
      </section>

      {detail.articles.length > 0 && (
        <section className="max-w-4xl mx-auto">
          <h2 className={HEADING} style={GREEN}>Keep learning</h2>
          <ul className="space-y-2">
            {detail.articles.map(({ to, title }) => (
              <li key={to}><Link to={to} className="underline font-semibold" style={GREEN}>{title}</Link></li>
            ))}
          </ul>
        </section>
      )}

      <section aria-labelledby="related-services" className="max-w-4xl mx-auto">
        <h2 id="related-services" className={HEADING} style={GREEN}>Related services</h2>
        <div className="grid sm:grid-cols-3 gap-4">
          {detail.related.map((key) => (
            <Link key={key} to={pageHref(key)} className="block bg-white rounded-xl p-5 shadow-sm hover:shadow-md text-center font-semibold border-2" style={{ ...GREEN, borderColor: '#C4A747' }}>
              {pageLabel(key)}
            </Link>
          ))}
        </div>
      </section>

      <CallToAction service={serviceKey} topic={detail.topic} />
      <RegulatoryNote />
    </div>
  );
}
