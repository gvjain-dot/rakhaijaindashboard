import React from 'react';
import { useNavigate } from 'react-router-dom';
import SiteFooter from './SiteFooter';
import SiteHeader from './SiteHeader';
import { CalendarIcon, WhatsAppIcon } from './components/icons';
import { contactAction } from './contactActions';
import { pageHref } from './navigation';
import usePageMeta from './usePageMeta';
import useScrollProgress from './useScrollProgress';
import './site.css';

const FLOATING_ACTIONS = [
  { action: 'whatsapp', text: 'WhatsApp', label: 'Contact via WhatsApp', color: '#25D366', Icon: WhatsAppIcon },
  { action: 'calendar', text: 'Schedule', label: 'Schedule a meeting', color: '#1E5631', Icon: CalendarIcon },
];

function FloatingActions() {
  return (
    <div className="fixed bottom-0 right-0 z-40 flex flex-col gap-0" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
      {FLOATING_ACTIONS.map(({ action, text, label, color, Icon }) => (
        <button
          key={action}
          type="button"
          onClick={() => contactAction(action)}
          className="group flex items-center gap-2 px-3 sm:px-4 py-3 text-white font-semibold text-sm transition-all duration-300 sm:hover:px-6 shadow-lg active:px-6"
          style={{ backgroundColor: color, clipPath: 'polygon(20% 0%, 100% 0%, 100% 100%, 0% 100%, 0% 30%)' }}
          aria-label={label}
        >
          <Icon className="w-5 h-5 flex-shrink-0" />
          <span className="hidden group-active:inline sm:inline whitespace-nowrap">{text}</span>
        </button>
      ))}
    </div>
  );
}

/** Chrome shared by the main site pages. `page` supplies the head tags and marks the current menu item. */
export default function SiteLayout({ page, children }) {
  const navigate = useNavigate();
  const progress = useScrollProgress();
  const goTo = (key) => navigate(pageHref(key));
  usePageMeta(page);

  return (
    <div className="kg-site min-h-screen overflow-x-hidden" style={{ backgroundColor: '#FAF7F2' }}>
      <SiteHeader currentPage={page.key} onNavigate={goTo} progress={progress} />
      <main className="pt-24 sm:pt-28 md:pt-32">{children}</main>
      <SiteFooter onNavigate={goTo} />
      <FloatingActions />
    </div>
  );
}
