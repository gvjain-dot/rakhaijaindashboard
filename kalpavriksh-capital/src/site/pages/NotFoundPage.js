import React from 'react';
import { Link } from 'react-router-dom';
import PageHero from '../components/PageHero';
import { pageHref } from '../navigation';

export default function NotFoundPage() {
  return (
    <div className="space-y-8 px-4 py-12 text-center">
      <PageHero title="Page not found">The page you are looking for has moved or does not exist.</PageHero>
      <p>
        <Link to={pageHref('home')} className="underline font-semibold mr-6" style={{ color: '#1E5631' }}>Go to the home page</Link>
        <Link to={pageHref('services')} className="underline font-semibold" style={{ color: '#1E5631' }}>See our services</Link>
      </p>
    </div>
  );
}
