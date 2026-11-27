import React from 'react';
import { Link } from 'react-router-dom';

const DEFAULT_TITLE = 'Some questions deserve a more personal conversation.';
const DEFAULT_TEXT = 'If something you read here raises a question about your own situation, we would be glad to talk it through.';

/** Closing invitation to get in touch. The wording can be overridden per page. */
export default function InviteCta({ title = DEFAULT_TITLE, text = DEFAULT_TEXT }) {
  return (
    <section className="kj-wrap kj-invite">
      <div className="kj-orn" aria-hidden="true" />
      <h2>{title}</h2>
      <p>{text}</p>
      <Link className="kj-btn" to="/?page=contact">Start a conversation</Link>
    </section>
  );
}
