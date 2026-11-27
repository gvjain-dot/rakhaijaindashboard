import React from 'react';

/** Questions as native disclosure widgets, so answers are in the HTML and work without scripts. */
export default function FaqList({ faqs }) {
  return (
    <div className="space-y-3">
      {faqs.map(({ question, answer }) => (
        <details key={question} className="bg-white rounded-xl shadow-sm">
          <summary className="cursor-pointer font-semibold text-sm sm:text-base px-4 sm:px-5 py-4" style={{ color: '#1E5631' }}>{question}</summary>
          <p className="px-4 sm:px-5 pb-4 text-sm sm:text-base text-gray-700 leading-relaxed">{answer}</p>
        </details>
      ))}
    </div>
  );
}
