import React, { useMemo } from 'react';
import { analyzeSeo } from './seoAnalysis';

const STATUS = {
  good: { icon: '✓', label: 'Passed', badge: 'bg-[#E3F1E7] text-[#1E5631]' },
  warn: { icon: '!', label: 'Could be better', badge: 'bg-[#F5EDD6] text-[#7A5F0E]' },
  bad: { icon: '×', label: 'Needs attention', badge: 'bg-red-100 text-red-700' },
};
const LEVEL = {
  good: { label: 'Good', bar: 'bg-[#1E5631]' },
  ok: { label: 'Needs work', bar: 'bg-[#C4A747]' },
  poor: { label: 'Poor', bar: 'bg-red-600' },
};

/** Live SEO score and checklist for the article being edited. */
export default function SeoChecklist({ form }) {
  const { score, level, checks } = useMemo(() => analyzeSeo(form), [form]);
  const needsWork = checks.filter((check) => check.status !== 'good').length;

  return (
    <section aria-label="SEO checklist">
      <div className="mb-1.5 flex items-baseline justify-between">
        <span className="text-sm font-bold text-[#2C3344]">SEO score</span>
        <span className="text-xs font-bold text-[#1E5631]">{score}/100 · {LEVEL[level].label}</span>
      </div>
      <div
        role="progressbar"
        aria-label="SEO score"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={score}
        className="h-2 overflow-hidden rounded-full bg-[#EFEAE0]"
      >
        <div className={`h-full rounded-full transition-[width] duration-300 ${LEVEL[level].bar}`} style={{ width: `${score}%` }} />
      </div>
      <p className="mt-1.5 text-xs text-[#6B7280]">
        {needsWork === 0 ? 'Everything on the checklist is in good shape.' : `${needsWork} ${needsWork === 1 ? 'item' : 'items'} to improve.`}
      </p>

      <ul className="mt-3 space-y-2.5">
        {checks.map((check) => (
          <li key={check.id} className="flex gap-2.5 text-xs leading-snug">
            <span aria-hidden="true" className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-[10px] font-extrabold ${STATUS[check.status].badge}`}>
              {STATUS[check.status].icon}
            </span>
            <span>
              <span className="font-semibold text-[#2C3344]">{check.label}</span>
              <span className="sr-only"> — {STATUS[check.status].label}</span>
              {check.status !== 'good' && <span className="mt-0.5 block text-[#6B7280]">{check.tip}</span>}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
