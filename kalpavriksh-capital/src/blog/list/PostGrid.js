import React from 'react';
import PostCard from '../PostCard';
import NewsletterSignup from '../NewsletterSignup';

const NEWSLETTER_AFTER = 4; // the signup panel sits in the grid after this many cards

function SkeletonGrid() {
  return (
    <div className="kj-grid" aria-hidden="true">
      {Array.from({ length: 6 }, (_, index) => (
        <div key={index}>
          <div className="kj-skel" style={{ aspectRatio: '3 / 2' }} />
          <div className="kj-skel" style={{ height: 22, marginTop: 16, width: '80%' }} />
          <div className="kj-skel" style={{ height: 14, marginTop: 10, width: '60%' }} />
        </div>
      ))}
    </div>
  );
}

/**
 * The article grid. The first card is the wide "lead" card while nothing is filtered, and the newsletter
 * panel is slotted in after the fourth card (at the end when there are fewer).
 */
export default function PostGrid({ list }) {
  const { status, posts, filtered, error, total, clearFilters } = list;

  if (status === 'loading') return <SkeletonGrid />;

  if (status === 'error') {
    return (
      <div className="kj-grid">
        <div role="alert" className="kj-error">
          <h3>We couldn't load the articles.</h3>
          <p>{error}</p>
          <button type="button" className="kj-btn" onClick={() => window.location.reload()}>Try again</button>
        </div>
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="kj-grid">
        <div className="kj-empty">
          <h3>No articles found</h3>
          <p>Try a different search, category or month.</p>
          {(filtered || total > 0) && (
            <button type="button" className="kj-btn kj-btn--ghost" onClick={clearFilters}>Clear filters</button>
          )}
        </div>
      </div>
    );
  }

  const cards = posts.map((post, index) => (
    <PostCard key={post.id} post={post} variant={index === 0 && !filtered ? 'lead' : 'default'} />
  ));
  const withNewsletter =
    posts.length > NEWSLETTER_AFTER
      ? [...cards.slice(0, NEWSLETTER_AFTER), <NewsletterSignup key="newsletter" />, ...cards.slice(NEWSLETTER_AFTER)]
      : [...cards, <NewsletterSignup key="newsletter" />];

  return <div className="kj-grid">{withNewsletter}</div>;
}
