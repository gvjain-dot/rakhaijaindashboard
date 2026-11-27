import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { formatDate } from '../format';
import ConfirmDialog from './ConfirmDialog';
import { isFuture } from './dateInput';
import ListToolbar from './ListToolbar';
import { applyPostView, categoriesOf, countByStatus } from './postFilters';
import { allSelected, pruneSelection, toggleId } from './selection';

const SKELETON_ROWS = 4;
const DEFAULT_VIEW = { status: 'all', category: '', query: '', sort: 'newest' };
const SERIF = 'kj-serif';

function Thumbnail({ post }) {
  if (post.feature_image) {
    return <img src={post.feature_image} alt="" loading="lazy" className="h-20 w-full shrink-0 rounded-md object-cover sm:w-32" />;
  }
  return (
    <div className="flex h-20 w-full shrink-0 items-center justify-center rounded-md bg-[#1E5631] sm:w-32" aria-hidden="true">
      <img src="/icon.svg" alt="" className="h-10 w-auto opacity-90" />
    </div>
  );
}

function StatusBadge({ published, scheduled }) {
  let style = 'bg-[#F5EDD6] text-[#7A5F0E]';
  let label = 'Draft';
  if (scheduled) {
    style = 'bg-[#E6EEF8] text-[#1F4E8C]';
    label = 'Scheduled';
  } else if (published) {
    style = 'bg-[#E3F1E7] text-[#1E5631]';
    label = 'Published';
  }
  return <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ${style}`}>{label}</span>;
}

function PostRow({ post, selected, onToggle, onEdit, onDelete, onDuplicate }) {
  const scheduled = post.published && isFuture(post.published_at);
  let dateLabel = post.published ? 'Published' : 'Created';
  if (scheduled) dateLabel = 'Goes live';
  const date = formatDate(post.published ? post.published_at || post.created_at : post.created_at);
  const showViews = post.published && typeof post.view_count === 'number';
  return (
    <li className={`flex flex-col gap-4 rounded-lg border bg-white p-4 transition-colors hover:border-[#C4A747] sm:flex-row sm:items-center ${selected ? 'border-[#1E5631]' : 'border-[#E2DDD4]'}`}>
      <input
        type="checkbox"
        checked={selected}
        onChange={() => onToggle(post.id)}
        aria-label={`Select ${post.title}`}
        className="h-5 w-5 shrink-0 accent-[#1E5631]"
      />
      <Thumbnail post={post} />
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <StatusBadge published={post.published} scheduled={scheduled} />
          {post.featured && <span className="rounded-full bg-[#1E5631] px-2.5 py-0.5 text-[11px] font-bold text-white">Featured</span>}
          {post.noindex && <span className="rounded-full bg-[#EFEAE0] px-2.5 py-0.5 text-[11px] font-bold text-[#6B7280]">Hidden from search</span>}
          {post.category &&<span className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#C4A747]">{post.category}</span>}
          {post.external_url && <span className="text-[11px] font-semibold text-[#6B7280]">External link ↗</span>}
        </div>
        <button type="button" onClick={() => onEdit(post)} className={`${SERIF} mt-1 block max-w-full truncate text-left text-lg font-semibold text-[#1E5631] hover:underline`}>
          {post.title}
        </button>
        <p className="mt-0.5 line-clamp-1 text-sm text-[#6B7280]">{post.excerpt}</p>
        <p className="mt-1 text-xs text-[#6B7280]">
          {dateLabel} {date}
          {showViews && <> · <span>{post.view_count.toLocaleString('en-US')} {post.view_count === 1 ? 'view' : 'views'}</span></>}
        </p>
      </div>
      <div className="flex shrink-0 gap-2">
        {post.published && !scheduled && !post.external_url && (
          <Link to={`/blogs/${post.slug}`} target="_blank" rel="noopener noreferrer" aria-label={`View ${post.title} on the site`} className="rounded-md border border-[#D9D3C7] px-3 py-2 text-sm font-bold text-[#1E5631] hover:border-[#C4A747]">
            View ↗
          </Link>
        )}
        <button type="button" onClick={() => onEdit(post)} aria-label={`Edit ${post.title}`} className="rounded-md bg-[#1E5631] px-4 py-2 text-sm font-bold text-white hover:bg-[#164426]">Edit</button>
        <button type="button" onClick={() => onDuplicate(post)} aria-label={`Duplicate ${post.title}`} className="rounded-md border border-[#D9D3C7] px-3 py-2 text-sm font-bold text-[#1E5631] hover:border-[#C4A747]">Duplicate</button>
        <button type="button" onClick={() => onDelete(post)} aria-label={`Delete ${post.title}`} className="rounded-md border border-red-200 px-3 py-2 text-sm font-bold text-red-700 hover:bg-red-50">Delete</button>
      </div>
    </li>
  );
}

function SkeletonRows() {
  return (
    <ul className="space-y-3" aria-hidden="true">
      {Array.from({ length: SKELETON_ROWS }, (_, index) => (
        <li key={index} className="flex animate-pulse gap-4 rounded-lg border border-[#E2DDD4] bg-white p-4">
          <div className="h-20 w-32 rounded-md bg-[#EFEAE0]" />
          <div className="flex-1 space-y-2 py-1">
            <div className="h-3 w-20 rounded bg-[#EFEAE0]" />
            <div className="h-5 w-2/3 rounded bg-[#EFEAE0]" />
            <div className="h-3 w-1/2 rounded bg-[#EFEAE0]" />
          </div>
        </li>
      ))}
    </ul>
  );
}

function Notice({ title, text, action }) {
  return (
    <div className="rounded-lg border border-[#E2DDD4] bg-white p-10 text-center">
      <p className={`${SERIF} text-xl font-semibold text-[#1E5631]`}>{title}</p>
      <p className="mx-auto mt-1 max-w-sm text-sm text-[#6B7280]">{text}</p>
      {action}
    </div>
  );
}

const primaryButton = 'rounded-md bg-[#C4A747] px-5 py-2.5 text-sm font-bold text-[#0F2818] hover:bg-[#D4AF37]';

const toolbarButton = 'rounded-md border border-[#D9D3C7] bg-white px-3 py-1.5 text-xs font-bold text-[#1E5631] hover:border-[#C4A747] disabled:cursor-not-allowed disabled:opacity-50';

function BulkToolbar({ count, busy, onAction, onDelete, onClear }) {
  return (
    <div role="toolbar" aria-label="Bulk actions" className="sticky top-2 z-20 mb-3 flex flex-wrap items-center gap-2 rounded-lg border border-[#1E5631] bg-[#F7F5F0] px-4 py-2.5 shadow-sm">
      <span className="mr-2 text-sm font-bold text-[#1E5631]">{count} selected</span>
      <button type="button" className={toolbarButton} disabled={busy} onClick={() => onAction('publish')}>Publish</button>
      <button type="button" className={toolbarButton} disabled={busy} onClick={() => onAction('unpublish')}>Unpublish</button>
      <button type="button" className={toolbarButton} disabled={busy || count !== 1} title={count === 1 ? undefined : 'Only one article can be featured'} onClick={() => onAction('feature')}>Feature</button>
      <button type="button" className="rounded-md border border-red-200 bg-white px-3 py-1.5 text-xs font-bold text-red-700 hover:bg-red-50 disabled:opacity-50" disabled={busy} onClick={onDelete}>Delete</button>
      <button type="button" className="ml-auto text-xs font-bold text-[#6B7280] underline underline-offset-4 hover:text-[#1E5631]" onClick={onClear}>Clear selection</button>
    </div>
  );
}

export default function PostList({ posts, status, error, onRetry, onEdit, onDelete, onNew, onBulk, onDuplicate, searchRef }) {
  const [view, setView] = useState(DEFAULT_VIEW);
  const [selected, setSelected] = useState([]);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [bulkBusy, setBulkBusy] = useState(false);

  const counts = useMemo(() => countByStatus(posts), [posts]);
  const categories = useMemo(() => categoriesOf(posts), [posts]);
  const visible = useMemo(() => applyPostView(posts, view), [posts, view]);
  const changeView = (patch) => setView((current) => ({ ...current, ...patch }));
  const visibleIds = useMemo(() => visible.map((post) => post.id), [visible]);

  // A filter, search or delete can hide selected rows; never act on articles the admin cannot see.
  useEffect(() => {
    setSelected((current) => {
      const next = pruneSelection(current, visibleIds);
      return next.length === current.length ? current : next;
    });
  }, [visibleIds]);

  const toggleAll = () => setSelected(allSelected(selected, visibleIds) ? [] : visibleIds);

  // The selection is cleared only on success, so a failed action can be retried without re-selecting.
  const runBulk = async (action) => {
    setBulkBusy(true);
    try {
      await onBulk(action, selected);
      setSelected([]);
    } catch (caught) {
      // The page that owns onBulk reports the error; keep the selection so the admin can try again.
    } finally {
      setBulkBusy(false);
      setConfirmingDelete(false);
    }
  };

  return (
    <section aria-labelledby="articles-heading">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 id="articles-heading" className={`${SERIF} text-3xl font-bold text-[#1E5631]`}>Articles</h1>
          <p className="mt-1 text-sm text-[#6B7280]">Write, edit and publish the articles shown on your website.</p>
        </div>
        <button type="button" onClick={onNew} className={primaryButton}>+ New article</button>
      </div>

      {error && (
        <div role="alert" className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <span>{error}</span>
          <button type="button" onClick={onRetry} className="rounded-md bg-red-700 px-3 py-1.5 font-bold text-white hover:bg-red-800">Try again</button>
        </div>
      )}

      {status === 'loading' && posts.length === 0 && <SkeletonRows />}

      {(status === 'ready' || posts.length > 0) && (
        <>
          <ListToolbar view={view} onChange={changeView} counts={counts} categories={categories} searchRef={searchRef} />

          {posts.length === 0 && (
            <Notice
              title="No articles yet"
              text="Create your first article to get started."
              action={<button type="button" onClick={onNew} className={`${primaryButton} mt-5`}>+ New article</button>}
            />
          )}
          {posts.length > 0 && visible.length === 0 && (
            <Notice
              title="No matching articles"
              text="Try a different search or filter."
              action={<button type="button" onClick={() => setView(DEFAULT_VIEW)} className="mt-5 text-sm font-bold text-[#1E5631] underline underline-offset-4">Clear filters</button>}
            />
          )}
          {visible.length > 0 && (
            <label className="mb-3 flex w-fit cursor-pointer items-center gap-2 text-xs font-bold text-[#1E5631]">
              <input type="checkbox" className="h-4 w-4 accent-[#1E5631]" checked={allSelected(selected, visibleIds)} onChange={toggleAll} aria-label="Select all articles" />
              Select all
            </label>
          )}
          {selected.length > 0 && (
            <BulkToolbar count={selected.length} busy={bulkBusy} onAction={runBulk} onDelete={() => setConfirmingDelete(true)} onClear={() => setSelected([])} />
          )}
          <ul className="space-y-3">
            {visible.map((post) => (
              <PostRow
                key={post.id}
                post={post}
                selected={selected.includes(post.id)}
                onToggle={(id) => setSelected((current) => toggleId(current, id))}
                onEdit={onEdit}
                onDelete={onDelete}
                onDuplicate={onDuplicate}
              />
            ))}
          </ul>
        </>
      )}

      <ConfirmDialog
        open={confirmingDelete && selected.length > 0}
        title={`Delete ${selected.length} ${selected.length === 1 ? 'article' : 'articles'}?`}
        message="They will be permanently removed from the website. This cannot be undone."
        confirmLabel="Delete articles"
        tone="danger"
        busy={bulkBusy}
        onConfirm={() => runBulk('delete')}
        onCancel={() => setConfirmingDelete(false)}
      />
    </section>
  );
}
