import React from 'react';
import { Link } from 'react-router-dom';
import { DEFAULT_AUTHOR } from './article/ArticleHeader';

// Edit these to change the default author's bio and credentials, shown when a post has no author of its own.
const DEFAULT_BIO = 'Rakhi Jain writes about personal finance, investing and building long-term wealth.';
const DEFAULT_CREDENTIALS = 'Chartered Accountant / Chartered Wealth Manager (CWM®) · Dubai';

const initials = (name) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0].toUpperCase())
    .join('');

/**
 * "Written by" card under each article. A post can name its own author and bio; otherwise it is the default
 * author, and only she carries the credentials line (they are hers, not a guest writer's).
 */
export default function AuthorBox({ name, bio }) {
  const authorName = (name || '').trim() || DEFAULT_AUTHOR;
  const isDefault = authorName === DEFAULT_AUTHOR;
  const authorBio = (bio || '').trim() || (isDefault ? DEFAULT_BIO : '');

  return (
    <aside aria-label="About the author" className="kj-author">
      <div className="kj-author__mono" aria-hidden="true">{initials(authorName)}</div>
      <div>
        <p className="kj-label">Written by</p>
        <h2>{authorName}</h2>
        {isDefault && <p>{DEFAULT_CREDENTIALS}</p>}
        {authorBio && <p>{authorBio}</p>}
        <Link className="kj-link" to="/?page=contact">Get in touch →</Link>
      </div>
    </aside>
  );
}
