import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import BlogLayout from './BlogLayout';
import PostContent from './PostContent';
import PostCard from './PostCard';
import useDocumentMeta from './useDocumentMeta';
import { fetchPost } from './api';
import { formatDate, readingTimeLabel } from './format';

const COPIED_RESET_MS = 2000;
const DISCLAIMER =
  'This article is shared for educational purposes only and is not investment, tax or legal advice. ' +
  'Investments are subject to market risks. Please consult a qualified professional before making financial decisions.';

function ShareButtons({ title }) {
  const [copied, setCopied] = useState(false);
  const url = window.location.href;
  const buttonClass =
    'inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-semibold transition-colors';

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), COPIED_RESET_MS);
    } catch (error) {
      window.prompt('Copy this link', url);
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-2" aria-label="Share this article">
      <span className="mr-1 text-sm font-medium text-gray-600">Share:</span>
      <a
        className={`${buttonClass} bg-[#25D366] text-white hover:bg-[#1ebe5b]`}
        href={`https://wa.me/?text=${encodeURIComponent(`${title} ${url}`)}`}
        target="_blank"
        rel="noopener noreferrer"
      >
        WhatsApp
      </a>
      <a
        className={`${buttonClass} bg-[#0A66C2] text-white hover:bg-[#0958a8]`}
        href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`}
        target="_blank"
        rel="noopener noreferrer"
      >
        LinkedIn
      </a>
      <button type="button" onClick={copyLink} className={`${buttonClass} bg-white text-[#1E5631] ring-1 ring-[#1E5631]/30 hover:bg-[#1E5631]/10`}>
        {copied ? 'Link copied ✓' : 'Copy link'}
      </button>
    </div>
  );
}

function ConsultationCta() {
  return (
    <aside className="mt-10 rounded-2xl bg-gradient-to-br from-[#1E5631] to-[#2d7a47] p-6 text-center text-white sm:p-8">
      <h2 className="text-xl font-bold sm:text-2xl">Want guidance tailored to you?</h2>
      <p className="mx-auto mt-2 max-w-xl text-sm text-white/80 sm:text-base">
        Talk to Rakhi Jain about a plan that fits your goals, income and stage of life.
      </p>
      <Link
        to="/?page=contact"
        className="mt-5 inline-block rounded-lg bg-[#C4A747] px-6 py-3 font-semibold text-[#1E5631] transition hover:brightness-110"
      >
        Book a consultation
      </Link>
    </aside>
  );
}

function Message({ title, text }) {
  return (
    <div className="mx-auto max-w-xl px-4 py-24 text-center">
      <h1 className="text-2xl font-bold text-[#1E5631]">{title}</h1>
      <p className="mt-2 text-gray-600">{text}</p>
      <Link to="/blogs" className="mt-6 inline-block rounded-lg bg-[#1E5631] px-5 py-3 font-semibold text-white">
        ← Back to all articles
      </Link>
    </div>
  );
}

export default function BlogPost() {
  const { slug } = useParams();
  const [state, setState] = useState({ status: 'loading', post: null, related: [], error: '' });

  useEffect(() => {
    const controller = new AbortController();
    setState({ status: 'loading', post: null, related: [], error: '' });
    fetchPost(slug, controller.signal)
      .then((data) => setState({ status: 'ready', post: data.post, related: data.related, error: '' }))
      .catch((error) => {
        if (error.name === 'AbortError') return;
        setState({ status: error.message === 'Post not found' ? 'missing' : 'error', post: null, related: [], error: error.message });
      });
    return () => controller.abort();
  }, [slug]);

  const { status, post, related, error } = state;

  useDocumentMeta({
    title: post ? `${post.seo_title || post.title} | Kalpvriksh Global` : undefined,
    description: post ? post.seo_description || post.excerpt : undefined,
    image: post?.feature_image || undefined,
  });

  if (status === 'loading') {
    return (
      <BlogLayout>
        <div className="mx-auto max-w-3xl animate-pulse px-4 py-12" aria-busy="true">
          <div className="h-8 w-3/4 rounded bg-gray-200" />
          <div className="mt-6 aspect-video rounded-xl bg-gray-200" />
          <div className="mt-6 h-4 rounded bg-gray-200" />
          <div className="mt-3 h-4 w-5/6 rounded bg-gray-200" />
        </div>
      </BlogLayout>
    );
  }
  if (status === 'missing') {
    return <BlogLayout><Message title="Article not found" text="It may have been moved or unpublished." /></BlogLayout>;
  }
  if (status === 'error') {
    return <BlogLayout><Message title="We couldn't load this article" text={error} /></BlogLayout>;
  }

  return (
    <BlogLayout>
      <article className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-12">
        <Link to="/blogs" className="text-sm font-semibold text-[#1E5631] underline-offset-4 hover:underline">
          ← All articles
        </Link>

        <header className="mt-4">
          {post.category && (
            <span className="inline-block rounded-full bg-[#C4A747] px-3 py-1 text-xs font-semibold text-[#143D22]">
              {post.category}
            </span>
          )}
          <h1 className="mt-3 text-3xl font-bold leading-tight text-[#1E5631] sm:text-4xl md:text-5xl">{post.title}</h1>
          <p className="mt-3 text-sm text-gray-500">
            By Rakhi Jain · {formatDate(post.published_at)} · {readingTimeLabel(post.reading_minutes)}
          </p>
        </header>

        {post.feature_image && (
          <img
            src={post.feature_image}
            alt={post.title}
            className="mt-6 aspect-video w-full rounded-2xl object-cover"
            decoding="async"
          />
        )}

        <div className="mt-6"><ShareButtons title={post.title} /></div>

        <div className="mt-8">
          {post.external_url && !post.content ? (
            <a href={post.external_url} className="inline-block rounded-lg bg-[#1E5631] px-5 py-3 font-semibold text-white" target="_blank" rel="noopener noreferrer">
              Read the full article ↗
            </a>
          ) : (
            <PostContent markdown={post.content} />
          )}
        </div>

        <p className="mt-10 rounded-xl bg-white p-4 text-xs leading-relaxed text-gray-600 ring-1 ring-black/5">
          <strong className="text-[#1E5631]">Disclaimer: </strong>{DISCLAIMER}
        </p>

        <ConsultationCta />
      </article>

      {related.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 pb-4 sm:px-6" aria-labelledby="related-heading">
          <h2 id="related-heading" className="mb-6 text-2xl font-bold text-[#1E5631]">Related articles</h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((item) => (
              <PostCard key={item.id} post={item} />
            ))}
          </div>
        </section>
      )}
    </BlogLayout>
  );
}
