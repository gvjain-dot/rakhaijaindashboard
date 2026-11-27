import trackLead from './trackLead';

const WHATSAPP_URL = 'https://wa.me/919886980120';
const EMAIL_URL = 'mailto:info@kalpvrikshglobal.com?subject=Financial Consultation Inquiry&body=Hi Rakhi,%0A%0AI would like to discuss my financial planning needs.%0A%0ABest regards,';

const LINKS = {
  calendar: 'https://calendly.com/rakhi-jain-fermatprime/30min',
  linkedin: 'https://www.linkedin.com/in/rakhi-jain-7658328/',
  youtube: 'https://www.youtube.com/@KalpvrikshGlobal',
  whatsapp: WHATSAPP_URL,
};

const LEAD_METHODS = new Set(['calendar', 'email', 'whatsapp']);

const openTab = (url) => window.open(url, '_blank', 'noopener,noreferrer');

/** Opens a contact channel. `service` and `topic` pre-fill WhatsApp and label the analytics event. */
export function contactAction(action, { service, topic } = {}) {
  if (LEAD_METHODS.has(action)) trackLead(action, service);
  if (action === 'email') {
    window.location.href = EMAIL_URL;
  } else if (action === 'whatsapp' && topic) {
    openTab(`${WHATSAPP_URL}?text=${encodeURIComponent(`Hi Rakhi, I would like to know more about ${topic}.`)}`);
  } else if (Object.prototype.hasOwnProperty.call(LINKS, action)) {
    openTab(LINKS[action]);
  }
}
