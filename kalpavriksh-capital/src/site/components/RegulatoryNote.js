import React from 'react';
import { Link } from 'react-router-dom';
import { pageHref } from '../navigation';

export default function RegulatoryNote() {
  return (
    <aside aria-label="Regulatory information" className="max-w-4xl mx-auto border-t pt-4 text-xs sm:text-sm text-gray-600 leading-relaxed" style={{ borderColor: '#C4A747' }}>
      <p>
        <strong>Rakhi Jain</strong> · AMFI Registered Mutual Fund Distributor (ARN 313560). Mutual fund investments are
        subject to market risks. Please read all scheme related documents carefully before investing.
      </p>
      <p className="mt-2">
        This page is for general information and education. It is not personal investment, legal or tax advice.
        Kalpvriksh Global does not hold a UAE regulatory license. Read our{' '}
        <Link to={pageHref('disclosures')} className="underline font-semibold" style={{ color: '#1E5631' }}>disclosures</Link>.
      </p>
    </aside>
  );
}
