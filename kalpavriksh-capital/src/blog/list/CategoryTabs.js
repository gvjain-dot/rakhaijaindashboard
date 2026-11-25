import React from 'react';

/**
 * Category filter as a horizontally scrolling tab strip. It is a navigation of buttons (aria-current marks the
 * active one), not ARIA tabs, because it filters one list rather than switching between panels.
 */
export default function CategoryTabs({ categories, active, onSelect }) {
  // Keep a category from the URL selectable even if the API list does not include it.
  const items = active && !categories.includes(active) ? [...categories, active] : categories;
  const tab = (label, value) => (
    <li key={label}>
      <button type="button" className="kj-cat" aria-current={active === value ? 'true' : undefined} onClick={() => onSelect(value)}>
        {label}
      </button>
    </li>
  );

  return (
    <nav className="kj-cats" aria-label="Categories">
      <ul className="kj-cats__list">
        {tab('All articles', '')}
        {items.map((name) => tab(name, name))}
      </ul>
    </nav>
  );
}
