import React, { useId, useState } from 'react';
import { subscribe } from './api';

/**
 * Email signup in the journal style. `variant` is "panel" (full-width forest panel inside the list) or
 * "inline" (light, placed mid-article). The hidden "website" field is a honeypot: people never see or fill
 * it, so a value in it means a bot, and the server quietly ignores that submission.
 */
export default function NewsletterSignup({ source = '', variant = 'panel' }) {
  const id = useId();
  const [email, setEmail] = useState('');
  const [website, setWebsite] = useState('');
  const [state, setState] = useState({ status: 'idle', message: '' });
  const sending = state.status === 'sending';

  const submit = async (event) => {
    event.preventDefault();
    setState({ status: 'sending', message: '' });
    try {
      await subscribe(email, source, website);
      setState({ status: 'done', message: '' });
    } catch (error) {
      setState({ status: 'error', message: error.message });
    }
  };

  return (
    <section className={`kj-news${variant === 'inline' ? ' kj-news--inline' : ''}`} aria-labelledby={`${id}-title`}>
      <div>
        <p className="kj-label">The Kalpvriksh Journal</p>
        <h2 id={`${id}-title`}>Perspectives, delivered quietly.</h2>
        <p className="kj-news__text">
          Practical ideas on investing and wealth building from Rakhi Jain. No spam, and you can leave any time.
        </p>
      </div>

      {state.status === 'done' ? (
        <div role="status" className="kj-form__success">
          <h3>Thank you, you're on the list.</h3>
          <p>We'll let you know when the next article is published.</p>
        </div>
      ) : (
        <form className="kj-form" onSubmit={submit}>
          <div className="kj-form__row">
            <label className="kj-sr" htmlFor={`${id}-email`}>Email address</label>
            <input
              id={`${id}-email`}
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
            />
            <button type="submit" className="kj-btn" disabled={sending}>
              {sending ? 'Subscribing…' : 'Subscribe'}
            </button>
          </div>
          {/* Honeypot: off-screen and ignored by assistive tech. */}
          <div aria-hidden="true" className="kj-hp">
            <label>
              Website
              <input type="text" name="website" tabIndex={-1} autoComplete="off" value={website} onChange={(event) => setWebsite(event.target.value)} />
            </label>
          </div>
          <p className={`kj-form__msg${state.status === 'error' ? ' kj-form__msg--error' : ''}`} role={state.status === 'error' ? 'alert' : undefined}>
            {state.status === 'error' ? state.message : ''}
          </p>
        </form>
      )}
    </section>
  );
}
