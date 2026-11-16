import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeSanitize from 'rehype-sanitize';

const REMARK_PLUGINS = [remarkGfm];
const REHYPE_PLUGINS = [rehypeSanitize];

const components = {
  // Open links safely; images are lazy and never overflow on small screens.
  a: ({ node, children, href, ...props }) => {
    const external = /^https?:\/\//i.test(href || '');
    return (
      <a href={href} {...props} {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}>{children}</a>
    );
  },
  img: ({ node, alt, ...props }) => <img alt={alt || ''} loading="lazy" {...props} />,
  table: ({ node, ...props }) => (
    <div className="overflow-x-auto">
      <table {...props} />
    </div>
  ),
};

/** Renders post markdown. HTML in the source is sanitized, so post content cannot inject scripts. */
export default function PostContent({ markdown }) {
  return (
    <div className="prose prose-base sm:prose-lg max-w-none prose-headings:text-[#1E5631] prose-a:text-[#1E5631] prose-a:font-semibold prose-blockquote:border-[#C4A747] prose-img:rounded-xl break-words">
      <ReactMarkdown remarkPlugins={REMARK_PLUGINS} rehypePlugins={REHYPE_PLUGINS} components={components}>
        {markdown || ''}
      </ReactMarkdown>
    </div>
  );
}
