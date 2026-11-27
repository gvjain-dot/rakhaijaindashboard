import React from 'react';
import CallToAction from '../components/CallToAction';
import PageHero from '../components/PageHero';
import ProcessSection from '../components/ProcessSection';
import RegulatoryNote from '../components/RegulatoryNote';

// Facts only: each line already appears elsewhere on the site.
const CREDENTIALS = [
  'Gold Medalist Chartered Accountant and Chartered Wealth Manager (CWM®)',
  'Former Finance Director, Unilever Middle East',
  '23+ years of leadership in Strategy, Corporate Finance and Business Performance across India and the Middle East',
  'AMFI registered Mutual Fund Distributor',
];

export default function AboutPage() {
  return (
    <div className="space-y-12 px-4 py-6 sm:py-8">
      <PageHero title="About Kalpvriksh Global">
        A boutique, founder-led firm built on patient, research-driven strategies grounded in integrity and discipline.
      </PageHero>

      <section className="max-w-4xl mx-auto bg-white rounded-xl p-6 sm:p-8 shadow-sm flex flex-col md:flex-row items-center md:items-start gap-6">
        <img src="/profile-rakhi.jpg" alt="Rakhi Jain, founder of Kalpvriksh Global" width="160" height="160"
          className="w-32 h-32 sm:w-40 sm:h-40 rounded-full object-cover border-4 flex-shrink-0" style={{ borderColor: '#1E5631' }} />
        <div>
          <h2 className="text-xl sm:text-2xl font-bold mb-3" style={{ color: '#1E5631' }}>Rakhi Jain, Founder &amp; CEO</h2>
          <p className="text-sm sm:text-base text-gray-700 leading-relaxed mb-4">
            Offers personalised, goal-based financial planning grounded in clarity, discipline and
            long-term outcomes aligned with life aspirations. Passionate about investor education and on a mission to
            empower 100+ families on their path to financial freedom.
          </p>
          <ul className="list-disc list-inside space-y-2 text-sm sm:text-base text-gray-700">
            {CREDENTIALS.map((item) => <li key={item}>{item}</li>)}
          </ul>
        </div>
      </section>

      <section className="max-w-4xl mx-auto text-center">
        <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-3" style={{ color: '#1E5631' }}>What guides us</h2>
        <p className="text-sm sm:text-base text-gray-700 leading-relaxed">
          Every recommendation we make follows the same standards we apply to our own portfolios, because your trust
          deserves nothing less.
        </p>
      </section>

      <ProcessSection />
      <CallToAction />
      <RegulatoryNote />
    </div>
  );
}
