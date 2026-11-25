import React from 'react';

export const INPUT_CLASS =
  'w-full rounded-md border border-[#D9D3C7] bg-white px-3 py-2.5 text-base text-[#2C3344] outline-none transition focus:border-[#1E5631] focus:ring-2 focus:ring-[#C4A747]/40';

/** Labelled form control with an optional hint underneath and counter on the right of the label. */
export function Field({ label, hint, counter, children }) {
  return (
    <label className="block">
      <span className="mb-1 flex items-baseline justify-between gap-2">
        <span className="text-sm font-bold text-[#2C3344]">{label}</span>
        {counter}
      </span>
      {children}
      {hint && <span className="mt-1 block text-xs text-[#6B7280]">{hint}</span>}
    </label>
  );
}

/** Sidebar card with a small gold section label. */
export function Card({ title, children }) {
  return (
    <section className="rounded-lg border border-[#E2DDD4] bg-white p-4">
      <h2 className="mb-3 text-[11px] font-bold uppercase tracking-[0.18em] text-[#C4A747]">{title}</h2>
      {children}
    </section>
  );
}

/** Accessible on/off switch with a bold label and a short description underneath. */
export function ToggleSwitch({ checked, onChange, label, description }) {
  return (
    <label className="flex cursor-pointer items-start justify-between gap-3">
      <span>
        <span className="block text-sm font-bold text-[#1E5631]">{label}</span>
        {description && <span className="block text-xs text-[#6B7280]">{description}</span>}
      </span>
      <input type="checkbox" role="switch" className="peer sr-only" checked={checked} onChange={(event) => onChange(event.target.checked)} />
      <span
        aria-hidden="true"
        className="relative mt-0.5 h-6 w-11 shrink-0 rounded-full bg-[#CFCAC0] transition-colors after:absolute after:left-0.5 after:top-0.5 after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-transform after:content-[''] peer-checked:bg-[#1E5631] peer-checked:after:translate-x-5 peer-focus-visible:ring-2 peer-focus-visible:ring-[#C4A747] peer-focus-visible:ring-offset-2"
      />
    </label>
  );
}

/** "42/160" style length counter that turns amber once it passes the recommended size. */
export function Counter({ value, recommended, max }) {
  const length = String(value || '').length;
  const over = recommended !== undefined && length > recommended;
  return (
    <span className={`text-xs ${over ? 'font-bold text-[#B45309]' : 'text-[#6B7280]'}`}>
      {length}/{recommended ?? max}
    </span>
  );
}
