import React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'normal' | 'sm';
  href?: string;
  className?: string;
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'normal',
  href,
  className = '',
  children,
  ...props
}) => {
  const variantClass =
    variant === 'secondary'
      ? 'btn-secondary'
      : variant === 'outline'
      ? 'btn-outline'
      : 'btn-primary';

  const sizeClass = size === 'sm' ? 'btn-sm' : '';
  const combinedClasses = `btn ${variantClass} ${sizeClass} ${className}`.trim();

  if (href) {
    return (
      <a href={href} className={combinedClasses} role="button">
        {children}
      </a>
    );
  }

  return (
    <button className={combinedClasses} {...props}>
      {children}
    </button>
  );
};
