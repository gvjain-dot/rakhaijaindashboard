import React, { useState } from 'react';

const MIN_HEADINGS = 3;
const WIDE_QUERY = '(min-width: 760px)';

// Open by default on tablet and desktop, collapsed on phones so it does not push the article down.
const startsOpen = () => typeof window.matchMedia !== 'function' || window.matchMedia(WIDE_QUERY).matches;

/**
 * "In this article" jump list built from the article's h2/h3 headings, as a collapsible block.
 * Hidden for short articles.
 */
export default function TableOfContents({ headings }) {
  const [open, setOpen] = useState(startsOpen);
  if (headings.length < MIN_HEADINGS) return null;

  const sections = headings.filter((heading) => heading.level === 2).length || headings.length;
  return (
    <details className="kj-toc" open={open} onToggle={(event) => setOpen(event.currentTarget.open)}>
      <summary>
        <span className="kj-toc__t">In this article</span>
        <span className="kj-toc__n">{sections} {sections === 1 ? 'section' : 'sections'} <i aria-hidden="true" /></span>
      </summary>
      <nav aria-label="Table of contents">
        <ol>
          {headings.map((heading) => (
            <li key={heading.id} className={`lvl${heading.level}`}>
              <a href={`#${heading.id}`}>{heading.text}</a>
            </li>
          ))}
        </ol>
      </nav>
    </details>
  );
}
