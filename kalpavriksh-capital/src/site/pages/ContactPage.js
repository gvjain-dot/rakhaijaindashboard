import React from 'react';
import { contactAction } from '../contactActions';
import { WhatsAppIcon } from '../components/icons';

export default function ContactPage() {
  return (
    <div className="space-y-12 sm:space-y-16 px-3 sm:px-4 py-6 sm:py-8">
      <section className="text-center max-w-4xl mx-auto animate-fade-in-up">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 sm:mb-6 px-2 leading-tight" style={{ color: '#1E5631' }}>
          Let's Start a Conversation
        </h1>
        <div className="w-20 h-1 mx-auto rounded-full mb-6 animate-expand-width" style={{ backgroundColor: '#C4A747' }}></div>

        <div className="mt-6 sm:mt-8 p-6 sm:p-8 rounded-xl bg-white shadow-md animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
          <p className="text-base sm:text-lg md:text-xl font-serif italic mb-2 px-2" style={{ color: '#1E5631' }}>
            "Clarity is the most underrated form of financial confidence."
          </p>
          <p className="text-sm sm:text-base text-gray-600">— Rakhi Jain</p>
        </div>

        <p className="text-sm sm:text-base md:text-lg text-gray-700 mt-6 sm:mt-8 leading-relaxed px-2">
          Whether you're beginning your wealth journey or seeking to refine your current strategy, we're here to listen. Every financial plan begins with us understanding your goals, your values, and your vision for the future.
        </p>
      </section>

      <div className="max-w-5xl mx-auto">
        <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 lg:p-10 shadow-sm hover:shadow-md transition-all duration-500 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
          <div className="text-center mb-6 sm:mb-8">
            <h2 className="text-lg sm:text-xl md:text-2xl font-bold mb-4 px-2 leading-relaxed" style={{ color: '#1E5631' }}>
              Schedule a complimentary consultation to explore your financial goals
            </h2>
            <p className="text-sm sm:text-base text-gray-600 mb-6 px-2 leading-relaxed">
              No pressure, no obligation, just a thoughtful conversation about your future
            </p>
          </div>

          {/* Primary CTA */}
          <div className="text-center mb-8">
            <button
              onClick={() => contactAction('calendar')}
              className="text-white px-8 py-4 rounded-lg text-base sm:text-lg font-semibold transform hover:scale-105 transition-all duration-300 shadow-md hover:shadow-lg w-full sm:w-auto"
              style={{ backgroundColor: '#1E5631' }}
            >
              Schedule a 30-Minute Call
            </button>
          </div>

          {/* Secondary CTAs */}
          <div className="grid grid-cols-3 gap-3 sm:gap-4 mb-6 sm:mb-8 md:mb-10">
            {[
              { action: 'email', icon: '📧', text: 'Send Email' },
              { action: 'linkedin', icon: 'linkedin', text: 'LinkedIn' },
              { action: 'whatsapp', icon: 'whatsapp', text: 'WhatsApp' }
            ].map((btn, index) => (
              <button
                key={index}
                onClick={() => contactAction(btn.action)}
                className="px-3 sm:px-4 py-3 sm:py-4 rounded-lg sm:rounded-xl text-xs sm:text-sm md:text-base font-semibold transform hover:scale-105 transition-all duration-300 shadow-md hover:shadow-lg flex flex-col items-center justify-center gap-1 sm:gap-2 animate-fade-in-up border-2"
                style={{
                  animationDelay: `${0.7 + index * 0.1}s`,
                  backgroundColor: 'white',
                  color: '#1E5631',
                  borderColor: '#1E5631'
                }}
              >
                {btn.icon === 'linkedin' ? (
                  <svg className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8" style={{ color: '#0077B5' }} fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
                ) : btn.icon === 'whatsapp' ? (
                  <WhatsAppIcon className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8" style={{ color: '#25D366' }} />
                ) : (
                  <span className="text-2xl sm:text-3xl">{btn.icon}</span>
                )}
                <span className="text-xs sm:text-sm">{btn.text}</span>
              </button>
            ))}
          </div>

        </div>
      </div>
    </div>
  );
}
