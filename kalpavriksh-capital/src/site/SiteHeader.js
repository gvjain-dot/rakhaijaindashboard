import React, { useState } from 'react';
import ServicesMenu from './ServicesMenu';
import { NAV_PAGES, SERVICE_PAGES, pageLabel, pageLinkProps } from './navigation';

/**
 * Site-wide header: fixed navigation bar plus the gold progress bar along the top edge.
 * `progress` is a percentage (0-100); `showNav={false}` leaves only the progress bar.
 */
export default function SiteHeader({ currentPage, onNavigate, progress = 0, showNav = true }) {
  const [navOpen, setNavOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  React.useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  React.useEffect(() => {
    if (!navOpen) return undefined;
    const onKeyDown = (event) => {
      if (event.key === 'Escape') setNavOpen(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [navOpen]);

  const navigate = (page) => {
    setNavOpen(false);
    onNavigate(page);
  };

  // A service page keeps the Services item highlighted.
  const isActive = (page) => currentPage === page || (page === 'services' && SERVICE_PAGES.includes(currentPage));

  return (
    <>
      {/* Navigation - DARK GREEN BACKGROUND */}
      {showNav && <nav aria-label="Main" className={`fixed w-full top-0 z-50 transition-all duration-300 ${
        isScrolled ? 'shadow-lg' : 'shadow-md'
      } backdrop-blur-lg`}  style={{ paddingTop: 'env(safe-area-inset-top)', backgroundColor: '#1E5631'}}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2 sm:gap-3">
              <img
                src="/icon.svg"
                alt="Kalpvriksh Global"
                className="sm:hidden h-10 w-auto rounded-md px-1.5 py-1"
                style={{ backgroundColor: '#F5EDE4' }}
                decoding="async"
              />
              <span className="sm:hidden text-base font-bold whitespace-nowrap" style={{ color: '#F5EDE4' }}>Kalpvriksh Global</span>
              <img
                src="/logo-full.svg"
                alt="Kalpvriksh Global"
                className="hidden sm:block h-12 md:h-14 lg:h-16 w-auto rounded-lg px-3 py-1 transition-transform duration-300 hover:scale-105"
                style={{ backgroundColor: '#F5EDE4', border: '2px solid #C4A747' }}
                decoding="async"
              />
            </div>

            {/* Desktop Menu */}
            <div className="hidden lg:flex items-center gap-1 xl:gap-2">
              {NAV_PAGES.map((page) => (page === 'services' ? (
                <ServicesMenu key={page} currentPage={currentPage} isActive={isActive(page)} onNavigate={navigate} />
              ) : (
                <a
                  key={page}
                  {...pageLinkProps(page, navigate)}
                  aria-current={currentPage === page ? 'page' : undefined}
                  className={`block px-2.5 xl:px-3.5 py-1.5 rounded-full text-[15px] min-[1440px]:text-base font-medium whitespace-nowrap transition-all duration-300 transform border-2 cursor-pointer ${
                    isActive(page)
                      ? 'bg-white shadow-lg'
                      : 'hover:bg-white/20 hover:scale-105'
                  }`}
                  style={{
                    color: isActive(page) ? '#1E5631' : '#F5EDE4',
                    borderColor: '#C4A747',
                    borderStyle: 'solid'
                  }}
                >
                  {pageLabel(page)}
                </a>
              )))}
            </div>
            
            {/* Mobile Hamburger Button */}
            <button
              onClick={() => setNavOpen(!navOpen)}
              className="lg:hidden p-2.5 rounded-lg hover:bg-white/20 transition-all duration-300 transform active:scale-95"
              style={{ color: '#F5EDE4' }}
              aria-label="Toggle menu"
              aria-expanded={navOpen}
            >
              <svg className="w-6 h-6 transition-transform duration-300" style={{ transform: navOpen ? 'rotate(90deg)' : 'rotate(0deg)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {navOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
          
          {/* Mobile Menu with slide animation */}
          <div className={`lg:hidden transition-all duration-500 ease-in-out ${
            navOpen ? 'max-h-[calc(100dvh-6.5rem)] overflow-y-auto overscroll-contain opacity-100 mt-4' : 'max-h-0 overflow-hidden invisible opacity-0'
          }`}>
            <div className="pb-4 space-y-2">
              {NAV_PAGES.map((page, index) => (
                <React.Fragment key={page}>
                <a
                  {...pageLinkProps(page, navigate)}
                  aria-current={currentPage === page ? 'page' : undefined}
                  className={`block w-full text-left px-4 py-3 rounded-lg text-[17px] font-medium transition-all duration-300 transform hover:translate-x-2 cursor-pointer ${
                    currentPage === page
                      ? 'bg-white shadow-md'
                      : 'hover:bg-white/20'
                  }`}
                  style={currentPage === page ? {
                    color: '#1E5631',
                    animationDelay: `${index * 50}ms`,
                    animation: navOpen ? 'slideInLeft 0.3s ease-out forwards' : 'none'
                  } : {
                    color: '#F5EDE4',
                    animationDelay: `${index * 50}ms`,
                    animation: navOpen ? 'slideInLeft 0.3s ease-out forwards' : 'none'
                  }}
                >
                  {pageLabel(page)}
                </a>
                {page === 'services' && SERVICE_PAGES.map((service) => (
                  <a
                    key={service}
                    {...pageLinkProps(service, navigate)}
                    aria-current={currentPage === service ? 'page' : undefined}
                    className={`block w-full text-left pl-8 pr-4 py-3 rounded-lg text-[15px] hover:bg-white/20 ${currentPage === service ? 'font-bold underline' : ''}`}
                    style={{ color: '#F5EDE4' }}
                  >
                    {pageLabel(service)}
                  </a>
                ))}
                </React.Fragment>
              ))}

              {/* Disclosures at bottom of mobile menu */}
              <div className="border-t pt-2 mt-2" style={{ borderColor: 'rgba(255, 255, 255, 0.2)' }}>
                <a
                  {...pageLinkProps('disclosures', navigate)}
                  className={`block w-full text-left px-4 py-3 rounded-lg text-[17px] font-medium transition-all duration-300 transform hover:translate-x-2 ${
                    currentPage === 'disclosures'
                      ? 'bg-white shadow-md'
                      : 'hover:bg-white/20'
                  }`}
                  style={currentPage === 'disclosures' ? {
                    color: '#1E5631',
                    animationDelay: '300ms',
                    animation: navOpen ? 'slideInLeft 0.3s ease-out forwards' : 'none'
                  } : {
                    color: '#F5EDE4',
                    animationDelay: '300ms',
                    animation: navOpen ? 'slideInLeft 0.3s ease-out forwards' : 'none',
                    fontSize: '0.9rem',
                    opacity: '0.8'
                  }}
                >
                  Disclosures
                </a>
              </div>
            </div>
          </div>
        </div>
      </nav>}

      {/* Scroll Progress Bar */}
      <div className="fixed top-0 left-0 w-full h-1 z-50" style={{ backgroundColor: 'rgba(196, 167, 71, 0.2)' }}>
        <div
          className="h-full transition-all duration-150 ease-out"
          style={{
            width: `${progress}%`,
            backgroundColor: '#C4A747',
            boxShadow: '0 0 10px rgba(196, 167, 71, 0.5)'
          }}
        />
      </div>
    </>
  );
}
