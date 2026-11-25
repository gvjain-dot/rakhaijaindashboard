import React, { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { uploadImage, UnauthorizedError } from '../api';
import { IMAGE_LAYOUTS, buildImageMarkdown } from '../imageMarkdown';
import { INPUT_CLASS } from './fields';

const ACCEPT = 'image/jpeg,image/png,image/webp';
const LABEL_CLASS = 'mb-1 block text-xs font-bold text-[#2C3344]';

/**
 * Modal for adding an image to an article: upload (or paste a link), alt text, caption and layout.
 * `initialFile` lets a pasted or dropped file start uploading as soon as the dialog opens.
 * Calls `onInsert(markdown)` with the finished Markdown line.
 */
export default function ImageInsertDialog({ token, initialFile, onInsert, onClose, onUnauthorized }) {
  const inputRef = useRef(null);
  const [url, setUrl] = useState('');
  const [alt, setAlt] = useState('');
  const [caption, setCaption] = useState('');
  const [layout, setLayout] = useState('normal');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const upload = useCallback(
    async (file) => {
      if (!file) return;
      setError('');
      setUploading(true);
      try {
        setUrl(await uploadImage(token, file));
      } catch (caught) {
        if (caught instanceof UnauthorizedError) {
          onUnauthorized();
          return;
        }
        setError(caught.message);
      } finally {
        setUploading(false);
      }
    },
    [token, onUnauthorized]
  );

  useEffect(() => {
    if (initialFile) upload(initialFile);
    // Only the file the dialog was opened with is uploaded automatically.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialFile]);

  useEffect(() => {
    const onKey = (event) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  const markdown = buildImageMarkdown({ url, alt, caption, layout });
  const submit = (event) => {
    // The editor is itself a <form>; React events bubble out of portals, so keep this submit to ourselves.
    event.preventDefault();
    event.stopPropagation();
    if (markdown && !uploading) onInsert(markdown);
  };

  return createPortal(
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <form role="dialog" aria-modal="true" aria-label="Insert image" onSubmit={submit} className="max-h-[92vh] w-full max-w-lg space-y-4 overflow-auto rounded-lg bg-white p-5 shadow-xl">
        <h2 className="text-lg font-bold text-[#1E5631]">Insert image</h2>

        <div>
          <input ref={inputRef} type="file" accept={ACCEPT} className="sr-only" tabIndex={-1} aria-label="Choose image file" onChange={(event) => { upload(event.target.files && event.target.files[0]); event.target.value = ''; }} />
          {url ? <img src={url} alt="" className="mb-2 max-h-48 w-full rounded border border-[#E2DDD4] object-contain" /> : null}
          <button type="button" disabled={uploading} onClick={() => inputRef.current && inputRef.current.click()} className="rounded border border-[#1E5631] px-3 py-1.5 text-sm font-bold text-[#1E5631] hover:bg-[#F5EDD6] disabled:opacity-50">
            {uploading ? 'Uploading…' : url ? 'Replace image' : 'Upload image'}
          </button>
          <span className="ml-2 text-xs text-[#6B7280]">JPEG, PNG or WebP, up to 4 MB</span>
          {error ? <p role="alert" className="mt-2 text-sm text-red-700">{error}</p> : null}
        </div>

        <div>
          <label className={LABEL_CLASS} htmlFor="image-url">Image link</label>
          <input id="image-url" className={INPUT_CLASS} value={url} onChange={(event) => setUrl(event.target.value)} placeholder="https://…" />
        </div>
        <div>
          <label className={LABEL_CLASS} htmlFor="image-alt">Alt text <span className="font-normal text-[#6B7280]">(describes the image for screen readers and search)</span></label>
          <input id="image-alt" className={INPUT_CLASS} value={alt} onChange={(event) => setAlt(event.target.value)} />
        </div>
        <div>
          <label className={LABEL_CLASS} htmlFor="image-caption">Caption <span className="font-normal text-[#6B7280]">(optional, shown under the image)</span></label>
          <input id="image-caption" className={INPUT_CLASS} value={caption} onChange={(event) => setCaption(event.target.value)} />
        </div>
        <div>
          <label className={LABEL_CLASS} htmlFor="image-layout">Layout</label>
          <select id="image-layout" className={INPUT_CLASS} value={layout} onChange={(event) => setLayout(event.target.value)}>
            {IMAGE_LAYOUTS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
          </select>
        </div>

        <div className="flex justify-end gap-2">
          <button type="button" onClick={onClose} className="rounded border border-[#D9D3C7] px-4 py-2 text-sm font-bold text-[#2C3344]">Cancel</button>
          <button type="submit" disabled={!markdown || uploading} className="rounded bg-[#1E5631] px-4 py-2 text-sm font-bold text-white disabled:opacity-50">Insert</button>
        </div>
      </form>
    </div>,
    document.body
  );
}
