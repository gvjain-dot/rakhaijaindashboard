import React from 'react';
import CallToAction from '../components/CallToAction';
import FaqList from '../components/FaqList';
import PageHero from '../components/PageHero';
import { faqs } from '../content/faqs';

export default function FaqsPage() {
  return (
    <div className="space-y-12 px-4 py-6 sm:py-8">
      <PageHero title="Frequently Asked Questions">
        Straight answers about working with Kalpvriksh Global.
      </PageHero>
      <div className="max-w-4xl mx-auto">
        <FaqList faqs={faqs} />
      </div>
      <CallToAction />
    </div>
  );
}
