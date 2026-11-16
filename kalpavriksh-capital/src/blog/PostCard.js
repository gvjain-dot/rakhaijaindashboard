import React from 'react';
import { Link } from 'react-router-dom';
import { formatDate, readingTimeLabel } from './format';

const CARD_CLASS =
  'group flex h-full flex-col overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-black/5 transition duration-300 hover:-translate-y-1 hover:shadow-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1E5631]';

function FeatureImage({ src, title }) {
  if (src) {
    return (
      <img
        src={src}
        alt={title}
        loading="lazy"
        decoding="async"
        className="aspect-video w-full object-cover transition duration-500 group-hover:scale-105"
      />
    );
  }
  return (
    <div className="flex aspect-video w-full items-center justify-center bg-gradient-to-br from-[#1E5631] to-[#2d7a47]">
      <img src="/icon.svg" alt="" className="h-16 w-auto opacity-90 sm:h-20" />
    </div>
  );
}

function CardBody({ post }) {
  const meta = [formatDate(post.published_at), readingTimeLabel(post.reading_minutes)].filter(Boolean).join(' · ');
  return (
    <>
      <div className="overflow-hidden">
        <FeatureImage src={post.feature_image} title={post.title} />
      </div>
      <div className="flex flex-1 flex-col p-5">
        {post.category && (
          <span className="mb-2 inline-block self-start rounded-full bg-[#C4A747] px-2.5 py-1 text-xs font-semibold text-[#143D22]">
            {post.category}
          </span>
        )}
        <h3 className="text-lg font-bold leading-snug text-[#1E5631]">{post.title}</h3>
        <p className="mt-2 line-clamp-3 flex-1 text-sm leading-relaxed text-gray-600">{post.excerpt}</p>
        <p className="mt-4 text-xs text-gray-500">{meta}</p>
        <p className="mt-2 text-sm font-semibold text-[#1E5631]">
          {post.external_url ? 'Read article ↗' : 'Read more →'}
        </p>
      </div>
    </>
  );
}

/** A blog card. Link-out posts open their external URL; others open the post page. */
export default function PostCard({ post }) {
  if (post.external_url) {
    const isExternal = /^https?:\/\//i.test(post.external_url);
    return (
      <a
        href={post.external_url}
        className={CARD_CLASS}
        {...(isExternal ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
      >
        <CardBody post={post} />
      </a>
    );
  }
  return (
    <Link to={`/blogs/${post.slug}`} className={CARD_CLASS}>
      <CardBody post={post} />
    </Link>
  );
}
