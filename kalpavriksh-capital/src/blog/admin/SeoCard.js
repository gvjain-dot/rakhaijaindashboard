import React from 'react';
import ImageField from './ImageField';
import SeoChecklist from './SeoChecklist';
import { Counter, Field, INPUT_CLASS, ToggleSwitch } from './fields';

const SEO_TITLE_RECOMMENDED = 60;
const SEO_DESCRIPTION_RECOMMENDED = 160;
const SITE_HOST = 'kalpvrikshglobal.com';

function SearchPreview({ form }) {
  const title = (form.seo_title || form.title || 'Article title').slice(0, SEO_TITLE_RECOMMENDED);
  const description = (form.seo_description || form.excerpt || 'The article description appears here.').slice(0, SEO_DESCRIPTION_RECOMMENDED);
  return (
    <div className="rounded-md bg-[#F7F5F0] p-3" aria-label="Search result preview">
      <p className="truncate text-xs text-[#1E5631]">{SITE_HOST} › blogs › {form.slug || '…'}</p>
      <p className="truncate text-base font-semibold text-[#1a0dab]">{title}</p>
      <p className="line-clamp-2 text-xs text-[#4d5156]">{description}</p>
    </div>
  );
}

/** Everything that controls how the article appears in search results and link previews. */
export default function SeoCard({ form, showChecklist = true, setField, token, onUnauthorized, onUploadBusyChange }) {
  return (
    <section aria-label="Search appearance" className="rounded-lg border border-[#E2DDD4] bg-white p-4 sm:p-6">
      <h2 className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#C4A747]">Search appearance</h2>
      <p className="mt-1 text-sm text-[#6B7280]">Control how this article appears in Google results and when the link is shared.</p>
      <div className="mt-5 grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <div className="space-y-5">
          <SearchPreview form={form} />
          {showChecklist && <SeoChecklist form={form} />}
        </div>
        <div className="space-y-5">

        <Field label="Focus keyword" hint="The phrase you want this article to rank for. Used by the checklist only.">
          <input className={INPUT_CLASS} value={form.focus_keyword} onChange={(event) => setField('focus_keyword', event.target.value)} maxLength={100} placeholder="e.g. asset allocation" />
        </Field>
        <Field label="SEO title" hint="Defaults to the article title" counter={<Counter value={form.seo_title} recommended={SEO_TITLE_RECOMMENDED} />}>
          <input className={INPUT_CLASS} value={form.seo_title} onChange={(event) => setField('seo_title', event.target.value)} maxLength={120} />
        </Field>
        <Field label="SEO description" hint="Defaults to the excerpt" counter={<Counter value={form.seo_description} recommended={SEO_DESCRIPTION_RECOMMENDED} />}>
          <textarea className={INPUT_CLASS} rows={3} value={form.seo_description} onChange={(event) => setField('seo_description', event.target.value)} maxLength={300} />
        </Field>

        <div>
          <p className="mb-1 text-sm font-bold text-[#2C3344]">Social share image</p>
          <p className="mb-2 text-xs text-[#6B7280]">Shown when the link is shared on WhatsApp, LinkedIn or X. Defaults to the feature image. 1200 × 630 works best.</p>
          <ImageField
            label="social share image"
            token={token}
            value={form.social_image}
            onChange={(value) => setField('social_image', value)}
            onUnauthorized={onUnauthorized}
            onBusyChange={onUploadBusyChange}
          />
        </div>

        <Field label="Canonical URL" hint="Only set this if the article was first published somewhere else, so Google credits the original.">
          <input className={INPUT_CLASS} type="url" value={form.canonical_url} onChange={(event) => setField('canonical_url', event.target.value)} placeholder="https://…" />
        </Field>

        <ToggleSwitch
          checked={form.noindex}
          onChange={(value) => setField('noindex', value)}
          label="Hide from search engines"
          description="Adds noindex and leaves the article out of the sitemap and RSS feed. Visitors with the link can still read it."
        />
        </div>
      </div>
    </section>
  );
}
