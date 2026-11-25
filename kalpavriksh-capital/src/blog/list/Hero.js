import React from 'react';

/** Journal masthead: label, display headline and a short standfirst. */
export default function Hero() {
  return (
    <section className="kj-hero">
      <div className="kj-wrap kj-hero__grid">
        <div>
          <p className="kj-label">The Kalpvriksh Journal</p>
          <h1>
            Perspectives on Wealth, Life <em>&amp;</em> Legacy.
          </h1>
        </div>
        <div className="kj-hero__aside">
          <p>
            Considered writing on investing, family wealth and financial independence, by Rakhi Jain,
            Chartered Accountant and Chartered Wealth Manager (CWM®).
          </p>
          <p className="kj-meta">Rakhi Jain · Kalpvriksh Global</p>
        </div>
      </div>
    </section>
  );
}
