import React from 'react';
import { fireEvent, render, screen, within } from '@testing-library/react';
import { MemoryRouter, useLocation } from 'react-router-dom';
import App from '../App';
import routes from './routes.json';
import { SERVICE_PAGES, pageByKey } from './navigation';
import { SERVICE_DETAILS } from './content/serviceDetails';

function Location() {
  const { pathname, search } = useLocation();
  return <p data-testid="location">{pathname + search}</p>;
}

const renderAt = (url) => render(
  <MemoryRouter initialEntries={[url]}>
    <App />
    <Location />
  </MemoryRouter>
);

const mainNav = () => screen.getByRole('navigation', { name: 'Main' });
const head = (selector, attribute = 'content') => document.head.querySelector(selector)?.getAttribute(attribute);

beforeEach(() => {
  window.open = jest.fn();
  window.gtag = jest.fn();
});

describe.each(routes.pages)('$path', ({ path, title, description }) => {
  test('renders one main heading and sets its own head tags', () => {
    renderAt(path);
    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1);
    expect(screen.getByRole('main')).toBeInTheDocument();
    expect(document.title).toBe(title);
    expect(head('meta[name="description"]')).toBe(description);
    expect(head('link[rel="canonical"]', 'href')).toBe(`${routes.siteUrl}${path}`);
  });
});

test('head tags return to the home values after leaving the site pages', () => {
  const { unmount } = renderAt('/about-us');
  unmount();
  expect(document.title).toBe(pageByKey('home').title);
  expect(head('link[rel="canonical"]', 'href')).toBe(`${routes.siteUrl}/`);
});

test('has content for each of the six services', () => {
  expect(Object.keys(SERVICE_DETAILS)).toEqual(SERVICE_PAGES);
});

describe.each(SERVICE_PAGES)('service page %s', (key) => {
  const detail = SERVICE_DETAILS[key];

  test('shows questions, related services and the regulatory note', () => {
    renderAt(pageByKey(key).path);
    detail.faqs.forEach(({ question }) => expect(screen.getByText(question)).toBeInTheDocument());
    const related = screen.getByRole('region', { name: 'Related services' });
    expect(within(related).getAllByRole('link')).toHaveLength(detail.related.length);
    expect(screen.getByRole('complementary', { name: 'Regulatory information' })).toHaveTextContent('313560');
  });

  test('pre-fills WhatsApp with the service and records the lead', () => {
    renderAt(pageByKey(key).path);
    fireEvent.click(screen.getByRole('button', { name: 'Ask on WhatsApp' }));
    expect(window.open.mock.calls[0][0]).toContain(`text=${encodeURIComponent(`Hi Rakhi, I would like to know more about ${detail.topic}.`)}`);
    expect(window.gtag).toHaveBeenCalledWith('event', 'lead_click', { method: 'whatsapp', service: key });
  });

  test('avoids claims the firm cannot make', () => {
    expect(JSON.stringify(detail)).not.toMatch(/investment advis|guaranteed|80C|assured return/i);
  });
});

test('the services page links to all six service pages', () => {
  renderAt('/services');
  const main = screen.getByRole('main');
  SERVICE_PAGES.forEach((key) => {
    expect(within(main).getByRole('link', { name: new RegExp(pageByKey(key).label) }))
      .toHaveAttribute('href', pageByKey(key).path);
  });
});

test('old ?page= links redirect to the new page', () => {
  renderAt('/?page=contact');
  expect(screen.getByTestId('location')).toHaveTextContent(/^\/contact-us$/);
});

test('unknown addresses show a not found page marked noindex', () => {
  renderAt('/no-such-page');
  expect(screen.getByRole('heading', { level: 1, name: 'Page not found' })).toBeInTheDocument();
  expect(head('meta[name="robots"]')).toBe('noindex, follow');
});

