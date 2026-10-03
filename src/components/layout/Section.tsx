import React from 'react';

export interface SectionProps extends React.HTMLAttributes<HTMLElement> {
  id: string;
  className?: string;
  children: React.ReactNode;
}

export const Section: React.FC<SectionProps> = ({ id, className = '', children, ...props }) => {
  return (
    <section id={id} className={`section ${className}`.trim()} {...props}>
      {children}
    </section>
  );
};
