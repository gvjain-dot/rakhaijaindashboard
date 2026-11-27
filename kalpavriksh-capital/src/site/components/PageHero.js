import React from 'react';

export default function PageHero({ title, children }) {
  return (
    <section className="text-center max-w-4xl mx-auto animate-fade-in-up">
      <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-4 sm:mb-6 px-2" style={{ color: '#1E5631' }}>
        {title}
      </h1>
      <div className="w-24 sm:w-32 h-1 mx-auto rounded-full mb-4 sm:mb-6" style={{ backgroundColor: '#C4A747' }}></div>
      <p className="text-base sm:text-lg text-gray-700 leading-relaxed px-2">{children}</p>
    </section>
  );
}