test('the services menu opens, lists the services and closes with Escape', () => {
  renderAt('/');
  const toggle = within(mainNav()).getByRole('button', { name: 'Show services' });
  fireEvent.click(toggle);
  expect(toggle).toHaveAttribute('aria-expanded', 'true');
  const menu = within(mainNav()).getByRole('list', { name: 'Services menu' });
  expect(within(menu).getAllByRole('link')).toHaveLength(6);
  fireEvent.keyDown(menu, { key: 'Escape' });
  expect(toggle).toHaveAttribute('aria-expanded', 'false');
});

test('choosing a service from the menu opens its page', () => {
  renderAt('/');
  fireEvent.click(within(mainNav()).getByRole('button', { name: 'Show services' }));
  const menu = within(mainNav()).getByRole('list', { name: 'Services menu' });
  fireEvent.click(within(menu).getByRole('link', { name: 'Estate Planning' }));
  expect(screen.getByTestId('location')).toHaveTextContent(/^\/estate-planning$/);
});

test('the Services link and its arrow sit inside one control', () => {
  renderAt('/');
  const group = within(mainNav()).getByRole('group', { name: 'Services navigation' });
  expect(within(group).getByRole('link', { name: 'Services' })).toHaveAttribute('href', '/services');
  expect(within(group).getByRole('button', { name: 'Show services' })).toBeInTheDocument();
});

test('the services menu opens on hover, stays open on the first click and closes when the pointer leaves', () => {
  renderAt('/');
  const group = within(mainNav()).getByRole('group', { name: 'Services navigation' });
  const toggle = within(group).getByRole('button', { name: 'Show services' });
  fireEvent.mouseEnter(group);
  expect(toggle).toHaveAttribute('aria-expanded', 'true');
  // A touch tap fires mouseenter and then click, so that click must not close the menu again.
  fireEvent.click(toggle);
  expect(toggle).toHaveAttribute('aria-expanded', 'true');
  fireEvent.click(toggle);
  expect(toggle).toHaveAttribute('aria-expanded', 'false');
  fireEvent.mouseEnter(group);
  fireEvent.mouseLeave(group);
  expect(toggle).toHaveAttribute('aria-expanded', 'false');
});

test('Escape closes the mobile menu', () => {
  renderAt('/');
  const toggle = within(mainNav()).getByRole('button', { name: 'Toggle menu' });
  fireEvent.click(toggle);
  expect(toggle).toHaveAttribute('aria-expanded', 'true');
  fireEvent.keyDown(window, { key: 'Escape' });
  expect(toggle).toHaveAttribute('aria-expanded', 'false');
});

test.each([
  ['Contact via WhatsApp', 'whatsapp', 'https://wa.me/919886980120'],
  ['Schedule a meeting', 'calendar', 'https://calendly.com/rakhi-jain-fermatprime/30min'],
])('the floating button "%s" opens the link and records the lead', (name, method, url) => {
  renderAt('/faqs');
  fireEvent.click(screen.getByRole('button', { name }));
  expect(window.open).toHaveBeenCalledWith(url, '_blank', 'noopener,noreferrer');
  expect(window.gtag).toHaveBeenCalledWith('event', 'lead_click', { method });
});

test('contact actions still work when analytics is blocked', () => {
  delete window.gtag;
  renderAt('/contact-us');
  fireEvent.click(screen.getByRole('button', { name: /LinkedIn/ }));
  fireEvent.click(screen.getByRole('button', { name: 'Schedule a 30-Minute Call' }));
  expect(window.open).toHaveBeenCalledTimes(2);
});

test('the testimonial carousel can be moved by hand', () => {
  renderAt('/');
  const dot = screen.getByRole('button', { name: 'Go to testimonial 2' });
  fireEvent.click(screen.getByRole('button', { name: 'Next testimonial' }));
  expect(dot).toHaveAttribute('aria-current', 'true');
  fireEvent.click(screen.getByRole('button', { name: 'Previous testimonial' }));
  expect(dot).not.toHaveAttribute('aria-current');
});
