import React from 'react';
import { formatDate } from '../format';

/** Drafts and scheduled articles, so unfinished work is not forgotten. Each row opens the article for editing. */
export default function AttentionList({ posts, onEdit }) {
  if (posts.length === 0) {
    return <p className="rounded-lg border border-[#E2DDD4] bg-white p-6 text-sm text-[#6B7280]">Nothing waiting. Every article is published.</p>;
  }
  return (
    <ul aria-label="Drafts and scheduled articles" className="divide-y divide-[#E2DDD4] rounded-lg border border-[#E2DDD4] bg-white">
      {posts.map((post) => (
        <li key={post.id} className="flex items-center justify-between gap-3 p-4">
          <div className="min-w-0">
            <p className="truncate text-sm font-bold text-[#2C3344]">{post.title}</p>
            <p className="text-xs text-[#6B7280]">
              {post.published ? `Goes live ${formatDate(post.published_at)}` : `Draft · edited ${formatDate(post.updated_at)}`}
            </p>
          </div>
          <button type="button" onClick={() => onEdit(post.id)} aria-label={`Open ${post.title}`} className="shrink-0 rounded-md border border-[#D9D3C7] px-3 py-1.5 text-xs font-bold text-[#1E5631] hover:border-[#C4A747]">
            Open
          </button>
        </li>
      ))}
    </ul>
  );
}
