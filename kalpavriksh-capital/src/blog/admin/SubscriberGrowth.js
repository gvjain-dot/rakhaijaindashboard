import React, { useMemo } from 'react';
import { weeklyCounts } from './subscriberStats';

const WEEKS = 8;
const MIN_BAR_PERCENT = 4;
const label = (start) => new Date(`${start}T00:00:00Z`).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', timeZone: 'UTC' });

/** New signups per week for the last 8 weeks, as plain CSS bars. */
export default function SubscriberGrowth({ rows }) {
  const weeks = useMemo(() => weeklyCounts(rows, new Date(), WEEKS), [rows]);
  const total = weeks.reduce((sum, week) => sum + week.count, 0);
  const peak = Math.max(...weeks.map((week) => week.count), 1);

  return (
    <figure className="mb-5 rounded-lg border border-[#E2DDD4] bg-white p-4">
      <figcaption className="flex flex-wrap items-baseline justify-between gap-2 text-sm">
        <span className="font-bold text-[#2C3344]">New subscribers per week</span>
        <span className="text-xs text-[#6B7280]">{total} in the last {WEEKS} weeks</span>
      </figcaption>
      <div role="img" aria-label={`New subscribers per week: ${weeks.map((week) => `${label(week.start)} ${week.count}`).join(', ')}`} className="mt-3 flex h-20 items-end gap-2">
        {weeks.map((week) => (
          <div key={week.start} title={`Week of ${label(week.start)}: ${week.count}`} className="flex h-full min-w-0 flex-1 flex-col justify-end">
            <div data-week-bar className={`w-full rounded-t-sm ${week.count ? 'bg-[#1E5631]' : 'bg-[#E2DDD4]'}`} style={{ height: `${week.count ? Math.max(MIN_BAR_PERCENT, Math.round((week.count / peak) * 100)) : MIN_BAR_PERCENT}%` }} />
          </div>
        ))}
      </div>
    </figure>
  );
}
