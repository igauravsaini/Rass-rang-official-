import React from 'react';
import { useInView } from '../../hooks/useInView';

export interface RevealProps {
  children: React.ReactNode;
  direction?: 'up' | 'left' | 'right';
  delay?: string;
  className?: string;
  id?: string;
  style?: React.CSSProperties;
}

export const Reveal: React.FC<RevealProps> = ({
  children,
  direction = 'up',
  delay = '0s',
  className = '',
  id,
  style,
}) => {
  const [ref, isInView] = useInView<HTMLDivElement>();

  const directionClass =
    direction === 'left' ? 'reveal-left' : direction === 'right' ? 'reveal-right' : 'reveal-up';

  const revealedClass = isInView ? 'revealed' : '';

  return (
    <div
      ref={ref}
      id={id}
      className={`${directionClass} ${revealedClass} ${className}`.trim()}
      style={{ '--delay': delay, ...style } as React.CSSProperties}
    >
      {children}
    </div>
  );
};
