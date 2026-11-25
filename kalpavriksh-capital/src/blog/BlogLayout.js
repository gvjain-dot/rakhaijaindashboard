import React from 'react';
import { useNavigate } from 'react-router-dom';
import SiteFooter from '../site/SiteFooter';
import SiteHeader from '../site/SiteHeader';
import { pageHref } from '../site/navigation';
import useScrollProgress from '../site/useScrollProgress';
import './styles/kj-base.css';
import './styles/kj-layout.css';
import './styles/kj-list.css';
import './styles/kj-article.css';

const ACTIVE_PAGE = 'blogs';

/**
 * Shared page chrome for the blog routes: skip link, main site header and footer around the content.
 * `progress` (0-1) is the reading progress on article pages; other pages show plain scroll progress.
 */
export default function BlogLayout({ children, progress }) {
  const navigate = useNavigate();
  const scrolled = useScrollProgress();
  const goTo = (page) => navigate(pageHref(page));

  return (
    <div className="kj-page">
      <a className="kj-skip" href="#main">Skip to content</a>
      <SiteHeader
        currentPage={ACTIVE_PAGE}
        onNavigate={goTo}
        progress={typeof progress === 'number' ? progress * 100 : scrolled}
      />
      <div className="kj-root">
        <main id="main">{children}</main>
        <aside className="kj-wrap kj-regnote" aria-label="Regulatory information">
          <p>
            <strong>Rakhi Jain</strong> · AMFI Registered Mutual Fund Distributor (ARN 313560) · APMI Registered
            Portfolio Manager (APRN 08588).
          </p>
          <p>
            Mutual fund investments are subject to market risks. Please read all scheme related documents carefully.
            Articles are for general information and are not personal investment advice.
          </p>
        </aside>
      </div>
      <SiteFooter onNavigate={goTo} />
    </div>
  );
}
