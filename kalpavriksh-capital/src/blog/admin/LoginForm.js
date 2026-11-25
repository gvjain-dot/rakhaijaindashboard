import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { login } from '../api';

/** Password sign-in card. Calls onLoggedIn(token) on success. */
export default function LoginForm({ onLoggedIn }) {
  const [password, setPassword] = useState('');
  const [visible, setVisible] = useState(false);
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
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto flex min-h-screen min-h-[100dvh] max-w-md flex-col justify-center px-4 py-10">
      <form onSubmit={submit} className="relative overflow-hidden rounded-lg border border-[#E2DDD4] bg-white p-7 shadow-sm">
        <div className="absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-[#C4A747] via-[#D4AF37] to-[#C4A747]" aria-hidden="true" />
        <img src="/logo-full.svg" alt="Kalpvriksh Global" className="mx-auto h-16 w-auto" />
        <h1 className="mt-5 text-center kj-serif text-2xl font-bold text-[#1E5631]">Blog admin</h1>
        <p className="mt-1 text-center text-sm text-[#6B7280]">Sign in to manage your articles.</p>

        {error && <p role="alert" className="mt-5 rounded-md bg-red-50 p-3 text-sm text-red-700">{error}</p>}

        <label className="mt-5 block">
          <span className="mb-1 block text-sm font-bold text-[#2C3344]">Password</span>
          <div className="relative">
            <input
              type={visible ? 'text' : 'password'}
              autoComplete="current-password"
              autoFocus
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="w-full rounded-md border border-[#D9D3C7] px-3 py-2.5 pr-16 text-base outline-none focus:border-[#1E5631] focus:ring-2 focus:ring-[#C4A747]/40"
              required
            />
            <button
              type="button"
              onClick={() => setVisible(!visible)}
              aria-label={visible ? 'Hide password' : 'Show password'}
              className="absolute inset-y-0 right-0 px-3 text-xs font-bold text-[#1E5631]"
            >
              {visible ? 'Hide' : 'Show'}
            </button>
          </div>
        </label>

        <button type="submit" disabled={busy} className="mt-6 w-full rounded-md bg-[#1E5631] py-3 text-sm font-bold uppercase tracking-[0.08em] text-white transition-colors hover:bg-[#164426] disabled:opacity-60">
          {busy ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
      <Link to="/blogs" className="mt-5 text-center text-sm font-semibold text-[#1E5631] hover:underline">← Back to the blog</Link>
    </div>
  );
}
