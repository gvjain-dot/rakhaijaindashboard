import { useEffect, useState } from 'react';

const HEADER_OFFSET_PX = 96; // sticky header + breathing room

const canObserve = () => typeof window !== 'undefined' && typeof window.IntersectionObserver === 'function';

/** 0-1 scroll progress through the page, for the bar on the header's edge. */
export function useReadingProgress(enabled) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!enabled) return undefined;
    let frame = 0;
    const update = () => {
      frame = 0;
      const { scrollTop, scrollHeight, clientHeight } = document.documentElement;
      const scrollable = scrollHeight - clientHeight;
      setProgress(scrollable > 0 ? Math.min(1, Math.max(0, scrollTop / scrollable)) : 0);
    };
    const onScroll = () => {
      if (!frame) frame = window.requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, [enabled]);

  return progress;
}

/** The id of the section the reader is in, from the list of heading ids in document order. */
export function useActiveSection(ids, enabled) {
  const [activeId, setActiveId] = useState('');
  const key = ids.join('|');

  useEffect(() => {
    setActiveId('');
    if (!enabled || ids.length === 0 || !canObserve()) return undefined;
    const inView = new Set();
    const observer = new window.IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => (entry.isIntersecting ? inView.add(entry.target.id) : inView.delete(entry.target.id)));
        const current = ids.filter((id) => inView.has(id)).pop();
        if (current) setActiveId(current);
      },
      { rootMargin: `-${HEADER_OFFSET_PX}px 0px -65% 0px` }
    );
    ids.forEach((id) => {
      const heading = document.getElementById(id);
      if (heading) observer.observe(heading);
    });
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, enabled]);

  return activeId;
}
