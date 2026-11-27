import React, { useDeferredValue, useEffect, useMemo, useRef, useState } from 'react';
import PostContent from './PostContent';
import ConfirmDialog from './admin/ConfirmDialog';
import EditorSidebar from './admin/EditorSidebar';
import EditorTabs from './admin/EditorTabs';
import SeoCard from './admin/SeoCard';
import { analyzeSeo } from './admin/seoAnalysis';
import MarkdownToolbar from './admin/MarkdownToolbar';
import ImageInsertDialog from './admin/ImageInsertDialog';
import { insertBlock } from './imageMarkdown';
import { Counter, Field, INPUT_CLASS } from './admin/fields';
import { countWords } from './admin/markdownFormat';
import useDraftAutosave from './admin/useDraftAutosave';
import { createPost, updatePost, ConflictError, UnauthorizedError } from './api';
import { isFuture } from './admin/dateInput';
import { readingTimeLabel, slugify } from './format';

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
  feature_image_alt: '',
  social_image: '',
  canonical_url: '',
  noindex: false,
  focus_keyword: '',
  tags: [],
  featured: false,
  author_name: '',
  author_bio: '',
  published: false,
  published_at: '',
};
const EXCERPT_MAX = 500;
const WORDS_PER_MINUTE = 200;

function formFromPost(post) {
  if (!post) return { ...EMPTY_FORM };
  return Object.keys(EMPTY_FORM).reduce(
    (form, key) => ({ ...form, [key]: post[key] ?? EMPTY_FORM[key] }),
    {}
  );
}

