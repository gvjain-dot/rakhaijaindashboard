import React, { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { parseImageSrc } from './imageMarkdown';

function Lightbox({ src, alt, caption, onClose }) {
  const closeRef = useRef(null);

  useEffect(() => {
    const opener = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    if (closeRef.current) closeRef.current.focus();
    const onKey = (event) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = previousOverflow;
      if (opener && opener.focus) opener.focus();
    };
  }, [onClose]);

  return createPortal(
    <div className="kj-lightbox" role="dialog" aria-modal="true" aria-label={alt || 'Enlarged image'} onClick={onClose}>
      <button ref={closeRef} type="button" className="kj-lightbox__close" aria-label="Close image" onClick={onClose}>×</button>
      <figure className="kj-lightbox__fig" onClick={(event) => event.stopPropagation()}>
        <img src={src} alt={alt || ''} />
        {caption ? <figcaption>{caption}</figcaption> : null}
      </figure>
    </div>,
    document.body
  );
}

/**
 * An image that sits on its own line in an article: optional caption, a layout (normal / wide / full / floated)
 * read from the src fragment, and click-to-enlarge.
 */
export default function ArticleFigure({ src, alt, caption }) {
  const { src: address, layout } = parseImageSrc(src);
  const [open, setOpen] = useState(false);
  const close = useCallback(() => setOpen(false), []);

  return (
    <>
      <figure className={`kj-fig kj-fig--${layout}`}>
        <button type="button" className="kj-fig__btn" onClick={() => setOpen(true)} aria-label={`Enlarge image${alt ? `: ${alt}` : ''}`}>
          <img src={address} alt={alt || ''} loading="lazy" />
        </button>
        {caption ? <figcaption>{caption}</figcaption> : null}
      </figure>
      {open ? <Lightbox src={address} alt={alt} caption={caption} onClose={close} /> : null}
    </>
  );
}
