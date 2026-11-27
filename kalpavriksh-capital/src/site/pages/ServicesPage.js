import React from 'react';
import { Link } from 'react-router-dom';
import { pageHref } from '../navigation';
import ProcessSection from '../components/ProcessSection';
import { services } from '../content/services';

export default function ServicesPage() {
  return (
    <div className="space-y-12 sm:space-y-16 px-3 sm:px-4 py-6 sm:py-8">
      <section className="text-center max-w-4xl mx-auto animate-fade-in-up">
        <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-4 sm:mb-6 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 px-2" style={{ color: '#1E5631' }}>
          <span className="animate-bounce-slow text-3xl sm:text-4xl">💼</span> <span>Our Services</span>
        </h1>
        <div className="w-24 sm:w-32 h-1 mx-auto rounded-full mb-4 sm:mb-6 animate-expand-width" style={{ backgroundColor: '#C4A747' }}></div>
        <p className="text-base sm:text-lg md:text-xl text-gray-700 px-2">
          Comprehensive wealth management solutions tailored for your success
        </p>
      </section>

      <div className="max-w-6xl mx-auto grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
        {services.map((service, index) => (
          <Link
            key={service.key}
            to={pageHref(service.key)}
            className="block bg-white p-4 sm:p-6 md:p-8 rounded-xl sm:rounded-2xl shadow-sm hover:shadow-md transform hover:scale-105 hover:-translate-y-2 transition-all duration-500 animate-fade-in-up cursor-pointer"
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <div className="text-center mb-4 sm:mb-6">
              <div className="text-4xl sm:text-5xl md:text-6xl mb-3 sm:mb-4 transform transition-transform duration-300 hover:scale-125 hover:rotate-12">{service.icon}</div>
              <h3 className="text-xl sm:text-2xl font-bold px-2" style={{ color: '#1E5631' }}>{service.title}</h3>
            </div>
            <p className="text-sm sm:text-base leading-relaxed text-center px-2">{service.description}</p>
            <ul className="space-y-2 sm:space-y-3">
              {service.features.map((feature, idx) => (
                <li key={idx} className="flex items-start gap-2 sm:gap-3 hover:translate-x-2 transition-transform duration-300">
                  <span className="text-base sm:text-lg flex-shrink-0 mt-0.5" style={{ color: '#1E5631' }}>✓</span>
                  <span className="text-sm sm:text-base text-gray-600">{feature}</span>
                </li>
              ))}
            </ul>
            <p className="mt-4 text-center font-semibold" style={{ color: '#1E5631' }}>Learn more →</p>
          </Link>
        ))}
      </div>

      <ProcessSection />
    </div>
  );
}
