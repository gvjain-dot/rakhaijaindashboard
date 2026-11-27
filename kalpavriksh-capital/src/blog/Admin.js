import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import PostEditor from './PostEditor';
import LoginForm from './admin/LoginForm';
import DashboardPanel from './admin/DashboardPanel';
import TaxonomyPanel from './admin/TaxonomyPanel';
import useAdminShortcuts from './admin/useAdminShortcuts';
import './styles/kj-base.css';
import './styles/kj-admin.css';
import { clearAllDrafts } from './admin/draftStorage';
import PostList from './admin/PostList';
import SubscribersPanel from './admin/SubscribersPanel';
import ConfirmDialog from './admin/ConfirmDialog';
import Toasts from './admin/Toasts';
import useToasts from './admin/useToasts';
import useTaxonomyNames, { mergeNames } from './admin/useTaxonomyNames';
import { bulkPosts, deletePost, duplicatePost, getStoredToken, listAdminPosts, storeToken, UnauthorizedError } from './api';

const plural = (count, word) => `${count} ${word}${count === 1 ? '' : 's'}`;
const BULK_MESSAGES = {
  publish: (count) => `Published ${plural(count, 'article')}`,
  unpublish: (count) => `Unpublished ${plural(count, 'article')}`,
  delete: (count) => `Deleted ${plural(count, 'article')}`,
  feature: () => 'Featured article updated',
};

function useNoIndex() {
  useEffect(() => {
    const previousTitle = document.title;
    const meta = document.createElement('meta');
    meta.name = 'robots';
    meta.content = 'noindex, nofollow';
    document.head.appendChild(meta);
    document.title = 'Admin | Kalpvriksh Global';
    return () => {
      document.head.removeChild(meta);
      document.title = previousTitle;
    };
  }, []);
}

function AdminHeader({ onLogout }) {
  return (
    <header className="kj-admin__header">
      <div className="kj-admin__header-in">
        <Link to="/blogs" className="kj-admin__brand" aria-label="Kalpvriksh Global blog">
          <img src="/kj/logo-full-color-trim.svg" alt="" height="38" />
          <span className="kj-admin__brand-label">Journal admin</span>
        </Link>
        <nav aria-label="Admin" className="kj-admin__links">
          <a href="/blogs" target="_blank" rel="noopener noreferrer" className="kj-admin__link kj-admin__link--outline">
            View site ↗
          </a>
          <button type="button" onClick={onLogout} className="kj-admin__link">Sign out</button>
        </nav>
      </div>
    </header>
  );
}

const SECTIONS = [
  { id: 'overview', label: 'Overview' },
  { id: 'articles', label: 'Articles' },
  { id: 'taxonomy', label: 'Categories & tags' },
  { id: 'subscribers', label: 'Subscribers' },
];

function SectionTabs({ section, onChange }) {
  return (
    <nav aria-label="Admin sections" className="mb-6 flex gap-1 overflow-x-auto border-b border-[#E2DDD4] sm:gap-2">
      {SECTIONS.map(({ id, label }) => (
        <button
          key={id}
          type="button"
          onClick={() => onChange(id)}
          aria-current={section === id ? 'page' : undefined}
          className={`-mb-px shrink-0 whitespace-nowrap border-b-2 px-3 py-2.5 sm:px-4 text-sm font-bold transition-colors ${
            section === id ? 'border-[#C4A747] text-[#1E5631]' : 'border-transparent text-[#6B7280] hover:text-[#1E5631]'
          }`}
        >
          {label}
        </button>
      ))}
    </nav>
  );
}

