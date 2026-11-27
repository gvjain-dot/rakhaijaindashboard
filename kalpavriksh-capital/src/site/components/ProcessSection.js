import React from 'react';
import { processSteps } from '../content/processSteps';

export default function ProcessSection() {
  return (
    <section className="max-w-6xl mx-auto text-center mt-12">
      <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold mb-8 sm:mb-12 animate-fade-in-up px-2" style={{ color: '#1E5631' }}>Our Process</h2>
      <div className="grid grid-cols-1 min-[480px]:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 md:gap-8">
        {processSteps.map((step, index) => (
          <div
            key={index}
            className="bg-white p-4 sm:p-6 rounded-xl shadow-sm hover:shadow-md transition-all duration-500 transform hover:scale-105 animate-fade-in-up cursor-pointer border-2 relative"
            style={{ animationDelay: `${index * 0.1}s`, borderColor: '#C4A747' }}
          >
            <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 text-white rounded-full flex items-center justify-center text-lg sm:text-xl md:text-2xl font-bold mx-auto mb-3 sm:mb-4 transform transition-all duration-300 hover:rotate-360"
                 style={{ backgroundColor: '#163822' }}
                 onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#163822'}
                 onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#163822'}>
              {step.number}
            </div>
            <h4 className="text-base sm:text-lg font-semibold mb-2 px-1" style={{ color: '#1E5631' }}>{step.title}</h4>
            <p className="text-sm sm:text-base text-gray-600 px-1">{step.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
