import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import PostEditor from './PostEditor';
import { deletePost, getStoredToken, listAdminPosts, login, storeToken, UnauthorizedError } from './api';
import { formatDate } from './format';

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

function LoginForm({ onLoggedIn }) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    setBusy(true);
    setError('');
    try {
      const { token } = await login(password);
      onLoggedIn(token);
    } catch (caught) {
      setError(caught.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} className="mx-auto mt-16 w-full max-w-sm space-y-4 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-black/5">
      <img src="/logo-full.svg" alt="Kalpvriksh Global" className="mx-auto h-16 w-auto" />
      <h1 className="text-center text-xl font-bold text-[#1E5631]">Blog admin</h1>
      {error && <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
      <label className="block">
        <span className="mb-1 block text-sm font-semibold text-gray-700">Password</span>
        <input
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-base outline-none focus:border-[#1E5631] focus:ring-2 focus:ring-[#1E5631]/20"
          required
        />
      </label>
      <button type="submit" disabled={busy} className="w-full rounded-lg bg-[#1E5631] py-3 font-semibold text-white disabled:opacity-50">
        {busy ? 'Signing in…' : 'Sign in'}
      </button>
    </form>
  );
}

function PostRow({ post, onEdit, onDelete }) {
  return (
    <li className="flex flex-col gap-3 rounded-xl bg-white p-4 ring-1 ring-black/5 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        <p className="truncate font-semibold text-[#1E5631]">{post.title}</p>
        <p className="mt-1 text-xs text-gray-500">
          <span className={`mr-2 rounded-full px-2 py-0.5 font-semibold ${post.published ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'}`}>
            {post.published ? 'Published' : 'Draft'}
          </span>
          {post.category && `${post.category} · `}
          {formatDate(post.published_at || post.created_at)}
        </p>
      </div>
      <div className="flex shrink-0 gap-2">
        {post.published && !post.external_url && (
          <Link to={`/blogs/${post.slug}`} className="rounded-lg px-3 py-2 text-sm font-semibold text-[#1E5631] ring-1 ring-[#1E5631]/30">View</Link>
        )}
        <button type="button" onClick={() => onEdit(post)} aria-label={`Edit ${post.title}`} className="rounded-lg bg-[#1E5631] px-3 py-2 text-sm font-semibold text-white">Edit</button>
        <button type="button" onClick={() => onDelete(post)} aria-label={`Delete ${post.title}`} className="rounded-lg px-3 py-2 text-sm font-semibold text-red-700 ring-1 ring-red-200">Delete</button>
      </div>
    </li>
  );
}

export default function Admin() {
  useNoIndex();
  const [token, setToken] = useState(getStoredToken);
  const [view, setView] = useState({ name: 'list', post: null });
  const [state, setState] = useState({ status: 'idle', posts: [], error: '' });

  const logout = useCallback(() => {
    storeToken('');
    setToken('');
    setView({ name: 'list', post: null });
  }, []);

  const load = useCallback(async () => {
    setState((current) => ({ ...current, status: 'loading', error: '' }));
    try {
      const data = await listAdminPosts(token);
      setState({ status: 'ready', posts: data.posts, error: '' });
    } catch (caught) {
      if (caught instanceof UnauthorizedError) return logout();
      setState((current) => ({ ...current, status: 'error', error: caught.message }));
    }
  }, [token, logout]);

  useEffect(() => {
    if (token) load();
  }, [token, load]);

  const handleLoggedIn = (newToken) => {
    storeToken(newToken);
    setToken(newToken);
  };

  const handleDelete = async (post) => {
    if (!window.confirm(`Delete "${post.title}"? This cannot be undone.`)) return;
    try {
      await deletePost(token, post.id);
      await load();
    } catch (caught) {
      if (caught instanceof UnauthorizedError) return logout();
      setState((current) => ({ ...current, error: caught.message }));
    }
  };

  const backToList = () => {
    setView({ name: 'list', post: null });
    load();
  };

  const categories = [...new Set(state.posts.map((post) => post.category).filter(Boolean))];

  return (
    <div className="min-h-screen min-h-[100dvh] bg-[#FAF7F2] px-4 py-6 sm:px-6">
      {!token ? (
        <LoginForm onLoggedIn={handleLoggedIn} />
      ) : (
        <div className="mx-auto max-w-5xl">
          <header className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <Link to="/blogs" className="flex items-center gap-2 font-bold text-[#1E5631]">
              <img src="/icon.svg" alt="" className="h-9 w-auto" /> Blog admin
            </Link>
            <button type="button" onClick={logout} className="text-sm font-semibold text-gray-600 hover:underline">Sign out</button>
          </header>

          {view.name === 'edit' ? (
            <PostEditor
              token={token}
              post={view.post}
              categories={categories}
              onSaved={backToList}
              onCancel={backToList}
              onUnauthorized={logout}
            />
          ) : (
            <>
              <div className="mb-4 flex items-center justify-between gap-3">
                <h1 className="text-2xl font-bold text-[#1E5631]">Articles</h1>
                <button type="button" onClick={() => setView({ name: 'edit', post: null })} className="rounded-lg bg-[#C4A747] px-4 py-2.5 font-semibold text-[#1E5631]">
                  + New article
                </button>
              </div>
              {state.error && <p role="alert" className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{state.error}</p>}
              {state.status === 'loading' && <p role="status" className="text-gray-500">Loading…</p>}
              {state.status === 'ready' && state.posts.length === 0 && <p className="rounded-xl bg-white p-8 text-center text-gray-600">No articles yet. Create your first one.</p>}
              <ul className="space-y-3">
                {state.posts.map((post) => (
                  <PostRow key={post.id} post={post} onEdit={(selected) => setView({ name: 'edit', post: selected })} onDelete={handleDelete} />
                ))}
              </ul>
            </>
          )}
        </div>
      )}
    </div>
  );
}
