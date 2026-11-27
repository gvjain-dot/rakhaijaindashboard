import React from 'react';
import { Link } from 'react-router-dom';

/** Journal > Category > Title. The current page is the last, unlinked crumb. */
export default function Breadcrumbs({ post }) {
  return (
    <nav className="kj-wrap kj-crumbs" aria-label="Breadcrumb">
      <ol>
        <li><Link to="/blogs">Journal</Link></li>
        {post.category && (
          <li><Link to={`/blogs?category=${encodeURIComponent(post.category)}`}>{post.category}</Link></li>
        )}
        <li><span aria-current="page">{post.title}</span></li>
      </ol>
    </nav>
  );
}
