import React from 'react';
import { Link } from 'react-router-dom';

/**
 * The right kind of link for a post: link-out posts open their external URL (in a new tab when it is a
 * full https address); everything else opens the post page in the single-page app.
 */
export default function PostLink({ post, children, ...rest }) {
  if (post.external_url) {
    const isExternal = /^https?:\/\//i.test(post.external_url);
    return (
      <a href={post.external_url} {...(isExternal ? { target: '_blank', rel: 'noopener noreferrer' } : {})} {...rest}>
        {children}
      </a>
    );
  }
  return (
    <Link to={`/blogs/${post.slug}`} {...rest}>
      {children}
    </Link>
  );
}
