import React, { useRef, useState, useCallback } from 'react';

export interface Card3DProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  maxTilt?: number; // Maximum tilt angle in degrees
  scale?: number;
  glow?: boolean;
}

export const Card3D: React.FC<Card3DProps> = ({
  children,
  className = '',
  maxTilt = 8,
  scale = 1.02,
  glow = true,
  style,
  ...props
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const rAFRef = useRef<number | null>(null);
  const [transform, setTransform] = useState('');
  const [glowStyle, setGlowStyle] = useState<React.CSSProperties>({ opacity: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      // Disable on touch / small screens or reduced motion
      if (window.innerWidth < 768 || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        return;
      }

      const clientX = e.clientX;
      const clientY = e.clientY;

      if (rAFRef.current !== null) return;

      rAFRef.current = window.requestAnimationFrame(() => {
        const card = cardRef.current;
        if (card) {
          const rect = card.getBoundingClientRect();
          const x = clientX - rect.left;
          const y = clientY - rect.top;

          const centerX = rect.width / 2;
          const centerY = rect.height / 2;

          const rotateX = ((centerY - y) / centerY) * maxTilt;
          const rotateY = ((x - centerX) / centerX) * maxTilt;

          setTransform(
            `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) translateY(-6px) translateZ(12px) scale3d(${scale}, ${scale}, ${scale})`
          );

          if (glow) {
            const glowX = (x / rect.width) * 100;
            const glowY = (y / rect.height) * 100;
            setGlowStyle({
              opacity: 1,
              background: `radial-gradient(circle at ${glowX.toFixed(1)}% ${glowY.toFixed(1)}%, rgba(240, 180, 41, 0.22) 0%, rgba(255, 45, 120, 0.12) 40%, transparent 70%)`,
            });
          }
        }
        rAFRef.current = null;
      });
    },
    [maxTilt, scale, glow]
  );

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    if (rAFRef.current !== null) {
      window.cancelAnimationFrame(rAFRef.current);
      rAFRef.current = null;
    }
    setIsHovered(false);
    setTransform('perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0px) translateZ(0px) scale3d(1, 1, 1)');
    setGlowStyle({ opacity: 0 });
  };

  return (
    <div
      ref={cardRef}
      className={`card-3d-wrapper ${className}`.trim()}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{
        ...style,
        transform: transform || undefined,
        transition: isHovered ? 'transform 0.1s ease-out' : 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
        transformStyle: 'preserve-3d',
        position: 'relative',
      }}
      {...props}
    >
      {glow && (
        <div
          className="card-3d-specular-glow"
          aria-hidden="true"
          style={{
            ...glowStyle,
            position: 'absolute',
            inset: 0,
            borderRadius: 'inherit',
            pointerEvents: 'none',
            zIndex: 3,
            transition: isHovered ? 'opacity 0.2s ease-out' : 'opacity 0.5s ease-out',
            mixBlendMode: 'screen',
          }}
        />
      )}
      {children}
    </div>
  );
};
