import { useState, useEffect, useRef } from 'react';

export interface UseCountUpOptions {
  target: number;
  duration?: number;
  trigger?: boolean;
}

export function useCountUp({ target, duration = 2000, trigger = false }: UseCountUpOptions): number {
  const [count, setCount] = useState(0);
  const animatedRef = useRef(false);

  useEffect(() => {
    if (!trigger || animatedRef.current) return;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setCount(target);
      animatedRef.current = true;
      return;
    }

    animatedRef.current = true;
    let animId: number;
    const start = performance.now();

    function step(currentTime: number) {
      const elapsed = currentTime - start;
      const progress = Math.min(elapsed / duration, 1);
      // Replicate original cubic ease-out
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.floor(eased * target);
      setCount(current);

      if (progress < 1) {
        animId = requestAnimationFrame(step);
      } else {
        setCount(target);
      }
    }

    animId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(animId);
  }, [trigger, target, duration]);

  return count;
}
