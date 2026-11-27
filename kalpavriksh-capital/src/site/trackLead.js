/** Records a contact click in Google Analytics. Does nothing when analytics is blocked or not loaded. */
export default function trackLead(method, service) {
  if (typeof window === 'undefined' || typeof window.gtag !== 'function') return;
  window.gtag('event', 'lead_click', service ? { method, service } : { method });
}
