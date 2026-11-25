import React from 'react';

const MIN_BAR_PERCENT = 3;
const formatDay = (day) => new Date(`${day}T00:00:00Z`).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', timeZone: 'UTC' });

/** Daily reads for the last 30 days as plain CSS bars (no chart library). `daily` is [{day, views}], oldest first. */
export default function ViewsChart({ daily }) {
  const total = daily.reduce((sum, point) => sum + point.views, 0);
  const peak = Math.max(...daily.map((point) => point.views), 1);
  const first = daily[0];
  const last = daily[daily.length - 1];

  return (
    <figure className="rounded-lg border border-[#E2DDD4] bg-white p-4 sm:p-5">
      <figcaption className="flex flex-wrap items-baseline justify-between gap-2">
        <span className="text-sm font-bold text-[#2C3344]">Reads per day</span>
        <span className="text-xs text-[#6B7280]">{total.toLocaleString('en-US')} in {daily.length} days · busiest day {peak.toLocaleString('en-US')}</span>
      </figcaption>
      <div role="img" aria-label={`Bar chart of daily reads. ${total} reads in the last ${daily.length} days, busiest day ${peak}.`} className="mt-4 flex h-32 items-end gap-[2px] sm:gap-1">
        {daily.map((point) => (
          <div key={point.day} title={`${formatDay(point.day)}: ${point.views} ${point.views === 1 ? 'read' : 'reads'}`} className="flex h-full min-w-0 flex-1 items-end">
            <div data-day-bar className={`w-full rounded-t-sm ${point.views ? 'bg-[#1E5631]' : 'bg-[#E2DDD4]'}`} style={{ height: `${point.views ? Math.max(MIN_BAR_PERCENT, Math.round((point.views / peak) * 100)) : MIN_BAR_PERCENT}%` }} />
          </div>
        ))}
      </div>
      {first && last && (
        <div className="mt-2 flex justify-between text-[11px] text-[#6B7280]" aria-hidden="true">
          <span>{formatDay(first.day)}</span>
          <span>{formatDay(last.day)}</span>
        </div>
      )}
    </figure>
  );
}
