import React, { useCallback, useEffect, useMemo, useState } from 'react';
import ConfirmDialog from './ConfirmDialog';
import { toCsv } from './csv';
import SubscriberGrowth from './SubscriberGrowth';
import { allSelected, pruneSelection, toggleId } from './selection';
import { deleteSubscriber, deleteSubscribers, listSubscribers, UnauthorizedError } from '../api';
import { formatDate } from '../format';

const CSV_COLUMNS = [
  { key: 'email', label: 'Email' },
  { key: 'source', label: 'Signed up on' },
  { key: 'created_at', label: 'Date' },
];
const SERIF = 'kj-serif';

function downloadCsv(rows) {
  const blob = new Blob([toCsv(CSV_COLUMNS, rows)], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `subscribers-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/** Admin tab: everyone who signed up for the newsletter, with search, delete and CSV export. */
export default function SubscribersPanel({ token, onUnauthorized, notify }) {
  const [state, setState] = useState({ status: 'loading', rows: [], error: '' });
  const [search, setSearch] = useState('');
  const [pending, setPending] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [selected, setSelected] = useState([]);
  const [confirmingBulk, setConfirmingBulk] = useState(false);

  const load = useCallback(async () => {
    setState((current) => ({ ...current, status: 'loading', error: '' }));
    try {
      const data = await listSubscribers(token);
      setState({ status: 'ready', rows: data.subscribers, error: '' });
    } catch (caught) {
      if (caught instanceof UnauthorizedError) return onUnauthorized();
      setState((current) => ({ ...current, status: 'error', error: caught.message }));
    }
  }, [token, onUnauthorized]);

  useEffect(() => {
    load();
  }, [load]);

  const query = search.trim().toLowerCase();
  const visible = useMemo(
    () => state.rows.filter((row) => !query || `${row.email} ${row.source || ''}`.toLowerCase().includes(query)),
    [state.rows, query]
  );

  const visibleIds = useMemo(() => visible.map((row) => row.id), [visible]);

  // A search or a removal can hide selected rows; never act on subscribers the admin cannot see.
  useEffect(() => {
    setSelected((current) => {
      const next = pruneSelection(current, visibleIds);
      return next.length === current.length ? current : next;
    });
  }, [visibleIds]);

  const confirmBulkDelete = async () => {
    setDeleting(true);
    try {
      const result = await deleteSubscribers(token, selected);
      notify(`${result.deleted} ${result.deleted === 1 ? 'subscriber' : 'subscribers'} removed`);
      setSelected([]);
      setConfirmingBulk(false);
      await load();
    } catch (caught) {
      if (caught instanceof UnauthorizedError) return onUnauthorized();
      notify(caught.message, 'error');
    } finally {
      setDeleting(false);
    }
    return undefined;
  };

  const confirmDelete = async () => {
    setDeleting(true);
    try {
      await deleteSubscriber(token, pending.id);
      notify('Subscriber removed');
      setPending(null);
      await load();
    } catch (caught) {
      if (caught instanceof UnauthorizedError) return onUnauthorized();
      notify(caught.message, 'error');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <section aria-labelledby="subscribers-heading">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 id="subscribers-heading" className={`${SERIF} text-3xl font-bold text-[#1E5631]`}>Subscribers</h1>
          <p className="mt-1 text-sm text-[#6B7280]">People who signed up for new-article emails from the blog.</p>
        </div>
        <button
          type="button"
          onClick={() => downloadCsv(visible)}
          disabled={visible.length === 0}
          className="rounded-md bg-[#C4A747] px-5 py-2.5 text-sm font-bold text-[#0F2818] hover:bg-[#D4AF37] disabled:opacity-50"
        >
          Download CSV{query ? ' (filtered)' : ''}
        </button>
      </div>

      {state.error && (
        <div role="alert" className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <span>{state.error}</span>
          <button type="button" onClick={load} className="rounded-md bg-red-700 px-3 py-1.5 font-bold text-white hover:bg-red-800">Try again</button>
        </div>
      )}

      {state.status === 'loading' && state.rows.length === 0 && <p role="status" className="text-sm text-[#6B7280]">Loading subscribers…</p>}

      {(state.status === 'ready' || state.rows.length > 0) && (
        <>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm font-semibold text-[#1E5631]">{state.rows.length} {state.rows.length === 1 ? 'subscriber' : 'subscribers'}</p>
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by email…"
              aria-label="Search subscribers"
              className="w-full rounded-md border border-[#D9D3C7] bg-white px-3 py-2.5 text-sm outline-none focus:border-[#1E5631] focus:ring-2 focus:ring-[#C4A747]/40 sm:max-w-xs"
            />
          </div>

          {state.rows.length > 0 && <SubscriberGrowth rows={state.rows} />}

          {state.rows.length === 0 ? (
            <div className="rounded-lg border border-[#E2DDD4] bg-white p-10 text-center">
              <p className={`${SERIF} text-xl font-semibold text-[#1E5631]`}>No subscribers yet</p>
              <p className="mx-auto mt-1 max-w-sm text-sm text-[#6B7280]">Signups from the form under each article will appear here.</p>
            </div>
          ) : (
            <>
            {visible.length > 0 && (
              <div className="mb-3 flex flex-wrap items-center gap-3">
                <label className="flex w-fit cursor-pointer items-center gap-2 text-xs font-bold text-[#1E5631]">
                  <input type="checkbox" className="h-4 w-4 accent-[#1E5631]" checked={allSelected(selected, visibleIds)} onChange={() => setSelected(allSelected(selected, visibleIds) ? [] : visibleIds)} aria-label="Select all subscribers" />
                  Select all
                </label>
                {selected.length > 0 && (
                  <>
                    <span className="text-xs font-bold text-[#1E5631]">{selected.length} selected</span>
                    <button type="button" onClick={() => setConfirmingBulk(true)} className="rounded-md border border-red-200 bg-white px-3 py-1.5 text-xs font-bold text-red-700 hover:bg-red-50">Remove selected</button>
                    <button type="button" onClick={() => setSelected([])} className="text-xs font-bold text-[#6B7280] underline underline-offset-4 hover:text-[#1E5631]">Clear selection</button>
                  </>
                )}
              </div>
            )}
            <ul className="divide-y divide-[#E2DDD4] overflow-hidden rounded-lg border border-[#E2DDD4] bg-white">
              {visible.map((row) => (
                <li key={row.id} className="flex flex-wrap items-center gap-3 px-4 py-3">
                  <input type="checkbox" className="h-4 w-4 shrink-0 accent-[#1E5631]" checked={selected.includes(row.id)} onChange={() => setSelected((current) => toggleId(current, row.id))} aria-label={`Select ${row.email}`} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold text-[#1E5631]">{row.email}</p>
                    <p className="text-xs text-[#6B7280]">
                      {formatDate(row.created_at)}{row.source ? ` · from “${row.source}”` : ''}
                    </p>
                  </div>
                  <button type="button" onClick={() => setPending(row)} aria-label={`Remove ${row.email}`} className="rounded-md border border-red-200 px-3 py-1.5 text-xs font-bold text-red-700 hover:bg-red-50">
                    Remove
                  </button>
                </li>
              ))}
              {visible.length === 0 && <li className="px-4 py-6 text-center text-sm text-[#6B7280]">No subscribers match your search.</li>}
            </ul>
            </>
          )}
        </>
      )}

      <ConfirmDialog
        open={Boolean(pending)}
        title="Remove this subscriber?"
        message={pending ? `${pending.email} will be removed from the list. They can sign up again later.` : ''}
        confirmLabel="Remove"
        tone="danger"
        busy={deleting}
        onConfirm={confirmDelete}
        onCancel={() => setPending(null)}
      />

      <ConfirmDialog
        open={confirmingBulk && selected.length > 0}
        title={`Remove ${selected.length} ${selected.length === 1 ? 'subscriber' : 'subscribers'}?`}
        message="They will be removed from the list. They can sign up again later."
        confirmLabel="Remove"
        tone="danger"
        busy={deleting}
        onConfirm={confirmBulkDelete}
        onCancel={() => setConfirmingBulk(false)}
      />
    </section>
  );
}
