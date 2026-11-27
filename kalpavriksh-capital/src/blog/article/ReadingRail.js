import React from 'react';

/** Sticky "In this article" index for wide screens, with the current section highlighted. */
export default function ReadingRail({ headings, activeId }) {
  return (
    <nav className="kj-rail__in" aria-label="In this article">
      <p className="kj-label">In this article</p>
      <ol>
        {headings.map((heading) => (
          <li key={heading.id} className={`lvl${heading.level}`}>
            <a
              href={`#${heading.id}`}
              className={activeId === heading.id ? 'is-active' : undefined}
              aria-current={activeId === heading.id ? 'location' : undefined}
            >
              {heading.text}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
