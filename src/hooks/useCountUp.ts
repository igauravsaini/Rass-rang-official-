import { useState, useEffect, useRef } from 'react';

export interface UseCountUpOptions {
  target: number;
  duration?: number;
  trigger?: boolean;
}

export function useCountUp({ target, duration = 0, trigger = true }: UseCountUpOptions): number {
  // Initialize with target so numbers are immediately visible in 0ms (microseconds) on initial render
  const [count, setCount] = useState<number>(target);
  const animatedRef = useRef(false);

  useEffect(() => {
    if (!trigger || animatedRef.current) return;

    if (duration <= 0 || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
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
