import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import ArticleFigure from './ArticleFigure';

const SRC = 'https://x.test/venn.webp';

describe('ArticleFigure', () => {
  test('shows the image with its caption and no fragment in the address', () => {
    render(<ArticleFigure src={`${SRC}#wide`} alt="Venn diagram" caption="Figure 1. Overlap" />);
    expect(screen.getByAltText('Venn diagram')).toHaveAttribute('src', SRC);
    expect(screen.getByText('Figure 1. Overlap').tagName).toBe('FIGCAPTION');
  });

  test('applies the layout stored in the fragment, defaulting to normal', () => {
    const { container, rerender } = render(<ArticleFigure src={`${SRC}#full`} alt="a" />);
    expect(container.querySelector('figure')).toHaveClass('kj-fig--full');
    rerender(<ArticleFigure src={SRC} alt="a" />);
    expect(container.querySelector('figure')).toHaveClass('kj-fig--normal');
  });

  test('omits the caption element when there is no caption', () => {
    const { container } = render(<ArticleFigure src={SRC} alt="a" />);
    expect(container.querySelector('figcaption')).toBeNull();
  });

  test('opens a lightbox on click and closes it with Escape', () => {
    render(<ArticleFigure src={SRC} alt="Venn diagram" caption="Figure 1" />);
    expect(screen.queryByRole('dialog')).toBeNull();

    fireEvent.click(screen.getByRole('button', { name: /enlarge image/i }));
    expect(screen.getByRole('dialog')).toBeInTheDocument();

    fireEvent.keyDown(document, { key: 'Escape' });
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  test('closes the lightbox from the close button', () => {
    render(<ArticleFigure src={SRC} alt="a" />);
    fireEvent.click(screen.getByRole('button', { name: /enlarge image/i }));
    fireEvent.click(screen.getByRole('button', { name: /close image/i }));
    expect(screen.queryByRole('dialog')).toBeNull();
  });
});
