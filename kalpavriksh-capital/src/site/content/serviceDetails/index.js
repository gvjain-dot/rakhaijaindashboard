import estate from './estate';
import goalBased from './goalBased';
import incomeTax from './incomeTax';
import insurance from './insurance';
import investments from './investments';
import learning from './learning';

// Keyed by the page keys in routes.json, in the same order.
export const SERVICE_DETAILS = {
  'goal-based': goalBased,
  investments,
  insurance,
  'income-tax': incomeTax,
  estate,
  learning,
};
