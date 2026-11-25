import React from 'react';
import { Link } from 'react-router-dom';
import { formatDate, readingTimeLabel } from './format';

function CardMedia({ post }) {
  if (post.feature_image) {
    return (
      <div className="kj-card__media">
        <img src={post.feature_image} alt="" loading="lazy" decoding="async" width="600" height="400" />
      </div>
    );
  }
  return (
    <div className="kj-card__media kj-card__media--empty">
      <img className="kj-card__emblem" src="/icon.svg" alt="" width="64" height="64" />
    </div>
  );
}

/** The title is the card's only link; its ::after stretches over the whole card, so there is one tab stop. */
function TitleLink({ post }) {
  if (post.external_url) {
    const isExternal = /^https?:\/\//i.test(post.external_url);
    return (
      <a href={post.external_url} {...(isExternal ? { target: '_blank', rel: 'noopener noreferrer' } : {})}>
        {post.title}
      </a>
    );
  }
  return <Link to={`/blogs/${post.slug}`}>{post.title}</Link>;
}

/**
 * A journal card. `variant`: "default", "lead" (the wide first card of an unfiltered list) or
 * "related" (hides the excerpt and shows why the post was suggested).
 */
export default function PostCard({ post, variant = 'default' }) {
  const date = formatDate(post.published_at);
  const className = `kj-card${variant === 'lead' ? ' kj-card--lead' : ''}`;

  return (
    <article className={className}>
      <CardMedia post={post} />
      <div className="kj-card__body">
        {post.category && <p className="kj-label">{post.category}</p>}
        <h3>
          <TitleLink post={post} />
        </h3>
        <p className="kj-card__excerpt">{post.excerpt}</p>
        {variant === 'related' && post.reason && <p className="kj-card__why">{post.reason}</p>}
        <div className="kj-card__foot">
          <p className="kj-meta">
            {date && <span>{date}</span>}
            <span>{readingTimeLabel(post.reading_minutes)}</span>
          </p>
          <span className="kj-card__more" aria-hidden="true">
            {post.external_url ? 'Read article ↗' : 'Read →'}
          </span>
        </div>
      </div>
    </article>
  );
}
