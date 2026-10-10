import { useState, useEffect } from 'react';
import { SCROLLSPY_OFFSET } from '../lib/constants';

export function useScrollSpy(sectionIds: string[], offset: number = SCROLLSPY_OFFSET): string {
  const [activeId, setActiveId] = useState<string>(sectionIds[0] || 'home');

  useEffect(() => {
    const elements = sectionIds
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null);

    if (elements.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting);
        if (visible.length > 0) {
          visible.sort(
            (a, b) =>
              Math.abs(a.boundingClientRect.top - offset) -
              Math.abs(b.boundingClientRect.top - offset)
          );
          const targetId = visible[0].target.id;
          if (targetId) {
            setActiveId((prev) => (prev !== targetId ? targetId : prev));
          }
        }
      },
      {
        rootMargin: `-${offset}px 0px -40% 0px`,
        threshold: [0, 0.25, 0.5],
      }
    );

    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [sectionIds, offset]);

  return activeId;
}

