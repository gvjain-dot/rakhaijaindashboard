import React from 'react';
import { NAV_PAGES, pageLabel, pageLinkProps } from './navigation';

/** Site-wide footer: brand, quick links, services and professional details. */
export default function SiteFooter({ onNavigate }) {
  return (
    <footer className="text-white py-8 sm:py-10 md:py-12 mt-12 sm:mt-16 pb-24 sm:pb-8" style={{ paddingBottom: 'max(6rem, env(safe-area-inset-bottom))', backgroundColor: '#1E5631'}}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 mb-6 sm:mb-8">
          <div className="animate-fade-in-up text-center sm:text-left">
            <div className="flex flex-col items-center sm:items-start gap-2 sm:gap-3 mb-3 sm:mb-4">
              <img
                src="/logo-full.svg"
                alt="Kalpvriksh Global"
                className="h-16 sm:h-20 md:h-24 w-auto rounded-lg px-3 py-1 transition-transform duration-300 hover:scale-105"
                style={{ backgroundColor: '#F5EDE4', border: '2px solid #C4A747' }}
                loading="lazy"
                decoding="async"
              />
              <span className="text-lg sm:text-xl md:text-2xl font-bold" style={{ color: '#F5EDE4' }}>Kalpvriksh Global</span>
            </div>
            <p className="text-sm sm:text-base mb-3 sm:mb-4" style={{ color: '#F5EDE4' }}>Empowering decisions, Enriching Journeys</p>
            <div className="text-xs sm:text-sm" style={{ color: '#F5EDE4' }}>
              <p>📧 rakhijain@kalpvrikshglobal.com</p>
            </div>
          </div>
          <div className="animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
            <h4 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4 text-center sm:text-left" style={{ color: '#C4A747' }}>Quick Links</h4>
            <div className="space-y-2 text-center sm:text-left">
              {NAV_PAGES.map((page) => (
                <a
                  key={page}
                  {...pageLinkProps(page, onNavigate)}
                  className="block w-fit text-sm sm:text-base transition-all duration-200 hover:translate-x-2 mx-auto sm:mx-0"
                  style={{ cursor: 'pointer', color: '#F5EDE4' }}
                  onMouseEnter={(e) => e.currentTarget.style.color = '#C4A747'}
                  onMouseLeave={(e) => e.currentTarget.style.color = '#F5EDE4'}
                >
                  {pageLabel(page)}
                </a>
              ))}
              <a
                {...pageLinkProps('disclosures', onNavigate)}
                className="block w-fit text-sm sm:text-base transition-all duration-200 hover:translate-x-2 mx-auto sm:mx-0"
                style={{ cursor: 'pointer', color: '#F5EDE4' }}
                onMouseEnter={(e) => e.currentTarget.style.color = '#C4A747'}
                onMouseLeave={(e) => e.currentTarget.style.color = '#F5EDE4'}
              >
                Disclosures
              </a>
            </div>
          </div>
          <div className="animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            <h4 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4 text-center sm:text-left" style={{ color: '#C4A747' }}>Services</h4>
            <div className="space-y-2 text-xs sm:text-sm text-center sm:text-left" style={{ color: '#F5EDE4' }}>
              <p className="hover:translate-x-2 transition-transform duration-200">Investments & Mutual Funds</p>
              <p className="hover:translate-x-2 transition-transform duration-200">Goal Based Solutions</p>
              <p className="hover:translate-x-2 transition-transform duration-200">Insurance Planning</p>
              <p className="hover:translate-x-2 transition-transform duration-200">Tax & Estate Planning</p>
              <p className="hover:translate-x-2 transition-transform duration-200">Learning Academy</p>
            </div>
          </div>
          <div className="animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
            <h4 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4 text-center sm:text-left" style={{ color: '#C4A747' }}>Professional Info</h4>
            <div className="space-y-2 text-xs sm:text-sm text-center sm:text-left" style={{ color: '#F5EDE4' }}>
              <p className="hover:translate-x-2 transition-transform duration-200">Gold Medalist Chartered Accountant</p>
              <p className="hover:translate-x-2 transition-transform duration-200">Chartered Wealth Manager</p>
              <p className="hover:translate-x-2 transition-transform duration-200">20+ Years Experience</p>
              <p className="hover:translate-x-2 transition-transform duration-200">Former Finance Director - Unilever</p>
            </div>
          </div>
        </div>
        <div className="border-t pt-4 text-center" style={{ borderColor: '#163822' }}>
          <p className="text-xs" style={{ color: '#F5EDE4', opacity: '0.8' }}>
            Designed by Gaurav Jain
          </p>
        </div>
      </div>
    </footer>
  );
}
