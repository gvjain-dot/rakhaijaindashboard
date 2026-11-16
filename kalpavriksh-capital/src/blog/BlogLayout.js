import React from 'react';
import { Link } from 'react-router-dom';

// Same items, order and styling as the main site's navigation bar.
const NAV_LINKS = [
  { label: 'Home', to: '/' },
  { label: 'Services', to: '/?page=services' },
  { label: 'Workshops', to: '/?page=workshops' },
  { label: 'Testimonials', to: '/?page=testimonials' },
  { label: 'Blogs', to: '/blogs' },
  { label: 'Contact', to: '/?page=contact' },
];
const ACTIVE_LABEL = 'Blogs';

function Logo() {
  return (
    <Link to="/" aria-label="Kalpvriksh Global home" className="flex items-center gap-2 sm:gap-3">
      <img src="/icon.svg" alt="" className="h-10 w-auto rounded-md bg-[#F5EDE4] px-1.5 py-1 sm:hidden" />
      <span className="text-sm font-bold whitespace-nowrap text-[#F5EDE4] sm:hidden">Kalpvriksh Global</span>
      <img
        src="/logo-full.svg"
        alt="Kalpvriksh Global"
        className="hidden h-12 w-auto rounded-lg border-2 border-[#C4A747] bg-[#F5EDE4] px-3 py-1 transition-transform duration-300 hover:scale-105 sm:block md:h-14 lg:h-16"
      />
    </Link>
  );
}

function Header() {
  const [open, setOpen] = React.useState(false);
  const closeMenu = () => setOpen(false);

  return (
    <header className="sticky top-0 z-50 bg-[#1E5631] shadow-md backdrop-blur-lg" style={{ paddingTop: 'env(safe-area-inset-top)' }}>
      <div className="mx-auto max-w-6xl px-4 py-3 sm:px-6 sm:py-4">
        <div className="flex items-center justify-between">
          <Logo />

          <nav aria-label="Main" className="hidden gap-6 lg:flex">
            {NAV_LINKS.map((link) => {
              const active = link.label === ACTIVE_LABEL;
              return (
                <Link
                  key={link.label}
                  to={link.to}
                  aria-current={active ? 'page' : undefined}
                  className={`rounded-full border-2 border-[#C4A747] px-6 py-2 font-medium transition-all duration-300 hover:scale-105 ${
                    active ? 'scale-105 bg-white text-[#1E5631] shadow-lg' : 'text-[#F5EDE4] hover:bg-white/20'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          <button
            type="button"
            onClick={() => setOpen(!open)}
            aria-label="Toggle menu"
            aria-expanded={open}
            className="rounded-lg p-2 text-[#F5EDE4] transition-all duration-300 hover:bg-white/20 active:scale-95 lg:hidden"
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              {open ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        <div className={`overflow-hidden transition-all duration-500 ease-in-out lg:hidden ${open ? 'mt-4 max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
          <nav aria-label="Mobile" className="space-y-2 pb-4">
            {NAV_LINKS.map((link) => {
              const active = link.label === ACTIVE_LABEL;
              return (
                <Link
                  key={link.label}
                  to={link.to}
                  onClick={closeMenu}
                  tabIndex={open ? 0 : -1}
                  className={`block w-full rounded-lg px-4 py-3 font-medium transition-all duration-300 hover:translate-x-2 ${
                    active ? 'bg-white text-[#1E5631] shadow-md' : 'text-[#F5EDE4] hover:bg-white/20'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
            <div className="mt-2 border-t border-white/20 pt-2">
              <Link
                to="/?page=disclosures"
                onClick={closeMenu}
                tabIndex={open ? 0 : -1}
                className="block w-full rounded-lg px-4 py-3 text-[0.9rem] font-medium text-[#F5EDE4]/80 transition-all duration-300 hover:translate-x-2 hover:bg-white/20"
              >
                Disclosures
              </Link>
            </div>
          </nav>
        </div>
      </div>
    </header>
  );
}

function Footer() {
  return (
    <footer className="mt-16 bg-[#1E5631] text-[#F5EDE4]" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-4 py-8 text-center text-sm sm:flex-row sm:px-6 sm:text-left">
        <p>© {new Date().getFullYear()} Kalpvriksh Global. All rights reserved.</p>
        <div className="flex items-center gap-4">
          <a href="/rss.xml" className="underline-offset-4 hover:underline">RSS</a>
          <Link to="/?page=disclosures" className="underline-offset-4 hover:underline">Disclosures</Link>
        </div>
      </div>
    </footer>
  );
}

/** Shared page chrome for the blog routes: sticky header, content area, footer. */
export default function BlogLayout({ children }) {
  return (
    <div className="flex min-h-screen min-h-[100dvh] flex-col bg-[#FAF7F2]">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
