import React, { useRef, useState } from 'react';
import { SERVICE_PAGES, pageLabel, pageLinkProps } from './navigation';

/**
 * Desktop Services item: one pill holding the link to the services page and the arrow that shows
 * the six service pages. The menu opens on hover, or from the arrow for keyboard and touch.
 */
export default function ServicesMenu({ currentPage, isActive, onNavigate }) {
  const [isOpen, setIsOpen] = useState(false);
  const openedByHover = useRef(false);
  const toggleRef = useRef(null);

  const close = () => {
    openedByHover.current = false;
    setIsOpen(false);
  };

  const choose = (page) => {
    close();
    onNavigate(page);
  };

  const handleMouseEnter = () => {
    if (isOpen) return;
    openedByHover.current = true;
    setIsOpen(true);
  };

  // A touch tap fires mouseenter before click: the first click keeps a hover-opened menu open.
  const handleToggle = () => {
    if (openedByHover.current) {
      openedByHover.current = false;
      return;
    }
    setIsOpen(!isOpen);
  };

  const handleKeyDown = (event) => {
    if (event.key !== 'Escape' || !isOpen) return;
    close();
    toggleRef.current.focus();
  };

  const handleBlur = (event) => {
    if (!event.currentTarget.contains(event.relatedTarget)) close();
  };

  const color = isActive ? '#1E5631' : '#F5EDE4';

  return (
    <div
      role="group"
      aria-label="Services navigation"
      className="relative"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={close}
      onKeyDown={handleKeyDown}
      onBlur={handleBlur}
    >
      <div
        className={`flex items-stretch rounded-full border-2 transition-all duration-300 ${isActive ? 'bg-white shadow-lg' : 'hover:bg-white/20'}`}
        style={{ borderColor: '#C4A747' }}
      >
        <a
          {...pageLinkProps('services', choose)}
          aria-current={currentPage === 'services' ? 'page' : undefined}
          className="block rounded-l-full pl-2.5 xl:pl-3.5 pr-2 py-1.5 text-[15px] min-[1440px]:text-base font-medium whitespace-nowrap"
          style={{ color }}
        >
          {pageLabel('services')}
        </a>
        <button
          ref={toggleRef}
          type="button"
          onClick={handleToggle}
          aria-expanded={isOpen}
          aria-label="Show services"
          className="flex items-center rounded-r-full border-l pl-1.5 pr-2.5"
          style={{ color, borderColor: 'rgba(196, 167, 71, 0.6)' }}
        >
          <svg className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>
      {isOpen && (
        // The padding bridges the space below the pill, so the pointer never leaves the menu on its way down.
        <div className="absolute left-0 top-full pt-2 z-50">
          <ul aria-label="Services menu" className="w-64 rounded-xl py-2 shadow-xl border-2" style={{ backgroundColor: '#FAF7F2', borderColor: '#C4A747' }}>
            {SERVICE_PAGES.map((page) => (
              <li key={page}>
                <a
                  {...pageLinkProps(page, choose)}
                  aria-current={currentPage === page ? 'page' : undefined}
                  className={`block px-4 py-2.5 text-[15px] hover:bg-black/5 ${currentPage === page ? 'font-bold' : 'font-medium'}`}
                  style={{ color: '#1E5631' }}
                >
                  {pageLabel(page)}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
