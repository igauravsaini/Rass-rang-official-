import { useState, useEffect } from 'react';
import { SCROLLSPY_OFFSET } from '../lib/constants';

export function useScrollSpy(sectionIds: string[], offset: number = SCROLLSPY_OFFSET): string {
  const [activeId, setActiveId] = useState<string>(sectionIds[0] || 'home');

  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const scrollY = window.pageYOffset + offset;

          for (const id of sectionIds) {
            const el = document.getElementById(id);
            if (el) {
              const top = el.offsetTop;
              const height = el.offsetHeight;
              if (scrollY >= top && scrollY < top + height) {
                setActiveId((prev) => (prev !== id ? id : prev));
                break;
              }
            }
          }
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, [sectionIds, offset]);

  return activeId;
}
