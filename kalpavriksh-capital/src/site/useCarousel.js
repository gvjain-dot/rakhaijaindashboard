import { useEffect, useState } from 'react';

const ADVANCE_MS = 5000;

/** A looping carousel that advances by itself and pauses briefly after the visitor uses it. */
export default function useCarousel(length) {
  const [current, setCurrent] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (isPaused) return undefined;
    const interval = setInterval(() => setCurrent((index) => (index + 1) % length), ADVANCE_MS);
    return () => clearInterval(interval);
  }, [current, isPaused, length]);

  useEffect(() => {
    if (!isPaused) return undefined;
    const timer = setTimeout(() => setIsPaused(false), ADVANCE_MS);
    return () => clearTimeout(timer);
  }, [isPaused]);

  /** `target` is 'prev', 'next' or a slide index. */
  const show = (target) => {
    setIsPaused(true);
    setCurrent((index) => {
      if (target === 'prev') return (index - 1 + length) % length;
      if (target === 'next') return (index + 1) % length;
      return target;
    });
  };

  return { current, show };
}
