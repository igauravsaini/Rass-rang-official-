import React from 'react';

export interface SectionHeadingProps {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  className?: string;
}

export const SectionHeading: React.FC<SectionHeadingProps> = ({
  eyebrow,
  title,
  subtitle,
  className = '',
}) => {
  return (
    <div className={`section-header ${className}`.trim()}>
      {eyebrow && <span className="section-eyebrow">{eyebrow}</span>}
      <h2 className="section-title gold-shimmer">{title}</h2>
      <div className="section-divider">
        <span className="divider-lotus" aria-hidden="true">
          ❈
        </span>
      </div>
      {subtitle && <p className="section-subtitle">{subtitle}</p>}
    </div>
  );
};
