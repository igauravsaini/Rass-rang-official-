import React from 'react';

export interface OrnamentProps {
  type?: 'lotus-divider' | 'flourish' | 'star' | 'lotus-glyph';
  className?: string;
}

export const Ornament: React.FC<OrnamentProps> = ({ type = 'lotus-divider', className = '' }) => {
  if (type === 'flourish') {
    return (
      <span className={`ornament-flourish ${className}`.trim()} aria-hidden="true">
        ❧
      </span>
    );
  }

  if (type === 'star') {
    return (
      <span className={`ornament-star ${className}`.trim()} aria-hidden="true">
        ✦
      </span>
    );
  }

  if (type === 'lotus-glyph') {
    return (
      <span className={`ornament-lotus ${className}`.trim()} aria-hidden="true">
        ❈
      </span>
    );
  }

  return (
    <div className={`hero-ornament ${className}`.trim()} aria-hidden="true">
      <span className="ornament-scroll-left">❧</span>
      <span className="ornament-line"></span>
      <span className="ornament-lotus-center">
        <svg viewBox="0 0 32 20" width="28" height="18">
          <path
            d="M16 1 C18 6, 23 10, 31 12 C24 15, 19 17, 16 19 C13 17, 8 15, 1 12 C9 10, 14 6, 16 1 Z"
            fill="url(#goldGrad)"
          />
          <circle cx="16" cy="11" r="2" fill="#FFF2D1" />
        </svg>
      </span>
      <span className="ornament-line"></span>
      <span className="ornament-scroll-right">❧</span>
    </div>
  );
};
