import React from 'react';
import { fireEvent, render, screen, within } from '@testing-library/react';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import BlogLayout from './BlogLayout';

function Location() {
  const { pathname, search } = useLocation();
  return <p data-testid="location">{pathname + search}</p>;
}

const renderLayout = () => render(
  <MemoryRouter initialEntries={['/blogs']}>
    <BlogLayout><p>Body</p></BlogLayout>
    <Routes><Route path="*" element={<Location />} /></Routes>
  </MemoryRouter>
);

test('uses the main site header, with Journal marked as the current page', () => {
  renderLayout();
  const nav = screen.getByRole('navigation', { name: 'Main' });
  expect(within(nav).getAllByRole('link', { name: 'Workshops' })[0]).toHaveAttribute('href', '/workshops');
  expect(within(nav).getAllByRole('link', { name: 'Journal' })[0]).toHaveAttribute('aria-current', 'page');
});

test('header links move to the matching main site page', () => {
  renderLayout();
  const nav = screen.getByRole('navigation', { name: 'Main' });
  fireEvent.click(within(nav).getAllByRole('link', { name: 'Services' })[0]);
  expect(screen.getByTestId('location')).toHaveTextContent('/services');
});

test('uses the main site footer and keeps the regulatory notice', () => {
  renderLayout();
  const footer = screen.getByRole('contentinfo');
  expect(within(footer).getByText('Empowering decisions, Enriching Journeys')).toBeInTheDocument();
  expect(within(footer).getByRole('link', { name: 'Disclosures' })).toHaveAttribute('href', '/disclosures');
  expect(screen.getByText(/ARN 313560/)).toBeInTheDocument();
});
