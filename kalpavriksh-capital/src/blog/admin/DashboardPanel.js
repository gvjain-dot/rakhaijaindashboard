import React, { useCallback, useEffect, useState } from 'react';
import { fetchStats, UnauthorizedError } from '../api';
import AttentionList from './AttentionList';
import ViewsChart from './ViewsChart';

const SERIF = 'kj-serif';
const formatCount = (value) => Number(value || 0).toLocaleString('en-US');

function StatTile({ label, value, hint }) {
  return (
    <li className="rounded-lg border border-[#E2DDD4] bg-white p-4">
      <p className={`${SERIF} text-3xl font-bold text-[#1E5631]`}>{formatCount(value)}</p>
      <p className="mt-1 text-[11px] font-bold uppercase tracking-[0.14em] text-[#6B7280]">{label}</p>
      {hint && <p className="mt-1 text-xs font-semibold text-[#1E5631]">{hint}</p>}
    </li>
  );
}

/** The most-read articles, each with a bar sized relative to the leader. Plain CSS, no chart library. */
function TopPosts({ posts }) {
  if (posts.length === 0) {
    return <p className="rounded-lg border border-[#E2DDD4] bg-white p-6 text-sm text-[#6B7280]">No views recorded yet. They appear here once readers open your articles.</p>;
  }
  const most = Math.max(...posts.map((post) => post.view_count), 1);
  return (
    <ol aria-label="Most read articles" className="space-y-3">
      {posts.map((post) => (
        <li key={post.id} className="rounded-lg border border-[#E2DDD4] bg-white p-4">
          <div className="flex items-baseline justify-between gap-3">
            <span className="min-w-0 truncate text-sm font-bold text-[#2C3344]">{post.title}</span>
            <span className="shrink-0 text-sm text-[#6B7280]">{formatCount(post.view_count)} views</span>
          </div>
          <div className="mt-2 h-1.5 rounded-full bg-[#EFEAE0]" aria-hidden="true">
            <div data-bar className="h-full rounded-full bg-[#1E5631]" style={{ width: `${Math.round((post.view_count / most) * 100)}%` }} />
          </div>
        </li>
      ))}
    </ol>
  );
}

/** Admin overview: how many articles are live, drafted or scheduled, subscribers, and what people read. */
export default function DashboardPanel({ token, onUnauthorized, onEditPost }) {
  const [state, setState] = useState({ status: 'loading', stats: null, error: '' });

  const load = useCallback(async () => {
    setState((current) => ({ ...current, status: 'loading', error: '' }));
    try {
      const data = await fetchStats(token);
      setState({ status: 'ready', stats: data.stats, error: '' });
    } catch (caught) {
      if (caught instanceof UnauthorizedError) return onUnauthorized();
      setState({ status: 'error', stats: null, error: caught.message });
    }
    return undefined;
  }, [token, onUnauthorized]);

  useEffect(() => {
    load();
  }, [load]);

  const { status, stats, error } = state;

  return (
    <section aria-labelledby="overview-heading">
      <h1 id="overview-heading" className={`${SERIF} text-3xl font-bold text-[#1E5631]`}>Overview</h1>
      <p className="mt-1 text-sm text-[#6B7280]">A quick look at your articles, readers and subscribers.</p>

      {status === 'loading' && <p className="mt-6 text-sm text-[#6B7280]" aria-busy="true">Loading…</p>}

      {status === 'error' && (
        <div role="alert" className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <span>{error}</span>
          <button type="button" onClick={load} className="rounded-md bg-red-700 px-3 py-1.5 font-bold text-white hover:bg-red-800">Try again</button>
        </div>
      )}

      {status === 'ready' && (
        <>
          <ul aria-label="Summary" className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
            <StatTile label="Published" value={stats.published} />
            <StatTile label="Drafts" value={stats.drafts} />
            <StatTile label="Scheduled" value={stats.scheduled} />
            <StatTile label="Subscribers" value={stats.subscribers} hint={stats.newSubscribers30d ? `+${stats.newSubscribers30d} in 30 days` : undefined} />
            <StatTile label="Views, last 30 days" value={stats.views30d} />
            <StatTile label="Views, all time" value={stats.totalViews} />
          </ul>

          {stats.daily && stats.daily.length > 0 && (
            <div className="mt-8">
              <ViewsChart daily={stats.daily} />
            </div>
          )}

          <div className="mt-10 grid gap-8 lg:grid-cols-2">
            <div>
              <h2 className="mb-3 text-[11px] font-bold uppercase tracking-[0.18em] text-[#C4A747]">Most read</h2>
              <TopPosts posts={stats.topPosts} />
            </div>
            <div>
              <h2 className="mb-3 text-[11px] font-bold uppercase tracking-[0.18em] text-[#C4A747]">Needs attention</h2>
              <AttentionList posts={stats.attention || []} onEdit={onEditPost || (() => {})} />
            </div>
          </div>
          <p className="mt-4 text-xs text-[#6B7280]">
            View counts are approximate: each reader counts once per article per day, and bots, prefetches and
            visitors who block scripts or send Do Not Track are not counted.
          </p>
        </>
      )}
    </section>
  );
}
