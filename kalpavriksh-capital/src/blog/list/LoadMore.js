import React from 'react';

/**
 * "Load more" as a real link to ?page=N, so crawlers and no-JS visitors can reach every article;
 * with JavaScript the click is intercepted and the next window is appended in place.
 */
export default function LoadMore({ list }) {
  const { posts, total, hasMore, loadingMore, loadMore, nextPageHref, error } = list;
  if (posts.length === 0) return null;

  const onClick = (event) => {
    event.preventDefault();
    loadMore();
  };

  return (
    <div className="kj-more">
      {hasMore && (
        <a className="kj-btn kj-btn--ghost" href={nextPageHref()} onClick={onClick} aria-busy={loadingMore}>
          {loadingMore ? 'Loading…' : 'Load more articles'}
        </a>
      )}
      {error && <p role="alert" className="kj-more__error">{error}</p>}
      <p className="kj-more__status" aria-live="polite">Showing {posts.length} of {total}</p>
    </div>
  );
}
