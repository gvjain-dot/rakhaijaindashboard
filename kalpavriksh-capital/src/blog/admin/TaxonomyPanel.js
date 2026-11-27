import React, { useCallback, useEffect, useState } from 'react';
import ConfirmDialog from './ConfirmDialog';
import { addTaxonomyTerm, changeTaxonomy, fetchTaxonomy, UnauthorizedError } from '../api';

const plural = (count, word) => `${count} ${word}${count === 1 ? '' : 's'}`;
const BUTTON = 'rounded-md border border-[#D9D3C7] bg-white px-3 py-1.5 text-xs font-bold text-[#1E5631] hover:border-[#C4A747]';

function Row({ item, kind, editing, names, busy, onEdit, onSave, onCancel, onRemove }) {
  const [value, setValue] = useState(item.name);
  const listId = `${kind}-names`;

  if (editing) {
    return (
      <li className="flex flex-wrap items-center gap-2 p-3">
        <input
          autoFocus
          aria-label={`New name for ${item.name}`}
          list={listId}
          value={value}
          onChange={(event) => setValue(event.target.value)}
          maxLength={kind === 'tag' ? 30 : 50}
          className="min-w-0 flex-1 rounded-md border border-[#D9D3C7] bg-white px-3 py-2 text-sm outline-none focus:border-[#1E5631]"
        />
        <datalist id={listId}>{names.filter((name) => name !== item.name).map((name) => <option key={name} value={name} />)}</datalist>
        <button type="button" disabled={busy || !value.trim()} onClick={() => onSave(value)} className="rounded-md bg-[#1E5631] px-3 py-1.5 text-xs font-bold text-white hover:bg-[#164426] disabled:opacity-60">Save</button>
        <button type="button" onClick={onCancel} className={BUTTON}>Cancel</button>
        <p className="w-full text-[11px] text-[#6B7280]">Pick an existing name to merge the two.</p>
      </li>
    );
  }
  return (
    <li className="flex flex-wrap items-center justify-between gap-2 p-3">
      <span className="min-w-0 truncate text-sm font-bold text-[#2C3344]">{item.name}</span>
      <span className="flex items-center gap-2">
        <span className="text-xs text-[#6B7280]">{plural(item.count, 'article')}</span>
        <button type="button" onClick={onEdit} aria-label={`Rename ${item.name}`} className={BUTTON}>Rename</button>
        <button type="button" onClick={onRemove} aria-label={`Remove ${item.name}`} className="rounded-md border border-red-200 bg-white px-3 py-1.5 text-xs font-bold text-red-700 hover:bg-red-50">Remove</button>
      </span>
    </li>
  );
}

/** "Add a new category/tag" box above each list. */
function AddForm({ kind, busy, onAdd }) {
  const [value, setValue] = useState('');
  const label = kind === 'tag' ? 'tag' : 'category';

  const submit = async (event) => {
    event.preventDefault();
    if (!value.trim()) return;
    if (await onAdd(kind, value)) setValue('');
  };

  return (
    <form onSubmit={submit} className="mb-3 flex gap-2">
      <input
        aria-label={`New ${label} name`}
        value={value}
        onChange={(event) => setValue(event.target.value)}
        maxLength={kind === 'tag' ? 30 : 50}
        placeholder={`Add a new ${label}…`}
        className="min-w-0 flex-1 rounded-md border border-[#D9D3C7] bg-white px-3 py-2 text-sm outline-none focus:border-[#1E5631]"
      />
      <button type="submit" disabled={busy || !value.trim()} className="rounded-md bg-[#1E5631] px-4 py-2 text-xs font-bold text-white hover:bg-[#164426] disabled:opacity-60">
        Add {label}
      </button>
    </form>
  );
}

function Group({ title, kind, items, state, onEdit, onSave, onCancel, onRemove, onAdd }) {
  const names = items.map((item) => item.name);
  return (
    <div>
      <h2 className="mb-3 text-[11px] font-bold uppercase tracking-[0.18em] text-[#C4A747]">{title}</h2>
      <AddForm kind={kind} busy={state.busy} onAdd={onAdd} />
      {items.length === 0 ? (
        <p className="rounded-lg border border-[#E2DDD4] bg-white p-6 text-sm text-[#6B7280]">None yet.</p>
      ) : (
        <ul aria-label={title} className="divide-y divide-[#E2DDD4] rounded-lg border border-[#E2DDD4] bg-white">
          {items.map((item) => (
            <Row
              key={item.name}
              item={item}
              kind={kind}
              names={names}
              busy={state.busy}
              editing={state.editing && state.editing.kind === kind && state.editing.name === item.name}
              onEdit={() => onEdit(kind, item.name)}
              onSave={(to) => onSave(kind, item.name, to)}
              onCancel={onCancel}
              onRemove={() => onRemove(kind, item.name)}
            />
          ))}
        </ul>
      )}
    </div>
  );
}

