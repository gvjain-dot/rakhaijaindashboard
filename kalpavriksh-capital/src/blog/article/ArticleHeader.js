import React from 'react';
import { formatDate, readingTimeLabel } from '../format';

export const DEFAULT_AUTHOR = 'Rakhi Jain';

/** Centred article masthead: category, title, standfirst and byline. */
export default function ArticleHeader({ post }) {
  const date = formatDate(post.published_at);
  return (
    <header className="kj-wrap kj-ahead">
      {post.category && <p className="kj-label">{post.category}</p>}
      <h1>{post.title}</h1>
      {post.excerpt && <p className="kj-ahead__dek">{post.excerpt}</p>}
      <p className="kj-meta">
        <span>By <strong>{post.author_name || DEFAULT_AUTHOR}</strong></span>
        {date && <span>{date}</span>}
        <span>{readingTimeLabel(post.reading_minutes)}</span>
      </p>
    </header>
  );
}
