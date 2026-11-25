import React, { useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeSanitize from 'rehype-sanitize';
import './styles/kj-base.css';
import './styles/kj-article.css';
import { rehypeHeadingIds } from './toc';
import ArticleFigure from './ArticleFigure';

const REMARK_PLUGINS = [remarkGfm];
// Order matters: sanitise first, then add heading ids (sanitising would otherwise prefix or drop them).
const REHYPE_PLUGINS = [rehypeSanitize, rehypeHeadingIds];

function buildComponents(insertBefore) {
  return {
    // Open links safely; images are lazy and never overflow on small screens.
    a: ({ node, children, href, ...props }) => {
      const external = /^https?:\/\//i.test(href || '');
      return (
        <a href={href} {...props} {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}>{children}</a>
      );
    },
    img: ({ node, alt, ...props }) => <img alt={alt || ''} loading="lazy" {...props} />,
    // An image alone on its line becomes a figure (caption, layout, click to enlarge). A <figure> cannot sit
    // inside a <p>, so the paragraph itself is replaced.
    p: ({ node, children, ...props }) => {
      const content = (node.children || []).filter((child) => !(child.type === 'text' && !child.value.trim()));
      if (content.length === 1 && content[0].tagName === 'img') {
        const { src, alt, title } = content[0].properties || {};
        return <ArticleFigure src={src} alt={alt} caption={title} />;
      }
      return <p {...props}>{children}</p>;
    },
    // The element (the inline newsletter) goes straight before the h2 with this id, inside the same prose
    // container, so spacing, heading ids and the drop cap are unaffected.
    h2: ({ node, id, children, ...props }) => (
      <>
        {insertBefore && id === insertBefore.id ? insertBefore.element : null}
        <h2 id={id} {...props}>{children}</h2>
      </>
    ),
  };
}

/**
 * Renders post markdown. HTML in the source is sanitized, so post content cannot inject scripts.
 * `insertBefore` is an optional { id, element }; keep it referentially stable (useMemo) so the article is not
 * re-parsed on every scroll-driven re-render of the page.
 */
function PostContent({ markdown, insertBefore }) {
  const components = useMemo(() => buildComponents(insertBefore), [insertBefore]);
  return (
    <div className="kj-prose">
      <ReactMarkdown remarkPlugins={REMARK_PLUGINS} rehypePlugins={REHYPE_PLUGINS} components={components}>
        {markdown || ''}
      </ReactMarkdown>
    </div>
  );
}

export default React.memo(PostContent);
