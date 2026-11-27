import React from 'react';
import { Link } from 'react-router-dom';
import PostCard from '../PostCard';

/** Up to three suggested articles on a stone band, each with the reason it was suggested. */
export default function RelatedSection({ related }) {
  if (related.length === 0) return null;
  return (
    <section className="kj-related" aria-labelledby="kj-related-title">
      <div className="kj-wrap">
        <div className="kj-related__head">
          <div>
            <p className="kj-label">Perspectives you may also find interesting</p>
            <h2 id="kj-related-title">Continue Exploring</h2>
          </div>
          <Link className="kj-link" to="/blogs">All perspectives →</Link>
        </div>
        <div className="kj-grid">
          {related.map((item) => (
            <PostCard key={item.id} post={item} variant="related" />
          ))}
        </div>
      </div>
    </section>
  );
}
