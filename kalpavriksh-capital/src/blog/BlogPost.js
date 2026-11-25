import React, { useEffect, useMemo, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import AuthorBox from './AuthorBox';
import BlogLayout from './BlogLayout';
import NewsletterSignup from './NewsletterSignup';
import PostContent from './PostContent';
import TableOfContents from './TableOfContents';
import Breadcrumbs from './article/Breadcrumbs';
import ArticleHeader from './article/ArticleHeader';
import ReadingRail from './article/ReadingRail';
import RelatedSection from './article/RelatedSection';
import ShareButtons from './article/ShareButtons';
import { useActiveSection, useReadingProgress } from './article/useArticleScroll';
import InviteCta from './list/InviteCta';
import useDocumentMeta from './useDocumentMeta';
import useTrackView from './useTrackView';
import { fetchPost } from './api';
import { extractHeadings, pickNewsletterHeadingId } from './toc';

const DISCLAIMER =
  'This article is shared for educational purposes only and is not investment, tax or legal advice. ' +
  'Investments are subject to market risks. Please consult a qualified professional before making financial decisions.';
const RAIL_MIN_HEADINGS = 3;

function Message({ title, text }) {
  return (
    <div className="kj-wrap kj-message">
      <h1>{title}</h1>
      <p>{text}</p>
      <Link to="/blogs" className="kj-btn">← Back to all articles</Link>
    </div>
  );
}

function ArticleSkeleton() {
  return (
    <div className="kj-wrap" aria-busy="true" style={{ paddingBlock: '4rem' }}>
      <div className="kj-skel" style={{ height: 14, width: 160, margin: '0 auto' }} />
      <div className="kj-skel" style={{ height: 48, width: '70%', margin: '1.5rem auto 0' }} />
      <div className="kj-skel" style={{ aspectRatio: '16 / 8', maxWidth: 1140, margin: '3rem auto 0' }} />
    </div>
  );
}

function TagList({ tags }) {
  if (!tags || tags.length === 0) return null;
  return (
    <ul aria-label="Tags" className="kj-tagrow">
      {tags.map((tag) => (
        <li key={tag}>
          <Link to={`/blogs?tag=${encodeURIComponent(tag)}`}>#{tag}</Link>
        </li>
      ))}
    </ul>
  );
}

function PreviewBanner() {
  return (
    <div role="status" className="kj-banner">
      Preview: this article is not public yet. Only people with this private link can see it.
    </div>
  );
}

/** Asks search engines not to index a page for as long as the component is mounted. */
function useNoIndex(active) {
  useEffect(() => {
    if (!active) return undefined;
    const meta = document.createElement('meta');
    meta.name = 'robots';
    meta.content = 'noindex, nofollow';
    document.head.appendChild(meta);
    return () => meta.remove();
  }, [active]);
}

export default function BlogPost() {
  const { slug } = useParams();
  const [searchParams] = useSearchParams();
  const previewToken = searchParams.get('preview') || '';
  const [state, setState] = useState({ status: 'loading', post: null, related: [], error: '', preview: false });

  useEffect(() => {
    const controller = new AbortController();
    setState({ status: 'loading', post: null, related: [], error: '', preview: false });
    fetchPost(slug, controller.signal, previewToken)
      .then((data) => setState({ status: 'ready', post: data.post, related: data.related, error: '', preview: Boolean(data.preview) }))
      .catch((error) => {
        if (error.name === 'AbortError') return;
        setState({ status: error.message === 'Post not found' ? 'missing' : 'error', post: null, related: [], error: error.message, preview: false });
      });
    return () => controller.abort();
  }, [slug, previewToken]);

  const { status, post, related, error, preview } = state;
  const ready = status === 'ready';
  const headings = useMemo(() => extractHeadings(post ? post.content : ''), [post]);

  // One newsletter per article: inline before the section nearest the middle, or after the text if too short.
  const newsletterId = useMemo(() => pickNewsletterHeadingId(post ? post.content : ''), [post]);
  const newsletter = useMemo(() => <NewsletterSignup key="newsletter" source={post ? post.slug : ''} variant="inline" />, [post]);
  const insertBefore = useMemo(() => (newsletterId ? { id: newsletterId, element: newsletter } : null), [newsletterId, newsletter]);

  const showRail = ready && headings.length >= RAIL_MIN_HEADINGS;
  const progress = useReadingProgress(ready);
  const activeId = useActiveSection(useMemo(() => headings.map((heading) => heading.id), [headings]), showRail);

  useNoIndex(preview);
  useTrackView(slug, ready && !preview);
  useDocumentMeta({
    title: post ? `${post.seo_title || post.title} | Kalpvriksh Global` : undefined,
    description: post ? post.seo_description || post.excerpt : undefined,
    image: post?.feature_image || undefined,
  });

  if (status === 'loading') return <BlogLayout><ArticleSkeleton /></BlogLayout>;
  if (status === 'missing') {
    return <BlogLayout><Message title="Article not found" text="It may have been moved or unpublished." /></BlogLayout>;
  }
  if (status === 'error') return <BlogLayout><Message title="We couldn't load this article" text={error} /></BlogLayout>;

  return (
    <BlogLayout progress={progress}>
      {preview && <PreviewBanner />}
      <Breadcrumbs post={post} />
      <article>
        <ArticleHeader post={post} />

        {post.feature_image && (
          <figure className="kj-wrap kj-ahero">
            <img src={post.feature_image} alt={post.feature_image_alt || post.title} width="1200" height="600" decoding="async" />
          </figure>
        )}

        <div className="kj-wrap kj-alayout">
          <aside className="kj-rail">
            {showRail && <ReadingRail headings={headings} activeId={activeId} />}
          </aside>

          <div className="kj-body">
            <ShareButtons title={post.title} />
            <TableOfContents headings={headings} />

            {post.external_url && !post.content ? (
              <a href={post.external_url} className="kj-btn" target="_blank" rel="noopener noreferrer">
                Read the full article ↗
              </a>
            ) : (
              <PostContent markdown={post.content} insertBefore={insertBefore} />
            )}
            {!insertBefore && newsletter}

            <TagList tags={post.tags} />
            <AuthorBox name={post.author_name} bio={post.author_bio} />
            <p className="kj-disclaimer"><strong>Disclaimer: </strong>{DISCLAIMER}</p>
          </div>
        </div>
      </article>

      <RelatedSection related={related} />
      <InviteCta title="Clarity begins with a conversation." text="Talk to Rakhi Jain about a plan that fits your goals, income and stage of life." />
    </BlogLayout>
  );
}