/** Warns before the tab is closed or reloaded while there are unsaved edits. */
function useUnsavedChangesWarning(active) {
  useEffect(() => {
    if (!active) return undefined;
    const warn = (event) => {
      event.preventDefault();
      event.returnValue = '';
    };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [active]);
}

/** Ctrl/Cmd+S submits the given form. */
function useSaveShortcut(formRef) {
  useEffect(() => {
    const onKeyDown = (event) => {
      if (!(event.metaKey || event.ctrlKey) || event.key.toLowerCase() !== 's') return;
      event.preventDefault();
      const form = formRef.current;
      if (form && form.requestSubmit) form.requestSubmit();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [formRef]);
}

function StatusBadge({ published }) {
  return (
    <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ${published ? 'bg-[#E3F1E7] text-[#1E5631]' : 'bg-[#F5EDD6] text-[#7A5F0E]'}`}>
      {published ? 'Published' : 'Draft'}
    </span>
  );
}

/** A private link to the last saved version, for drafts and scheduled posts that are not live yet. */
function buildPreviewUrl(post) {
  if (!post || !post.preview_token || post.external_url) return '';
  const live = post.published && !isFuture(post.published_at);
  return live ? '' : `${window.location.origin}/blogs/${post.slug}?preview=${post.preview_token}`;
}

export default function PostEditor({ token, post, categories, tagSuggestions = [], onSaved, onCancel, onUnauthorized }) {
  const [form, setForm] = useState(() => formFromPost(post));
  const [savedSnapshot, setSavedSnapshot] = useState(() => JSON.stringify(formFromPost(post)));
  // The version of the article this editor loaded; sent back on save so a newer save elsewhere is detected.
  const [baseUpdatedAt, setBaseUpdatedAt] = useState(post ? post.updated_at || null : null);
  const [conflict, setConflict] = useState(false);
  const [slugEdited, setSlugEdited] = useState(Boolean(post));
  const [tab, setTab] = useState('write');
  const [section, setSection] = useState('article');
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [confirmLeave, setConfirmLeave] = useState(false);
  // Link-out articles are legacy: the field only appears when this article already has one.
  const [showExternalLink] = useState(() => Boolean(post && post.external_url));
  const formRef = useRef(null);
  const contentRef = useRef(null);
  const selectionRef = useRef({ start: 0, end: 0 });
  const [imageDialog, setImageDialog] = useState(null);
  const errorRef = useRef(null);

  const dirty = JSON.stringify(form) !== savedSnapshot;
  const busy = saving || uploading;
  useUnsavedChangesWarning(dirty);
  useSaveShortcut(formRef);
  const deferredForm = useDeferredValue(form); // the SEO badge may lag a moment behind typing
  const seoIssues = useMemo(() => analyzeSeo(deferredForm).checks.filter((check) => check.status !== 'good').length, [deferredForm]);
  const previewContent = useDeferredValue(form.content); // keeps typing smooth while the preview catches up

  const autosave = useDraftAutosave({
    post,
    form,
    dirty,
    token,
    baseUpdatedAt,
    onRestore: (restored) => {
      setForm({ ...EMPTY_FORM, ...restored });
      setSlugEdited(true); // keep the restored slug; do not regenerate it from the next title edit
    },
    onServerSaved: (saved, updatedAt) => {
      setSavedSnapshot(JSON.stringify(saved));
      setBaseUpdatedAt(updatedAt);
    },
    onConflict: () => setConflict(true),
    onUnauthorized,
  });

  useEffect(() => {
    const element = errorRef.current;
    if (error && element && element.scrollIntoView) element.scrollIntoView({ block: 'center', behavior: 'smooth' });
  }, [error]);

  const setField = (name, value) => setForm((current) => ({ ...current, [name]: value }));

  const handleTitle = (value) => {
    setForm((current) => ({ ...current, title: value, slug: slugEdited ? current.slug : slugify(value) }));
  };

  const handleSlug = (value) => {
    setSlugEdited(true);
    setField('slug', value);
  };

  // `overwrite` is the "Overwrite with my version" choice after an edit conflict: it omits the version check.
  const save = async ({ overwrite = false } = {}) => {
    if (busy) return;
    setError('');
    setSaving(true);
    try {
      if (post) await updatePost(token, post.id, overwrite ? form : { ...form, base_updated_at: baseUpdatedAt });
      else await createPost(token, form);
      autosave.clearStored();
      onSaved(form.published ? 'Article published' : 'Draft saved');
    } catch (caught) {
      if (caught instanceof UnauthorizedError) {
        onUnauthorized();
        return;
      }
      if (caught instanceof ConflictError) {
        setConflict(true);
        return;
      }
      setError(caught.message);
    } finally {
      setSaving(false);
    }
  };

  // The browser reports the first invalid field. If it sits in a hidden tab, show that tab and then re-report it.
  const handleInvalid = (event) => {
    const panel = event.target.closest ? event.target.closest('[role="tabpanel"]') : null;
    if (!panel || !panel.hidden) return;
    const control = event.target;
    setSection(panel.id.replace('editor-panel-', ''));
    window.requestAnimationFrame(() => control.reportValidity && control.reportValidity());
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    return save();
  };

  const autosaveLabel = {
    local: 'Kept in this browser',
    server: 'Draft autosaved',
    failed: 'Autosave failed. Your edits are kept in this browser',
  }[autosave.status.kind];

  const handleBack = () => (dirty ? setConfirmLeave(true) : onCancel());

  // Image insertion: remember the cursor, open the dialog, then put the finished Markdown where the cursor was.
  const openImageDialog = (file) => {
    const field = contentRef.current;
    selectionRef.current = field
      ? { start: field.selectionStart, end: field.selectionEnd }
      : { start: form.content.length, end: form.content.length };
    setImageDialog({ file: file || null });
  };
  const insertImage = (markdown) => {
    const { start, end } = selectionRef.current;
    const result = insertBlock(form.content, start, end, markdown);
    setField('content', result.value);
    setImageDialog(null);
    window.requestAnimationFrame(() => {
      const field = contentRef.current;
      if (!field) return;
      field.focus();
      field.setSelectionRange(result.cursor, result.cursor);
    });
  };
  const closeImageDialog = () => setImageDialog(null);
  // Pasting or dropping an image file into the text opens the dialog with that file already uploading.
  const handleImageFiles = (event, files) => {
    const image = Array.from(files || []).find((file) => file.type.startsWith('image/'));
    if (!image) return;
    event.preventDefault();
    openImageDialog(image);
  };

  const words = countWords(form.content);
  const minutes = Math.max(1, Math.ceil(words / WORDS_PER_MINUTE));
  const submitLabel = saving ? 'Saving…' : form.published ? 'Save & publish' : 'Save draft';
  const tabClass = (name) =>
    `rounded-md px-3 py-1.5 text-xs font-bold ${tab === name ? 'bg-[#1E5631] text-white' : 'bg-[#EFEAE0] text-[#1E5631]'}`;

  return (
    <form ref={formRef} onSubmit={handleSubmit} onInvalidCapture={handleInvalid}>
      <div className="sticky top-0 z-30 -mx-4 mb-6 flex items-center justify-between gap-3 border-b border-[#E2DDD4] bg-[#FAFAF7]/95 px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <button type="button" onClick={handleBack} className="shrink-0 text-sm font-bold text-[#1E5631] hover:underline">← Articles</button>
          <h1 className="hidden truncate kj-serif text-lg font-bold text-[#1E5631] sm:block">
            {post ? 'Edit article' : 'New article'}
          </h1>
          <StatusBadge published={form.published} />
          {dirty && <span className="hidden text-xs font-semibold text-[#7A5F0E] md:inline" aria-live="polite">● Unsaved changes</span>}
          {autosaveLabel && <span className="hidden text-xs text-[#6B7280] lg:inline" role="status">{autosaveLabel}</span>}
        </div>
        <button
          type="submit"
          disabled={busy}
          className="shrink-0 rounded-md bg-[#1E5631] px-5 py-2.5 text-xs font-bold uppercase tracking-[0.08em] text-white transition-colors hover:bg-[#164426] disabled:opacity-60"
        >
          {submitLabel}
        </button>
      </div>

      {autosave.pendingDraft && (
        <div role="status" className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-md border border-[#C4A747] bg-[#F5EDD6] p-4 text-sm text-[#7A5F0E]">
          <span>
            You have unsaved changes from {new Date(autosave.pendingDraft.savedAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })},
            kept in this browser. Restore them?
          </span>
          <span className="flex gap-2">
            <button type="button" onClick={autosave.restore} className="rounded-md bg-[#1E5631] px-3 py-1.5 font-bold text-white hover:bg-[#164426]">Restore changes</button>
            <button type="button" onClick={autosave.discard} className="rounded-md border border-[#7A5F0E] px-3 py-1.5 font-bold hover:bg-white/60">Discard</button>
          </span>
        </div>
      )}

      {error && (
        <p ref={errorRef} role="alert" className="mb-6 rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</p>
      )}

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_21rem]">
        <div className="min-w-0">
          <EditorTabs section={section} onChange={setSection} seoIssues={seoIssues} />
          <div role="tabpanel" id="editor-panel-article" aria-labelledby="editor-tab-article" hidden={section !== 'article'} className="mt-6 space-y-6">
          <input
            aria-label="Title"
            placeholder="Article title"
            value={form.title}
            onChange={(event) => handleTitle(event.target.value)}
            maxLength={200}
            required
            className="w-full border-0 border-b-2 border-[#E2DDD4] bg-transparent px-0 py-2 kj-serif text-3xl font-bold text-[#1E5631] outline-none transition-colors placeholder:text-[#B8B2A5] focus:border-[#C4A747]"
          />

          <Field label="Excerpt" hint="Shown on cards and in search results" counter={<Counter value={form.excerpt} max={EXCERPT_MAX} />}>
            <textarea className={INPUT_CLASS} rows={3} value={form.excerpt} onChange={(event) => setField('excerpt', event.target.value)} maxLength={EXCERPT_MAX} required />
          </Field>

          <div>
            <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
              <span className="text-sm font-bold text-[#2C3344]">Content <span className="font-normal text-[#6B7280]">(Markdown)</span></span>
              <div className="flex gap-1 xl:hidden">
                <button type="button" aria-pressed={tab === 'write'} className={tabClass('write')} onClick={() => setTab('write')}>Write</button>
                <button type="button" aria-pressed={tab === 'preview'} className={tabClass('preview')} onClick={() => setTab('preview')}>Preview</button>
              </div>
            </div>
            <div className={`mb-2 ${tab === 'preview' ? 'hidden xl:block' : ''}`}>
              <MarkdownToolbar textareaRef={contentRef} value={form.content} onChange={(value) => setField('content', value)} onInsertImage={() => openImageDialog()} />
              {imageDialog ? (
                <ImageInsertDialog token={token} initialFile={imageDialog.file} onInsert={insertImage} onClose={closeImageDialog} onUnauthorized={onUnauthorized} />
              ) : null}
            </div>
            <div className="grid gap-4 xl:grid-cols-2">
              <textarea
                ref={contentRef}
                aria-label="Content"
                className={`${INPUT_CLASS} min-h-[28rem] font-mono text-sm leading-relaxed ${tab === 'preview' ? 'hidden xl:block' : ''}`}
                value={form.content}
                onChange={(event) => setField('content', event.target.value)}
                onPaste={(event) => handleImageFiles(event, event.clipboardData && event.clipboardData.files)}
                onDrop={(event) => handleImageFiles(event, event.dataTransfer && event.dataTransfer.files)}
                placeholder={'## Heading\n\nWrite your article in Markdown…  (paste or drop an image to add it)'}
              />
              <div className={`min-h-[28rem] overflow-auto rounded-md border border-[#E2DDD4] ${tab === 'write' ? 'hidden xl:block' : ''}`} role="region" aria-label="Preview">
                {/* Same styles as the live article, so what you see here is what readers get. */}
                <div className="kj-root kj-root--embedded" style={{ padding: '1.25rem' }}>
                  <PostContent markdown={previewContent || '*Nothing to preview yet.*'} />
                </div>
              </div>
            </div>
            <p className="mt-2 text-xs text-[#6B7280]">{words} {words === 1 ? 'word' : 'words'} · about {readingTimeLabel(minutes)}</p>
          </div>
          </div>
          <div role="tabpanel" id="editor-panel-seo" aria-labelledby="editor-tab-seo" hidden={section !== 'seo'} className="mt-6">
            <SeoCard form={form} showChecklist={section === 'seo'} setField={setField} token={token} onUnauthorized={onUnauthorized} onUploadBusyChange={setUploading} />
          </div>
        </div>

        <EditorSidebar
          form={form}
          setField={setField}
          onSlugChange={handleSlug}
          categories={categories}
          tagSuggestions={tagSuggestions}
          token={token}
          onUnauthorized={onUnauthorized}
          onUploadBusyChange={setUploading}
          busy={busy}
          submitLabel={submitLabel}
          showExternalLink={showExternalLink}
          previewUrl={buildPreviewUrl(post)}
        />
      </div>

      <ConfirmDialog
        open={conflict}
        title="This article was changed elsewhere"
        message="Someone saved a newer version after you opened it. You can overwrite it with your version, or keep editing and copy what you need first."
        confirmLabel="Overwrite with my version"
        cancelLabel="Keep editing"
        tone="danger"
        busy={saving}
        onConfirm={() => {
          setConflict(false);
          save({ overwrite: true });
        }}
        onCancel={() => setConflict(false)}
      />

      <ConfirmDialog
        open={confirmLeave}
        title="Discard unsaved changes?"
        message="You have changes that haven't been saved. If you leave now, they will be lost."
        confirmLabel="Discard changes"
        tone="danger"
        onConfirm={() => {
          autosave.discard(); // an explicit discard must not come back as a restore offer
          onCancel();
        }}
        onCancel={() => setConfirmLeave(false)}
      />
    </form>
  );
}
