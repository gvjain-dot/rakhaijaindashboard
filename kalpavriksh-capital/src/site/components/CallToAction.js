import React from 'react';
import { WhatsAppIcon } from './icons';
import { contactAction } from '../contactActions';

/** Discovery call and WhatsApp buttons. `service` and `topic` tie the enquiry to a service page. */
export default function CallToAction({ service, topic }) {
  return (
    <section className="max-w-4xl mx-auto rounded-2xl p-6 sm:p-10 text-center shadow-lg" style={{ background: 'linear-gradient(to bottom right, #1E5631, #163822)' }}>
      <h2 className="text-2xl sm:text-3xl font-bold mb-3 text-white">Let's talk about your goals</h2>
      <p className="mb-6 text-sm sm:text-base" style={{ color: '#F0EBE5' }}>
        A complimentary 30-minute conversation, with no pressure and no obligation.
      </p>
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <button type="button" onClick={() => contactAction('calendar', { service })}
          className="px-6 py-3 rounded-lg font-semibold bg-white shadow-md hover:shadow-lg" style={{ color: '#1E5631' }}>
          Schedule a 30-Minute Call
        </button>
        <button type="button" onClick={() => contactAction('whatsapp', { service, topic })}
          className="px-6 py-3 rounded-lg font-semibold text-white shadow-md hover:shadow-lg flex items-center justify-center gap-2" style={{ backgroundColor: '#25D366' }}>
          <WhatsAppIcon className="w-5 h-5" />
          Ask on WhatsApp
        </button>
      </div>
    </section>
  );
}