export default function Admin() {
  useNoIndex();
  const { toasts, notify, dismiss } = useToasts();
  const [token, setToken] = useState(getStoredToken);
  const [view, setView] = useState({ name: 'list', post: null });
  const [state, setState] = useState({ status: 'idle', posts: [], error: '' });
  const [pendingDelete, setPendingDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [section, setSection] = useState('overview');
  const searchRef = useRef(null);
  const [focusSearch, setFocusSearch] = useState(false);

  const logout = useCallback(
    (message) => {
      storeToken('');
      // Only an explicit sign-out wipes local drafts. When the session merely expired (a message is passed), they
      // are exactly what the writer needs back after signing in again.
      if (typeof message !== 'string') {
        try {
          clearAllDrafts(window.localStorage);
        } catch (error) {
          // storage blocked: nothing to clear
        }
      }
      setToken('');
      setView({ name: 'list', post: null });
      if (typeof message === 'string') notify(message, 'error');
    },
    [notify]
  );

  const sessionExpired = useCallback(() => logout('Your session expired. Please sign in again.'), [logout]);

  const taxonomy = useTaxonomyNames(token, sessionExpired);

  const load = useCallback(async () => {
    setState((current) => ({ ...current, status: 'loading', error: '' }));
    try {
      const data = await listAdminPosts(token);
      setState({ status: 'ready', posts: data.posts, error: '' });
    } catch (caught) {
      if (caught instanceof UnauthorizedError) return sessionExpired();
      setState((current) => ({ ...current, status: 'error', error: caught.message }));
    }
  }, [token, sessionExpired]);

  useEffect(() => {
    if (token) load();
  }, [token, load]);

  const handleLoggedIn = (newToken) => {
    storeToken(newToken);
    setToken(newToken);
  };

  const confirmDelete = async () => {
    const post = pendingDelete;
    setDeleting(true);
    try {
      await deletePost(token, post.id);
      setPendingDelete(null);
      notify(`Deleted “${post.title}”`);
      await load();
    } catch (caught) {
      if (caught instanceof UnauthorizedError) {
        setPendingDelete(null);
        return sessionExpired();
      }
      notify(caught.message, 'error');
    } finally {
      setDeleting(false);
    }
  };

  // PostList clears its selection only when this resolves, so failures are reported here and re-thrown.
  const handleBulk = async (action, ids) => {
    try {
      const data = await bulkPosts(token, action, ids);
      notify(BULK_MESSAGES[action](data.affected));
      await load();
    } catch (caught) {
      if (caught instanceof UnauthorizedError) sessionExpired();
      else notify(caught.message, 'error');
      throw caught;
    }
  };

  const handleDuplicate = async (post) => {
    try {
      await duplicatePost(token, post.id);
      notify(`Duplicated “${post.title}” as a draft`);
      await load();
    } catch (caught) {
      if (caught instanceof UnauthorizedError) return sessionExpired();
      notify(caught.message, 'error');
    }
    return undefined;
  };

  const backToList = (message) => {
    setView({ name: 'list', post: null });
    if (typeof message === 'string') notify(message);
    load();
  };

  const startNew = useCallback(() => setView({ name: 'edit', post: null }), []);
  const jumpToSearch = useCallback(() => {
    setSection('articles');
    setFocusSearch(true);
  }, []);
  useAdminShortcuts({ enabled: Boolean(token) && view.name === 'list', onNew: startNew, onSearch: jumpToSearch });

  // The search box only exists once the Articles tab is showing, so focus it after that render.
  useEffect(() => {
    if (focusSearch && section === 'articles' && searchRef.current) {
      searchRef.current.focus();
      setFocusSearch(false);
    }
  }, [focusSearch, section, state.status]);

  const editById = (id) => {
    const post = state.posts.find((candidate) => candidate.id === id);
    if (post) setView({ name: 'edit', post });
  };

  // Saved names (Categories & tags tab) plus anything articles already use.
  const categories = mergeNames(taxonomy.names.categories, state.posts.map((post) => post.category));
  const tagSuggestions = mergeNames(taxonomy.names.tags, state.posts.flatMap((post) => post.tags || []));

  return (
    <div className="kj-root kj-admin">
      {!token ? (
        <LoginForm onLoggedIn={handleLoggedIn} />
      ) : (
        <>
          <AdminHeader onLogout={() => logout()} />
          <main id="main" className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
            {view.name === 'edit' ? (
              <PostEditor
                token={token}
                post={view.post}
                categories={categories}
                tagSuggestions={tagSuggestions}
                onSaved={backToList}
                onCancel={() => backToList()}
                onUnauthorized={sessionExpired}
              />
            ) : (
              <>
                <SectionTabs section={section} onChange={setSection} />
                {section === 'overview' && <DashboardPanel token={token} onUnauthorized={sessionExpired} onEditPost={editById} />}
                {section === 'taxonomy' && <TaxonomyPanel token={token} onUnauthorized={sessionExpired} notify={notify} onChanged={() => { load(); taxonomy.refresh(); }} />}
                {section === 'subscribers' && <SubscribersPanel token={token} onUnauthorized={sessionExpired} notify={notify} />}
                {section === 'articles' && (
                  <PostList
                    posts={state.posts}
                    status={state.status}
                    error={state.error}
                    onRetry={load}
                    onNew={startNew}
                    searchRef={searchRef}
                    onEdit={(post) => setView({ name: 'edit', post })}
                    onDelete={setPendingDelete}
                    onBulk={handleBulk}
                    onDuplicate={handleDuplicate}
                  />
                )}
              </>
            )}
          </main>
        </>
      )}

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        title="Delete this article?"
        message={pendingDelete ? `“${pendingDelete.title}” will be permanently removed from the website. This cannot be undone.` : ''}
        confirmLabel="Delete article"
        tone="danger"
        busy={deleting}
        onConfirm={confirmDelete}
        onCancel={() => setPendingDelete(null)}
      />
      <Toasts toasts={toasts} onDismiss={dismiss} />
    </div>
  );
}
