import React, { useState } from 'react';
import { monthKey, monthName } from '../format';

/** Groups the API's flat [{year, month, count}] into [{ year, total, months: [...] }], newest year first. */
function groupByYear(archive) {
  const years = new Map();
  archive.forEach((entry) => {
    const group = years.get(entry.year) || { year: entry.year, total: 0, months: [] };
    group.total += entry.count;
    group.months.push(entry);
    years.set(entry.year, group);
  });
  return [...years.values()];
}

const plural = (count) => `${count} ${count === 1 ? 'article' : 'articles'}`;

/** Year/month archive. Choosing a month filters the list; choosing it again clears the filter. */
export default function Archive({ archive, activeMonth, onSelect }) {
  const years = groupByYear(archive);
  const activeYear = activeMonth ? Number.parseInt(activeMonth, 10) : null;
  // `undefined` means the reader has not chosen yet: open the filtered month's year, else the latest.
  // It is derived (not initial state) because the archive arrives after the first render.
  const [chosenYear, setOpenYear] = useState(undefined);
  const openYear = chosenYear === undefined ? activeYear || (years[0] && years[0].year) : chosenYear;

  if (years.length === 0) return null;

  return (
    <section className="kj-wrap kj-archive" aria-labelledby="kj-archive-title">
      <div className="kj-archive__intro">
        <p className="kj-label">The archive</p>
        <h2 id="kj-archive-title">Browse the archive</h2>
        <p>Every article, by the month it was published.</p>
      </div>
      <ul className="kj-years">
        {years.map((group) => {
          const open = openYear === group.year;
          return (
            <li key={group.year} className="kj-year">
              <button type="button" className="kj-year__btn" aria-expanded={open} onClick={() => setOpenYear(open ? null : group.year)}>
                <span>{group.year}</span>
                <span className="kj-year__n">{plural(group.total)} <i aria-hidden="true" /></span>
              </button>
              {open && (
                <ul className="kj-months">
                  {group.months.map((entry) => {
                    const key = monthKey(entry.year, entry.month);
                    const pressed = activeMonth === key;
                    return (
                      <li key={key}>
                        <button type="button" className="kj-month" aria-pressed={pressed} onClick={() => onSelect(pressed ? '' : key)}>
                          <span>{monthName(entry.month)}</span>
                          <span>{entry.count}</span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
