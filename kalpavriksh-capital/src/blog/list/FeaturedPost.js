import React from 'react';
import PostLink from '../PostLink';
import { formatDate, readingTimeLabel } from '../format';

/** The editor's featured article, shown above the grid in the default view. */
export default function FeaturedPost({ post }) {
  const date = formatDate(post.published_at);
  return (
    <section className="kj-wrap kj-featured" aria-label="Featured article">
      <div className="kj-featured__grid">
        <PostLink post={post} className="kj-featured__media" aria-hidden="true" tabIndex={-1}>
          {post.feature_image ? (
            <img src={post.feature_image} alt="" width="800" height="600" decoding="async" fetchPriority="high" />
          ) : (
            <img className="kj-card__emblem" src="/icon.svg" alt="" width="64" height="64" />
          )}
        </PostLink>
        <div className="kj-featured__body">
          <div className="kj-featured__kicker">
            {post.category && <span className="kj-label">{post.category}</span>}
            <span className="kj-tag">Featured article</span>
          </div>
          <h2>
            <PostLink post={post}>{post.title}</PostLink>
          </h2>
          <p className="kj-featured__dek">{post.excerpt}</p>
          <div className="kj-featured__foot">
            <p className="kj-meta">
              {date && <span>{date}</span>}
              <span>{readingTimeLabel(post.reading_minutes)}</span>
            </p>
            <PostLink post={post} className="kj-link">
              {post.external_url ? 'Read the article ↗' : 'Read the article'}
            </PostLink>
          </div>
        </div>
      </div>
    </section>
  );
}
