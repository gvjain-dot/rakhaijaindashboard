import React from 'react';
import { FALLBACK_AVATAR, testimonials } from '../content/testimonials';

export default function TestimonialsPage() {
  return (
    <div className="space-y-12 sm:space-y-16 px-3 sm:px-4 py-6 sm:py-8">
      <section className="text-center max-w-4xl mx-auto animate-fade-in-up">
        <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-4 sm:mb-6 px-2" style={{ color: '#1E5631' }}>
          Real Stories. Real Impact.
        </h1>
        <div className="w-24 sm:w-32 h-1 mx-auto rounded-full mb-4 sm:mb-6 animate-expand-width" style={{ backgroundColor: '#C4A747' }}></div>
        <p className="text-sm sm:text-base md:text-lg lg:text-xl text-gray-700 leading-relaxed px-2">
          Our clients come from diverse backgrounds but they share one thing in common: a desire for clarity, confidence, and control over their financial future. Here's what they say about working with Rakhi.
        </p>
      </section>

      <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-6 sm:gap-8">
        {testimonials.map((testimonial, index) => (
          <div
            key={index}
            className="bg-white p-6 sm:p-8 rounded-xl sm:rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 border-t-4 transform hover:scale-[1.02] animate-fade-in-up"
            style={{ animationDelay: `${index * 0.1}s`, borderColor: '#C4A747' }}
          >
            <div className="flex items-start gap-3 sm:gap-4 mb-4 sm:mb-6">
              <div className="flex-shrink-0">
                <img
                  src={testimonial.image}
                  alt={testimonial.name}
                  className="w-14 h-14 sm:w-16 sm:h-16 rounded-full object-cover border-2 transform transition-transform duration-300 hover:scale-110"
                  style={{ borderColor: '#1E5631' }}
                  loading="lazy"
                  decoding="async"
                  onError={(e) => {
                    e.currentTarget.src = FALLBACK_AVATAR;
                  }}
                />
              </div>
              <div className="flex-grow">
                <div className="flex justify-between items-start flex-wrap gap-2">
                  <div>
                    <h4 className="text-lg sm:text-xl font-bold" style={{ color: '#1E5631' }}>{testimonial.name}</h4>
                    <p className="text-gray-600 text-xs sm:text-sm">{testimonial.role}</p>
                  </div>
                  <div className="flex gap-0.5 sm:gap-1">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <span
                        key={i}
                        className="text-lg sm:text-xl animate-fade-in-scale"
                        style={{ animationDelay: `${i * 0.1}s`, color: '#C4A747' }}
                      >⭐</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            <div className="space-y-3 sm:space-y-4">
              {testimonial.content.map((paragraph, idx) => (
                <p
                  key={idx}
                  className="text-gray-700 italic leading-relaxed text-xs sm:text-sm md:text-base animate-fade-in-up"
                  style={{ animationDelay: `${idx * 0.1}s` }}
                >
                  {paragraph}
                </p>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
