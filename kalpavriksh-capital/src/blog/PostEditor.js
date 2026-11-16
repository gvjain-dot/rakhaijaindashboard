import React, { useRef, useState } from 'react';
import PostContent from './PostContent';
import { createPost, updatePost, uploadImage, UnauthorizedError } from './api';
import { slugify } from './format';

const EMPTY_FORM = {
  title: '',
  slug: '',
  excerpt: '',
  category: '',
  feature_image: '',
  external_url: '',
  content: '',
  seo_title: '',
  seo_description: '',
  published: false,
};

const INPUT_CLASS =
  'w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-base outline-none focus:border-[#1E5631] focus:ring-2 focus:ring-[#1E5631]/20';

function formFromPost(post) {
  if (!post) return { ...EMPTY_FORM };
  return Object.keys(EMPTY_FORM).reduce(
    (form, key) => ({ ...form, [key]: post[key] ?? EMPTY_FORM[key] }),
    {}
  );
}

function Field({ label, hint, children }) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-semibold text-gray-700">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-xs text-gray-500">{hint}</span>}
    </label>
  );
}

export default function PostEditor({ token, post, categories, onSaved, onCancel, onUnauthorized }) {
  const [form, setForm] = useState(() => formFromPost(post));
  const [slugEdited, setSlugEdited] = useState(Boolean(post));
  const [tab, setTab] = useState('write');
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const fileInput = useRef(null);

  const setField = (name, value) => setForm((current) => ({ ...current, [name]: value }));

  const handleTitle = (value) => {
    setForm((current) => ({ ...current, title: value, slug: slugEdited ? current.slug : slugify(value) }));
  };

  const handleError = (caught) => {
    if (caught instanceof UnauthorizedError) return onUnauthorized();
    setError(caught.message);
  };

  const handleUpload = async (event) => {
    const file = event.target.files && event.target.files[0];
    if (!file) return;
    setError('');
    setUploading(true);
    try {
      setField('feature_image', await uploadImage(token, file));
    } catch (caught) {
      handleError(caught);
    } finally {
      setUploading(false);
      if (fileInput.current) fileInput.current.value = '';
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setSaving(true);
    try {
      if (post) await updatePost(token, post.id, form);
      else await createPost(token, form);
      onSaved();
    } catch (caught) {
      handleError(caught);
    } finally {
      setSaving(false);
    }
  };

  const tabClass = (name) =>
    `flex-1 rounded-md px-3 py-2 text-sm font-semibold lg:hidden ${tab === name ? 'bg-[#1E5631] text-white' : 'bg-gray-100 text-gray-700'}`;

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-xl font-bold text-[#1E5631] sm:text-2xl">{post ? 'Edit article' : 'New article'}</h2>
        <button type="button" onClick={onCancel} className="text-sm font-semibold text-gray-600 hover:underline">← Back to list</button>
      </div>

      {error && <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}

      <Field label="Title">
        <input className={INPUT_CLASS} value={form.title} onChange={(e) => handleTitle(e.target.value)} maxLength={200} required />
      </Field>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="URL slug" hint="Lowercase letters, numbers and hyphens">
          <input
            className={INPUT_CLASS}
            value={form.slug}
            onChange={(e) => { setSlugEdited(true); setField('slug', e.target.value); }}
            maxLength={100}
            required
          />
        </Field>
        <Field label="Category" hint="Pick an existing one or type a new one">
          <input className={INPUT_CLASS} list="category-options" value={form.category} onChange={(e) => setField('category', e.target.value)} maxLength={50} />
          <datalist id="category-options">
            {categories.map((name) => <option key={name} value={name} />)}
          </datalist>
        </Field>
      </div>

      <Field label="Excerpt" hint={`${form.excerpt.length}/500 – shown on cards and search results`}>
        <textarea className={INPUT_CLASS} rows={3} value={form.excerpt} onChange={(e) => setField('excerpt', e.target.value)} maxLength={500} required />
      </Field>

      <fieldset className="space-y-3 rounded-xl border border-gray-200 p-4">
        <legend className="px-1 text-sm font-semibold text-gray-700">Feature image</legend>
        <div className="flex flex-wrap items-center gap-3">
          <input ref={fileInput} type="file" accept="image/jpeg,image/png,image/webp" onChange={handleUpload} className="text-sm" aria-label="Upload feature image" />
          {uploading && <span className="text-sm text-gray-500">Uploading…</span>}
        </div>
        <input className={INPUT_CLASS} type="url" placeholder="…or paste an image URL" value={form.feature_image} onChange={(e) => setField('feature_image', e.target.value)} />
        {form.feature_image && <img src={form.feature_image} alt="Feature preview" className="aspect-video w-full max-w-sm rounded-lg object-cover" />}
      </fieldset>

      <Field label="External link (optional)" hint="Use for LinkedIn or other articles hosted elsewhere. The card will open this link instead of a post page.">
        <input className={INPUT_CLASS} value={form.external_url} onChange={(e) => setField('external_url', e.target.value)} placeholder="https://… or /page-path" />
      </Field>

      <div>
        <div className="mb-2 flex items-center justify-between gap-3">
          <span className="text-sm font-semibold text-gray-700">Content (Markdown)</span>
          <div className="flex w-48 gap-1 lg:hidden">
            <button type="button" aria-pressed={tab === 'write'} className={tabClass('write')} onClick={() => setTab('write')}>Write</button>
            <button type="button" aria-pressed={tab === 'preview'} className={tabClass('preview')} onClick={() => setTab('preview')}>Preview</button>
          </div>
        </div>
        <div className="grid gap-4 lg:grid-cols-2">
          <textarea
            aria-label="Content"
            className={`${INPUT_CLASS} min-h-[24rem] font-mono text-sm ${tab === 'preview' ? 'hidden lg:block' : ''}`}
            value={form.content}
            onChange={(e) => setField('content', e.target.value)}
            placeholder={'## Heading\n\nWrite your article in Markdown…'}
          />
          <div className={`min-h-[24rem] overflow-auto rounded-lg border border-gray-200 bg-white p-4 ${tab === 'write' ? 'hidden lg:block' : ''}`}>
            <PostContent markdown={form.content || '*Nothing to preview yet.*'} />
          </div>
        </div>
      </div>

      <details className="rounded-xl border border-gray-200 p-4">
        <summary className="cursor-pointer text-sm font-semibold text-gray-700">SEO (optional)</summary>
        <div className="mt-4 space-y-4">
          <Field label="SEO title" hint="Defaults to the article title">
            <input className={INPUT_CLASS} value={form.seo_title} onChange={(e) => setField('seo_title', e.target.value)} maxLength={120} />
          </Field>
          <Field label="SEO description" hint="Defaults to the excerpt">
            <textarea className={INPUT_CLASS} rows={2} value={form.seo_description} onChange={(e) => setField('seo_description', e.target.value)} maxLength={300} />
          </Field>
        </div>
      </details>

      <div className="flex flex-wrap items-center justify-between gap-4 border-t pt-5">
        <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
          <input type="checkbox" className="h-5 w-5 accent-[#1E5631]" checked={form.published} onChange={(e) => setField('published', e.target.checked)} />
          Published (visible on the website)
        </label>
        <button type="submit" disabled={saving || uploading} className="rounded-lg bg-[#1E5631] px-6 py-3 font-semibold text-white disabled:opacity-50">
          {saving ? 'Saving…' : form.published ? 'Save & publish' : 'Save draft'}
        </button>
      </div>
    </form>
  );
}
