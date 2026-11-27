import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { pageHref } from '../navigation';
import { processSteps } from '../content/processSteps';
import { services } from '../content/services';
import { FALLBACK_AVATAR, testimonials } from '../content/testimonials';
import useCarousel from '../useCarousel';

export default function HomePage() {
  const navigate = useNavigate();
  // Used by the Insights & Learning section.
  const changePage = (key) => navigate(pageHref(key));
  const { current: currentTestimonial, show: handleTestimonialNav } = useCarousel(testimonials.length);

  return (
    <div className="space-y-16">
      {/* Welcome Section - Premium Redesign */}
      <section className="py-6 sm:py-8 px-4 sm:px-6 mx-auto mt-2 sm:mt-4 max-w-6xl">
        <div className="bg-white/40 backdrop-blur-sm rounded-2xl border border-white shadow-2xl p-6 sm:p-8 md:p-10 relative overflow-hidden">
          {/* Subtle dot pattern background */}
          <div className="absolute inset-0 opacity-5 pointer-events-none"
               style={{
                 backgroundImage: `radial-gradient(circle at 1px 1px, #1E5631 1px, transparent 1px)`,
                 backgroundSize: 'clamp(30px, 5vw, 40px) clamp(30px, 5vw, 40px)'
               }}></div>

          {/* Decorative corner accents */}
          <div className="absolute top-0 left-0 w-16 h-16 border-t-2 border-l-2 opacity-20" style={{borderColor: '#C4A747'}}></div>
          <div className="absolute top-0 right-0 w-16 h-16 border-t-2 border-r-2 opacity-20" style={{borderColor: '#C4A747'}}></div>
          <div className="absolute bottom-0 left-0 w-16 h-16 border-b-2 border-l-2 opacity-20" style={{borderColor: '#C4A747'}}></div>
          <div className="absolute bottom-0 right-0 w-16 h-16 border-b-2 border-r-2 opacity-20" style={{borderColor: '#C4A747'}}></div>

          <div className="text-center relative z-10">
            {/* Split heading with refined typography */}
            <div className="mb-4 animate-fade-in-up">
              <p className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl mb-1 tracking-tight" style={{color: '#1E5631', fontWeight: 300, letterSpacing: '-0.02em'}}>
                Welcome To
              </p>
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl mb-3" style={{color: '#1E5631', fontWeight: 600, letterSpacing: '-0.01em'}}>
                Kalpvriksh Global
              </h1>
              {/* Gradient divider */}
              <div className="w-24 h-0.5 mx-auto mb-4" style={{background: 'linear-gradient(to right, transparent, #C4A747, transparent)'}}></div>
            </div>

            {/* Pull quote with decorative elements */}
            <div className="max-w-4xl mx-auto mb-4 animate-fade-in-up" style={{animationDelay: '0.1s'}}>
              <div className="relative mb-4 p-4 sm:p-5 border-l-2" style={{borderColor: '#C4A747'}}>
                <span className="absolute -left-3 top-0 text-4xl opacity-20" style={{color: '#C4A747'}}>"</span>
                <p className="text-lg sm:text-xl md:text-2xl font-light italic leading-relaxed" style={{color: '#1E5631'}}>
                  Your wealth is more than numbers, it's the security of your family, the education of your children, and the freedom to live with purpose.
                </p>
                <span className="absolute -left-3 bottom-0 text-4xl opacity-20" style={{color: '#C4A747'}}>"</span>
              </div>

              {/* Refined body text with emphasis */}
              <p className="text-sm sm:text-base text-gray-700 leading-relaxed mb-3" style={{lineHeight: '1.7'}}>
                We believe in <span className="font-semibold" style={{color: '#1E5631'}}>patient, research-driven strategies</span> grounded in <span className="font-semibold" style={{color: '#1E5631'}}>integrity and discipline</span>.
              </p>

              <p className="text-xs sm:text-sm text-gray-600 italic leading-relaxed">
                Every recommendation we make follows the same standards we apply to our own portfolios because your trust deserves nothing less.
              </p>
            </div>
          </div>
        </div>

        {/* Elegant bottom divider */}
        <div className="w-full h-px mt-6 mx-auto max-w-3xl" style={{ background: 'linear-gradient(to right, transparent, #C4A747, transparent)' }}></div>
      </section>

      {/* Our Services & Process Combined */}
      <section id="services" className="max-w-6xl mx-auto px-4 sm:px-6 pt-4">
        <div className="text-center mb-8">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4" style={{ color: '#1E5631' }}>
            Our Services
          </h2>
          <div className="w-20 h-1 mx-auto rounded-full mb-4" style={{ backgroundColor: '#C4A747' }}></div>
          <p className="text-sm sm:text-base text-gray-700 max-w-3xl mx-auto leading-relaxed">
            Comprehensive wealth solutions designed for long-term financial security
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {services.slice(0, 6).map((service, index) => (
            <Link to={pageHref(service.key)}
              key={index}
              className="block bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 text-center"
            >
              <div className="text-5xl mb-4">{service.icon}</div>
              <h3 className="text-lg sm:text-xl font-bold" style={{ color: '#1E5631' }}>
                {service.title}
              </h3>
            </Link>
          ))}
        </div>

        {/* Our Process */}
        <div className="text-center mb-10">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4" style={{ color: '#1E5631' }}>
            Our Process
          </h2>
          <div className="w-20 h-1 mx-auto rounded-full mb-6" style={{ backgroundColor: '#C4A747' }}></div>
          <p className="text-sm sm:text-base text-gray-700 max-w-4xl mx-auto leading-relaxed italic" style={{ color: '#4E3629' }}>
            "Integrity and ethics guide every step of our process. Each recommendation is grounded in research, discipline, and the same standards we apply to our own portfolios."
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {processSteps.map((step, index) => {
            const treeImages = [
              '/process/seed.png',
              '/process/young_sapling.png',
              '/process/sapling.png',
              '/process/tree.png'
            ];

            return (
              <Link to={pageHref('services')}
                key={index}
                className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 relative block text-center border-2"
                style={{ borderColor: '#C4A747' }}
              >
                <div className="mb-4">
                  <div className="w-24 h-24 mx-auto flex items-center justify-center">
                    <img
                      src={treeImages[index]}
                      alt={`${step.title} - Growth Stage ${index + 1}`}
                      className="w-full h-full object-contain"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        e.currentTarget.nextElementSibling.style.display = 'flex';
                      }}
                    />
                    <div className="w-16 h-16 rounded-full hidden items-center justify-center text-white font-bold text-xl shadow-md" style={{ backgroundColor: '#1E5631' }}>
                      {step.number}
                    </div>
                  </div>
                </div>
                <h3 className="text-lg font-bold" style={{ color: '#1E5631' }}>
                  {step.title}
                </h3>
              </Link>
            );
          })}
        </div>

        {/* Single View Button for both Services & Process */}
        <div className="text-center">
          <Link to={pageHref('services')}
            className="inline-block px-6 py-3 rounded-lg text-base font-semibold transform hover:scale-105 transition-all duration-300 shadow-md hover:shadow-lg border-2"
            style={{ backgroundColor: 'white', color: '#1E5631', borderColor: '#1E5631' }}
          >
            View All Services & Our Process
          </Link>
        </div>

        {/* Gold Divider */}
        <div className="w-full h-px mt-12" style={{ backgroundColor: '#C4A747' }}></div>
      </section>

      {/* Meet Rakhi Jain */}
      <section id="about" className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-10 sm:mb-12">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4" style={{ color: '#1E5631' }}>
            Meet Rakhi Jain
          </h2>
          <div className="w-20 h-1 mx-auto rounded-full mb-4" style={{ backgroundColor: '#C4A747' }}></div>
          <p className="text-sm sm:text-base text-gray-700 max-w-3xl mx-auto leading-relaxed">
            Your long-term partner in building financial confidence and clarity
          </p>
        </div>

        <div className="bg-white rounded-xl p-6 sm:p-8 shadow-sm">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
            <img
              src="/profile-rakhi.jpg"
              alt="Rakhi Jain"
              className="w-32 h-32 sm:w-40 sm:h-40 rounded-full object-cover border-4 flex-shrink-0"
              style={{ borderColor: '#1E5631' }}
              loading="lazy"
              decoding="async"
              onError={(e) => { e.currentTarget.style.display = 'none'; }}
            />
            <div className="flex-grow text-center md:text-left">
              <h3 className="text-xl sm:text-2xl font-bold mb-3" style={{ color: '#1E5631' }}>
                Founder & CEO
              </h3>
              <div className="space-y-4">
                <p className="text-sm sm:text-base text-gray-700 leading-relaxed mb-6">
                • Gold Medalist Chartered Accountant and Chartered Wealth Manager (CWM®)
                </p>
                <p className="text-sm sm:text-base text-gray-700 leading-relaxed">
                  • Trusted advisor offering personalised, goal‑based financial planning grounded in clarity, discipline, and long‑term outcomes aligned with life aspirations.
                </p>
                <p className="text-sm sm:text-base text-gray-700 leading-relaxed">
                  • Proven expertise in identifying high‑performing asset managers and investment opportunities. Passionate about investor education and on a mission to empower 100+ families on their path to financial freedom.
                </p>
                <p className="text-sm sm:text-base text-gray-700 leading-relaxed">
                  • Former Finance Director, Unilever Middle East, with 23+ years of leadership in Strategy, Corporate Finance, and Business Performance across India & the Middle East.
                </p>
                <p className="text-sm sm:text-base text-gray-700 leading-relaxed">
                  • AMFI registered Mutual Fund Distributor
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="client-stories" className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-10 sm:mb-12">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4" style={{ color: '#1E5631' }}>
            Client Stories
          </h2>
          <div className="w-20 h-1 mx-auto rounded-full mb-4" style={{ backgroundColor: '#C4A747' }}></div>
          <p className="text-sm sm:text-base text-gray-700 max-w-3xl mx-auto leading-relaxed">
            Trust built through transparency, patience, and results
          </p>
        </div>

        <div className="relative mb-8">
          {/* Carousel Container */}
          <div className="overflow-hidden">
            <div
              className="flex transition-transform duration-500 ease-in-out"
              style={{ transform: `translateX(-${currentTestimonial * 100}%)` }}
            >
              {testimonials.map((testimonial, index) => (
                <div
                  key={index}
                  className="min-w-full px-4 sm:px-6"
                >
                  <div className="bg-white p-6 sm:p-8 rounded-xl shadow-sm max-w-3xl mx-auto">
                    <div className="flex items-start gap-4 mb-4">
                      <img
                        src={testimonial.image}
                        alt={testimonial.name}
                        className="w-16 h-16 rounded-full object-cover border-2"
                        style={{ borderColor: '#1E5631' }}
                        onError={(e) => {
                          e.currentTarget.src = FALLBACK_AVATAR;
                        }}
                      />
                      <div className="flex-grow">
                        <h4 className="text-lg font-bold" style={{ color: '#1E5631' }}>{testimonial.name}</h4>
                        <p className="text-sm text-gray-600">{testimonial.role}</p>
                        <div className="flex gap-1 mt-1">
                          {[...Array(testimonial.rating)].map((_, i) => (
                            <span key={i} className="text-lg" style={{ color: '#C4A747' }}>⭐</span>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="space-y-3">
                      {testimonial.content.slice(0, 2).map((paragraph, idx) => (
                        <p key={idx} className="text-sm text-gray-700 italic leading-relaxed">
                          "{paragraph}"
                        </p>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Navigation Buttons */}
          <button
            onClick={() => handleTestimonialNav('prev')}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 sm:-translate-x-6 flex items-center justify-center w-11 h-11 sm:w-12 sm:h-12 bg-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-110"
            style={{ color: '#1E5631' }}
            aria-label="Previous testimonial"
          >
            <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            onClick={() => handleTestimonialNav('next')}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 sm:translate-x-6 flex items-center justify-center w-11 h-11 sm:w-12 sm:h-12 bg-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-110"
            style={{ color: '#1E5631' }}
            aria-label="Next testimonial"
          >
            <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>

          {/* Dots Navigation */}
          <div className="flex justify-center mt-2">
            {testimonials.map((testimonial, index) => (
              <button
                key={testimonial.name}
                type="button"
                onClick={() => handleTestimonialNav(index)}
                className="flex items-center justify-center h-11 min-w-[2rem] px-1"
                aria-label={`Go to testimonial ${index + 1}`}
                aria-current={currentTestimonial === index ? 'true' : undefined}
              >
                <span
                  className={`block h-2 sm:h-3 rounded-full transition-all duration-300 ${
                    currentTestimonial === index ? 'w-6 sm:w-8' : 'w-2 sm:w-3'
                  }`}
                  style={{ backgroundColor: currentTestimonial === index ? '#C4A747' : '#D1D5DB' }}
                />
              </button>
            ))}
          </div>
        </div>

        <div className="text-center">
          <Link to={pageHref('testimonials')}
            className="inline-block px-6 py-3 rounded-lg text-base font-semibold transform hover:scale-105 transition-all duration-300 shadow-md hover:shadow-lg border-2"
            style={{ backgroundColor: 'white', color: '#1E5631', borderColor: '#1E5631' }}
          >
            Read More Stories
          </Link>
        </div>
      </section>

      {/* Workshops Preview */}
      <section id="workshops" className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-10 sm:mb-12">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4" style={{ color: '#1E5631' }}>
            Workshops
          </h2>
          <div className="w-20 h-1 mx-auto rounded-full mb-4" style={{ backgroundColor: '#C4A747' }}></div>
          <p className="text-sm sm:text-base text-gray-700 max-w-3xl mx-auto leading-relaxed">
            Building financial literacy through thoughtful education
          </p>
        </div>

        <div className="bg-white rounded-xl p-6 sm:p-8 mb-8 shadow-sm">
          <h3 className="text-xl sm:text-2xl font-bold mb-4 text-center" style={{ color: '#1E5631' }}>
            Beyond Returns – The Art of Building Wealth with Intention
          </h3>
          <p className="text-sm sm:text-base text-gray-700 leading-relaxed text-center max-w-3xl mx-auto mb-6">
            A signature workshop that helps families and professionals move beyond chasing returns to building wealth with clarity, discipline, and purpose.
          </p>
          <div className="grid sm:grid-cols-3 gap-4">
            <div className="text-center p-4 rounded-lg" style={{ backgroundColor: '#F8F5F0' }}>
              <div className="text-3xl mb-2">🎯</div>
              <h4 className="text-sm font-bold mb-1" style={{ color: '#1E5631' }}>Redefine Wealth</h4>
              <p className="text-xs text-gray-600">Understand wealth as freedom and purchasing power</p>
            </div>
            <div className="text-center p-4 rounded-lg" style={{ backgroundColor: '#F8F5F0' }}>
              <div className="text-3xl mb-2">📊</div>
              <h4 className="text-sm font-bold mb-1" style={{ color: '#1E5631' }}>Master Allocation</h4>
              <p className="text-xs text-gray-600">Learn asset allocation and compounding</p>
            </div>
            <div className="text-center p-4 rounded-lg" style={{ backgroundColor: '#F8F5F0' }}>
              <div className="text-3xl mb-2">🛡️</div>
              <h4 className="text-sm font-bold mb-1" style={{ color: '#1E5631' }}>Secure Your Future</h4>
              <p className="text-xs text-gray-600">Estate planning and risk management tools</p>
            </div>
          </div>
        </div>

        <div className="text-center">
          <Link to={pageHref('workshops')}
            className="inline-block px-6 py-3 rounded-lg text-base font-semibold transform hover:scale-105 transition-all duration-300 shadow-md hover:shadow-lg border-2"
            style={{ backgroundColor: 'white', color: '#1E5631', borderColor: '#1E5631' }}
          >
            View Workshop Details
          </Link>
        </div>
      </section>

      {/* Blog Preview */}
      <section id="insights" className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-10 sm:mb-12">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4" style={{ color: '#1E5631' }}>
            Insights & Learning
          </h2>
          <div className="w-20 h-1 mx-auto rounded-full mb-4" style={{ backgroundColor: '#C4A747' }}></div>
          <p className="text-sm sm:text-base text-gray-700 max-w-3xl mx-auto leading-relaxed">
            Timeless lessons on wealth building and financial independence
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Latest Article */}
          <a
            href="https://www.linkedin.com/pulse/what-replace-your-salary-5-years-rakhi-jain-uyicf/?trackingId=6NCoDOVDSjuOPUtfC%2BawfQ%3D%3D"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 flex flex-col text-left w-full"
          >
            <div className="p-5 flex items-center gap-3" style={{ background: 'linear-gradient(135deg, #1E5631, #2d7a47)' }}>
              <span className="text-3xl">💼</span>
              <span className="text-xs font-semibold px-2 py-1 rounded-full" style={{ backgroundColor: '#C4A747', color: '#1E5631' }}>Retirement Planning</span>
            </div>
            <div className="p-6 flex flex-col flex-1">
              <h3 className="text-base font-bold mb-2 leading-snug" style={{ color: '#1E5631' }}>What Will Replace Your Salary in 5 Years?</h3>
              <p className="text-sm text-gray-600 mb-3 leading-relaxed flex-1">
                Decoupling your lifestyle from your time — a practical guide to building passive income before retirement.
              </p>
              <p className="text-xs font-semibold" style={{ color: '#C4A747' }}>by Rakhi Jain · Feb 23, 2026 →</p>
            </div>
          </a>
          {/* Article 2 */}
          <button
            onClick={() => navigate('/blogs/dont-put-all-your-eggs-in-one-basket')}
            className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 flex flex-col text-left w-full"
          >
            <div className="p-5 flex items-center gap-3" style={{ background: 'linear-gradient(135deg, #1E5631, #2d7a47)' }}>
              <span className="text-3xl">📊</span>
              <span className="text-xs font-semibold px-2 py-1 rounded-full" style={{ backgroundColor: '#C4A747', color: '#1E5631' }}>Asset Allocation</span>
            </div>
            <div className="p-6 flex flex-col flex-1">
              <h3 className="text-base font-bold mb-2 leading-snug" style={{ color: '#1E5631' }}>Don't Put All Your Eggs in One Basket, or All Your Money in One Asset</h3>
              <p className="text-sm text-gray-600 mb-3 leading-relaxed flex-1">
                Why asset allocation — not stock-picking — is the most powerful decision you'll make as an investor.
              </p>
              <p className="text-xs font-semibold" style={{ color: '#C09B3A' }}>by Rakhi Jain · Weekly Insight →</p>
            </div>
          </button>
        </div>

        <div className="text-center">
          <button
            onClick={() => changePage('blogs')}
            className="px-6 py-3 rounded-lg text-base font-semibold transform hover:scale-105 transition-all duration-300 shadow-md hover:shadow-lg border-2"
            style={{ backgroundColor: 'white', color: '#1E5631', borderColor: '#1E5631' }}
          >
            Explore Learning Resources
          </button>
        </div>
      </section>
    </div>
  );
}
