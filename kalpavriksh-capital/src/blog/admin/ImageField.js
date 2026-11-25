import React, { useEffect, useRef, useState } from 'react';
import { uploadImage, UnauthorizedError } from '../api';

const ACCEPT = 'image/jpeg,image/png,image/webp';

/**
 * Feature image picker: drag-and-drop or click to upload, live preview with replace/remove,
 * and a URL fallback. `onBusyChange(true|false)` lets the parent block saving mid-upload.
 */
export default function ImageField({ token, value, onChange, onUnauthorized, onBusyChange, label = 'feature image' }) {
  const inputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState('');
  const [broken, setBroken] = useState(false);

  useEffect(() => {
    if (onBusyChange) onBusyChange(uploading);
  }, [uploading, onBusyChange]);

  useEffect(() => {
    setBroken(false);
  }, [value]);

  const upload = async (file) => {
    if (!file) return;
    setError('');
    setUploading(true);
    try {
      onChange(await uploadImage(token, file));
    } catch (caught) {
      if (caught instanceof UnauthorizedError) {
        onUnauthorized();
        return;
      }
      setError(caught.message);
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  const openPicker = () => {
    if (!uploading && inputRef.current) inputRef.current.click();
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setDragging(false);
    upload(event.dataTransfer.files && event.dataTransfer.files[0]);
  };

  return (
    <div className="space-y-3">
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT}
        className="sr-only"
        tabIndex={-1}
        aria-label={`Upload ${label}`}
        onChange={(event) => upload(event.target.files && event.target.files[0])}
      />

      {value ? (
        <figure className="overflow-hidden rounded-md border border-[#E2DDD4] bg-[#F7F5F0]">
          {broken ? (
            <p className="p-4 text-sm text-red-700">This image could not be loaded. Check the link or upload a new one.</p>
          ) : (
            <img src={value} alt={`${label} preview`} className="aspect-video w-full object-cover" onError={() => setBroken(true)} />
          )}
          <figcaption className="flex gap-2 border-t border-[#E2DDD4] bg-white p-2">
            <button type="button" onClick={openPicker} disabled={uploading} className="flex-1 rounded border border-[#D9D3C7] px-3 py-1.5 text-xs font-bold text-[#1E5631] hover:border-[#C4A747] disabled:opacity-50">
              {uploading ? 'Uploading…' : 'Replace'}
            </button>
            <button type="button" onClick={() => onChange('')} disabled={uploading} className="flex-1 rounded border border-red-200 px-3 py-1.5 text-xs font-bold text-red-700 hover:bg-red-50 disabled:opacity-50">
              Remove
            </button>
          </figcaption>
        </figure>
      ) : (
        <div
          role="button"
          tabIndex={0}
          aria-busy={uploading}
          aria-label={`Choose or drop a ${label}`}
          onClick={openPicker}
          onKeyDown={(event) => {
            if (event.key === 'Enter' || event.key === ' ') {
              event.preventDefault();
              openPicker();
            }
          }}
          onDragOver={(event) => { event.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          className={`flex cursor-pointer flex-col items-center justify-center gap-1 rounded-md border-2 border-dashed px-4 py-8 text-center transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#C4A747] ${
            dragging ? 'border-[#C4A747] bg-[#F5EDD6]' : 'border-[#D9D3C7] bg-white hover:border-[#C4A747]'
          }`}
        >
          {uploading ? (
            <>
              <span className="h-6 w-6 animate-spin rounded-full border-2 border-[#E2DDD4] border-t-[#1E5631]" aria-hidden="true" />
              <span className="text-sm font-semibold text-[#1E5631]">Uploading…</span>
            </>
          ) : (
            <>
              <span className="text-sm font-bold text-[#1E5631]">Drop an image here, or click to upload</span>
              <span className="text-xs text-[#6B7280]">JPEG, PNG or WebP · up to 4 MB</span>
            </>
          )}
        </div>
      )}

      {error && <p role="alert" className="rounded-md bg-red-50 p-3 text-xs leading-relaxed text-red-700">{error}</p>}

      <details className="text-xs text-[#6B7280]">
        <summary className="cursor-pointer font-semibold text-[#1E5631]">Or use an image URL</summary>
        <input
          type="url"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder="https://…"
          aria-label={`${label} URL`}
          className="mt-2 w-full rounded-md border border-[#D9D3C7] bg-white px-3 py-2 text-sm text-[#2C3344] outline-none focus:border-[#1E5631] focus:ring-2 focus:ring-[#C4A747]/40"
        />
      </details>
    </div>
  );
}