/** Admin tab: rename, merge or remove categories and tags across every article in one step. */
export default function TaxonomyPanel({ token, onUnauthorized, notify, onChanged }) {
  const [data, setData] = useState({ status: 'loading', categories: [], tags: [], error: '' });
  const [ui, setUi] = useState({ editing: null, removing: null, busy: false });

  const load = useCallback(async () => {
    try {
      const result = await fetchTaxonomy(token);
      setData({ status: 'ready', categories: result.categories, tags: result.tags, error: '' });
    } catch (caught) {
      if (caught instanceof UnauthorizedError) return onUnauthorized();
      setData((current) => ({ ...current, status: 'error', error: caught.message }));
    }
    return undefined;
  }, [token, onUnauthorized]);

  useEffect(() => {
    load();
  }, [load]);

  const apply = async (kind, from, to) => {
    setUi((current) => ({ ...current, busy: true }));
    try {
      const result = await changeTaxonomy(token, kind, from, to);
      notify(`${plural(result.affected, 'article')} updated`);
      setUi({ editing: null, removing: null, busy: false });
      if (onChanged) onChanged(); // the article list the editor works from is now out of date
      await load();
    } catch (caught) {
      if (caught instanceof UnauthorizedError) return onUnauthorized();
      notify(caught.message, 'error');
      setUi((current) => ({ ...current, busy: false }));
    }
    return undefined;
  };

  // Resolves true when the name was added, so the box can clear itself.
  const add = async (kind, name) => {
    setUi((current) => ({ ...current, busy: true }));
    try {
      const result = await addTaxonomyTerm(token, kind, name);
      notify(result.created ? `“${name.trim()}” added` : `“${name.trim()}” is already in the list`, result.created ? 'success' : 'error');
      if (onChanged) onChanged();
      await load();
      return result.created;
    } catch (caught) {
      if (caught instanceof UnauthorizedError) onUnauthorized();
      else notify(caught.message, 'error');
      return false;
    } finally {
      setUi((current) => ({ ...current, busy: false }));
    }
  };

  const group = { onAdd: add, state: ui, onEdit: (kind, name) => setUi({ ...ui, editing: { kind, name } }), onSave: apply, onCancel: () => setUi({ ...ui, editing: null }), onRemove: (kind, name) => setUi({ ...ui, removing: { kind, name } }) };
  const removing = ui.removing;

  return (
    <section aria-labelledby="taxonomy-heading">
      <h1 id="taxonomy-heading" className="kj-serif text-3xl font-bold text-[#1E5631]">Categories &amp; tags</h1>
      <p className="mt-1 text-sm text-[#6B7280]">Add new names here so they appear in the article editor. Rename a name to fix it everywhere, or rename it to an existing one to merge the two.</p>
      {data.status === 'loading' && <p className="mt-6 text-sm text-[#6B7280]" aria-busy="true">Loading…</p>}
      {data.status === 'error' && (
        <div role="alert" className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <span>{data.error}</span>
          <button type="button" onClick={load} className="rounded-md bg-red-700 px-3 py-1.5 font-bold text-white hover:bg-red-800">Try again</button>
        </div>
      )}
      {data.status === 'ready' && (
        <div className="mt-8 grid gap-8 lg:grid-cols-2">
          <Group title="Categories" kind="category" items={data.categories} {...group} />
          <Group title="Tags" kind="tag" items={data.tags} {...group} />
        </div>
      )}
      <ConfirmDialog
        open={Boolean(removing)}
        title={removing ? `Remove “${removing.name}”?` : ''}
        message={`It will be taken off every article that uses it. The articles themselves are not deleted.`}
        confirmLabel="Remove"
        tone="danger"
        busy={ui.busy}
        onConfirm={() => apply(removing.kind, removing.name, '')}
        onCancel={() => setUi({ ...ui, removing: null })}
      />
    </section>
  );
}
