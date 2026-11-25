import React, { useState } from 'react';

const COPIED_RESET_MS = 2000;

const ICON_PROPS = { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.6, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': 'true' };
const WhatsAppIcon = () => (
  <svg {...ICON_PROPS}><path d="M3 21l1.6-4.8A8.5 8.5 0 1 1 8 19.5L3 21z" /><path d="M9 9.5c0 3 2.5 5.5 5.5 5.5l1-1.5-2-1-.8.8a4 4 0 0 1-1.9-1.9l.8-.8-1-2L9 9.5z" /></svg>
);
const LinkedInIcon = () => (
  <svg {...ICON_PROPS}><rect x="3" y="3" width="18" height="18" rx="2" /><path d="M8 10v7M8 7v.01M12 17v-4a2 2 0 0 1 4 0v4M12 10v7" /></svg>
);
const LinkIcon = ({ done }) => (
  <svg {...ICON_PROPS}>{done ? <path d="M5 12l5 5 9-10" /> : <path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1" />}</svg>
);

/** WhatsApp, LinkedIn and copy-link sharing for the current page. */
export default function ShareButtons({ title }) {
  const [copied, setCopied] = useState(false);
  const url = window.location.href;

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), COPIED_RESET_MS);
    } catch (error) {
      window.prompt('Copy this link', url);
    }
  };

  return (
    <div className="kj-share" role="group" aria-label="Share this article">
      <span className="kj-label">Share</span>
      <a href={`https://wa.me/?text=${encodeURIComponent(`${title} ${url}`)}`} target="_blank" rel="noopener noreferrer">
        <WhatsAppIcon />WhatsApp
      </a>
      <a href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`} target="_blank" rel="noopener noreferrer">
        <LinkedInIcon />LinkedIn
      </a>
      <button type="button" onClick={copyLink}><LinkIcon done={copied} />{copied ? 'Link copied' : 'Copy link'}</button>
    </div>
  );
}
