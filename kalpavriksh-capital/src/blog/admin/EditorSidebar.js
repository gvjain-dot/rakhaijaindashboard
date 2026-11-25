import React, { useState } from 'react';
import ImageField from './ImageField';
import TagInput from './TagInput';
import CategorySelect from './CategorySelect';
import { Card, Field, INPUT_CLASS, ToggleSwitch } from './fields';
import { fromDateTimeLocal, isFuture, toDateTimeLocal } from './dateInput';

const COPIED_RESET_MS = 2000;

function formatWhen(iso) {
  return new Date(iso).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' });
}

function PreviewLink({ url }) {
  const [copied, setCopied] = useState(false);

  if (!url) {
    return <p className="mt-3 text-center text-[11px] text-[#6B7280]">Save the article to get a private preview link.</p>;
  }

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), COPIED_RESET_MS);
    } catch (error) {
      window.prompt('Copy this private preview link', url);
    }
  };

  return (
    <div className="mt-3 rounded-md bg-[#F7F5F0] p-3">
      <button type="button" onClick={copy} className="w-full rounded border border-[#D9D3C7] bg-white px-3 py-2 text-xs font-bold text-[#1E5631] hover:border-[#C4A747]">
        {copied ? 'Link copied ✓' : 'Copy private preview link'}
      </button>
      <p className="mt-1.5 text-[11px] leading-snug text-[#6B7280]">Anyone with this link can read the last saved version before it goes live. It is never indexed by search engines.</p>
    </div>
  );
}

function PublishCard({ form, setField, busy, submitLabel, previewUrl }) {
  const scheduled = form.published && isFuture(form.published_at);
  let publishNote = 'Draft — only visible here in the admin';
  if (scheduled) publishNote = `Scheduled — goes live ${formatWhen(form.published_at)}`;
  else if (form.published) publishNote = 'Visible to everyone on the website';

  return (
    <Card title="Publish">
      <ToggleSwitch checked={form.published} onChange={(value) => setField('published', value)} label="Published" description={publishNote} />

      <div className="mt-4">
        <Field label="Publish date" hint="Leave empty to publish as soon as you save. Choose a future date and time to schedule it.">
          <input
            type="datetime-local"
            className={INPUT_CLASS}
            value={toDateTimeLocal(form.published_at)}
            onChange={(event) => setField('published_at', fromDateTimeLocal(event.target.value))}
          />
        </Field>
        {form.published_at && (
          <button type="button" onClick={() => setField('published_at', '')} className="mt-1 text-xs font-bold text-[#1E5631] underline decoration-[#C4A747] underline-offset-4">
            Clear date
          </button>
        )}
      </div>

      <button
        type="submit"
        disabled={busy}
        className="mt-4 w-full rounded-md bg-[#1E5631] py-3 text-sm font-bold uppercase tracking-[0.08em] text-white transition-colors hover:bg-[#164426] disabled:opacity-60"
      >
        {submitLabel}
      </button>
      <p className="mt-2 text-center text-[11px] text-[#6B7280]">Tip: press Ctrl/⌘ + S to save</p>
      <PreviewLink url={previewUrl} />
    </Card>
  );
}

/** Right-hand column of the editor: publishing, feature image and details. SEO has its own tab. */
export default function EditorSidebar({
  form,
  setField,
  onSlugChange,
  categories,
  tagSuggestions,
  token,
  onUnauthorized,
  onUploadBusyChange,
  busy,
  submitLabel,
  showExternalLink,
  previewUrl,
}) {
  return (
    <aside className="space-y-4">
      <PublishCard form={form} setField={setField} busy={busy} submitLabel={submitLabel} previewUrl={previewUrl} />

      <Card title="Feature image">
        <ImageField
          token={token}
          value={form.feature_image}
          onChange={(value) => setField('feature_image', value)}
          onUnauthorized={onUnauthorized}
          onBusyChange={onUploadBusyChange}
        />
        {form.feature_image && (
          <div className="mt-3">
            <Field label="Alt text" hint="Describe the image in a few words. Used by screen readers and image search.">
              <input className={INPUT_CLASS} value={form.feature_image_alt} onChange={(event) => setField('feature_image_alt', event.target.value)} maxLength={200} />
            </Field>
          </div>
        )}
      </Card>

      <Card title="Details">
        <div className="space-y-4">
          <ToggleSwitch
            checked={Boolean(form.featured)}
            onChange={(value) => setField('featured', value)}
            label="Featured"
            description="Shown at the top of the blog. Only one article can be featured; choosing this replaces the current one."
          />
          <Field label="Author name" hint="Leave empty for Rakhi Jain. Used in the byline and search results.">
            <input className={INPUT_CLASS} value={form.author_name || ''} onChange={(event) => setField('author_name', event.target.value)} maxLength={80} />
          </Field>
          <Field label="Author bio" hint="A line or two shown under the article. Leave empty for the default bio.">
            <textarea className={INPUT_CLASS} rows={3} value={form.author_bio || ''} onChange={(event) => setField('author_bio', event.target.value)} maxLength={500} />
          </Field>
          <Field label="URL slug" hint={`Page address: /blogs/${form.slug || '…'}`}>
            <input className={INPUT_CLASS} value={form.slug} onChange={(event) => onSlugChange(event.target.value)} maxLength={100} required />
          </Field>
          <Field label="Category" hint="Pick one, or choose “+ New category…”. Manage the list under Categories & tags.">
            <CategorySelect value={form.category} categories={categories} onChange={(name) => setField('category', name)} />
          </Field>
          <div>
            <span className="mb-1 block text-sm font-bold text-[#2C3344]">Tags</span>
            <TagInput value={form.tags} onChange={(tags) => setField('tags', tags)} suggestions={tagSuggestions} />
            <span className="mt-1 block text-xs text-[#6B7280]">Up to 10. Pick from the list or type a new one. Readers can browse by tag, and related articles use them.</span>
          </div>
          {showExternalLink && (
            <Field label="External link" hint="This article opens a link elsewhere (e.g. LinkedIn) instead of a post page. Clear it to turn this into a normal article.">
              <input className={INPUT_CLASS} value={form.external_url} onChange={(event) => setField('external_url', event.target.value)} placeholder="https://… or /page-path" />
            </Field>
          )}
        </div>
      </Card>

    </aside>
  );
}
