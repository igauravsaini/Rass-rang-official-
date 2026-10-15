import React, { useEffect, useState } from 'react';

export const Preloader: React.FC = () => {
  // Session check for Instant Load: skip mounting entirely if seen in this session
  const alreadySeen = typeof window !== 'undefined' && Boolean(sessionStorage.getItem('raas_intro_seen'));
  const [isLoaded, setIsLoaded] = useState(alreadySeen);
  const [isUnmounted, setIsUnmounted] = useState(alreadySeen);

  useEffect(() => {
    if (alreadySeen) return;

    const finishLoading = () => {
      setIsLoaded(true);
      try {
        sessionStorage.setItem('raas_intro_seen', '1');
      } catch {
        // Ignore private browsing storage restriction
      }
    };

    // Fast boot: trigger fade-out quickly (40ms) on first frame
    const timer = setTimeout(finishLoading, 40);
    const unmountTimer = setTimeout(() => setIsUnmounted(true), 240);

    return () => {
      clearTimeout(timer);
      clearTimeout(unmountTimer);
    };
  }, [alreadySeen]);

  if (isUnmounted || alreadySeen) return null;

  return (
    <div
      id="preloader"
      className={`cinematic-loader ${isLoaded ? 'loaded' : ''}`.trim()}
      aria-label="Loading Raas Rang Garba Nights 2026"
      role="status"
      onClick={() => setIsLoaded(true)}
      style={{ cursor: isLoaded ? 'default' : 'pointer' }}
    >
      <div className="loader-bg-overlay"></div>
      <div className="loader-particles" id="loader-particles"></div>
      <div className="loader-content">
        <div className="loader-halo">
          <div className="loader-halo-rays"></div>
          <div className="loader-halo-glow"></div>
        </div>
        <div className="loader-logo-wrap">
          <picture>
            <source
              srcSet="/assets/images/logo-180.webp 180w, /assets/images/logo-360.webp 360w"
              sizes="(max-width: 768px) 100px, 120px"
              type="image/webp"
            />
            <img
              src="/assets/images/logo-360.webp"
              srcSet="/assets/images/logo-180.webp 180w, /assets/images/logo-360.webp 360w"
              sizes="(max-width: 768px) 100px, 120px"
              alt="Raas Rang Official Emblem"
              className="loader-logo"
              width={120}
              height={120}
              fetchPriority="high"
              decoding="async"
            />
          </picture>
          <div className="loader-logo-ring"></div>
        </div>
        <div className="loader-motto-wrap">
          <span className="loader-motto-flourish" aria-hidden="true">
            ❧
          </span>
          <div className="loader-motto">भक्ति • संस्कृति • संगम</div>
          <span className="loader-motto-flourish" aria-hidden="true">
            ❧
          </span>
        </div>
      </div>
    </div>
  );
};
