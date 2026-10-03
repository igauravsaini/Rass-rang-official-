import React from 'react';

export interface BadgeProps {
  children: React.ReactNode;
  variant?: 'gold' | 'popular' | 'tier';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ children, variant = 'gold', className = '' }) => {
  const badgeClass =
    variant === 'popular'
      ? 'ticket-popular-badge'
      : variant === 'tier'
      ? 'sponsor-tier-badge'
      : 'frame-label-pill';

  return <div className={`${badgeClass} ${className}`.trim()}>{children}</div>;
};
