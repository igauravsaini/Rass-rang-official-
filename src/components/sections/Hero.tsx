import React, { useCallback, useRef } from 'react';
import { siteConfig } from '../../data/site';
import { useCountdown } from '../../hooks/useCountdown';

export const Hero: React.FC = () => {
  const { days, hours, minutes, seconds, isStarted } = useCountdown();
  const heroSectionRef = useRef<HTMLElement>(null);
  const mouseAnimRef = useRef<number | null>(null);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLElement>) => {
    if (window.innerWidth < 768 || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const currentTarget = e.currentTarget;
    const clientX = e.clientX;
    const clientY = e.clientY;

    if (mouseAnimRef.current !== null) return;

    mouseAnimRef.current = window.requestAnimationFrame(() => {
      const rect = currentTarget.getBoundingClientRect();
      const x = (clientX - rect.left) / rect.width - 0.5;
      const y = (clientY - rect.top) / rect.height - 0.5;
      if (heroSectionRef.current) {
        heroSectionRef.current.style.setProperty('--mouse-x', x.toFixed(3));
        heroSectionRef.current.style.setProperty('--mouse-y', y.toFixed(3));
      }
      mouseAnimRef.current = null;
    });
  }, []);

  const handleMouseLeave = useCallback(() => {
    if (mouseAnimRef.current !== null) {
      window.cancelAnimationFrame(mouseAnimRef.current);
      mouseAnimRef.current = null;
    }
    if (heroSectionRef.current) {
      heroSectionRef.current.style.setProperty('--mouse-x', '0');
      heroSectionRef.current.style.setProperty('--mouse-y', '0');
    }
  }, []);

  const handleSmoothScroll = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    const target = document.querySelector(href);
    if (target) {
      const offsetTop = (target as HTMLElement).offsetTop - 75;
      window.scrollTo({
        top: offsetTop,
        behavior: 'smooth',
      });
    }
  };

  return (
    <section
      id="home"
      ref={heroSectionRef}
      className="hero-section"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <div className="hero-bg-container">
        <div
          className="hero-bg-image"
          style={{
            transform: 'translate3d(calc(var(--mouse-x, 0) * -10px), calc(var(--mouse-y, 0) * -8px), 0)',
            transition: 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
          }}
        ></div>
        <div className="hero-overlay"></div>
        <div className="hero-mandala-overlay"></div>
      </div>

      {/* Temple-Inspired Gold Arch Framing the Hero */}
      <div className="hero-temple-arch" aria-hidden="true">
        <div className="arch-crest">
          <svg viewBox="0 0 160 50" className="arch-crest-svg">
            <path
              d="M80 5 C70 20, 50 15, 30 25 C15 32, 5 45, 0 50 L160 50 C155 45, 145 32, 130 25 C110 15, 90 20, 80 5 Z"
              fill="none"
              stroke="url(#goldGrad)"
              strokeWidth="2"
            />
            <circle cx="80" cy="12" r="4" fill="url(#goldGrad)" />
            <path d="M80 18 L80 45 M65 30 L95 30" stroke="url(#goldGrad)" strokeWidth="1.5" />
            <defs>
              <linearGradient id="goldGrad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#FFF2D1" />
                <stop offset="50%" stopColor="#D9A441" />
                <stop offset="100%" stopColor="#8B6914" />
              </linearGradient>
            </defs>
          </svg>
        </div>
        <div className="arch-border-line"></div>
      </div>

      {/* Ceremonial Red Velvet Drapes with Gold Fringe */}
      <div
        className="hero-drapes hero-drape-left"
        aria-hidden="true"
        style={{
          transform: 'translate3d(calc(var(--mouse-x, 0) * 6px), calc(var(--mouse-y, 0) * 4px), 0)',
          transition: 'transform 0.3s ease-out',
        }}
      >
        <div className="drape-swag"></div>
        <div className="drape-fringe"></div>
        <div className="drape-tassel"></div>
      </div>
      <div
        className="hero-drapes hero-drape-right"
        aria-hidden="true"
        style={{
          transform: 'translate3d(calc(var(--mouse-x, 0) * 6px), calc(var(--mouse-y, 0) * 4px), 0)',
          transition: 'transform 0.3s ease-out',
        }}
      >
        <div className="drape-swag"></div>
        <div className="drape-fringe"></div>
        <div className="drape-tassel"></div>
      </div>

      {/* Hanging Brass Bells on Golden Chains (Left & Right Clusters) */}
      <div
        className="hero-bells-cluster bells-left"
        aria-hidden="true"
        style={{
          transform: 'translate3d(calc(var(--mouse-x, 0) * 14px), calc(var(--mouse-y, 0) * 10px), 0)',
          transition: 'transform 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        <div className="bell-unit bell-top">
          <div className="bell-chain"></div>
          <div className="bell-body">
            <div className="bell-dome"></div>
            <div className="bell-rim"></div>
            <div className="bell-clapper"></div>
            <div className="bell-glow"></div>
          </div>
        </div>
        <div className="bell-unit bell-mid">
          <div className="bell-chain"></div>
          <div className="bell-body">
            <div className="bell-dome"></div>
            <div className="bell-rim"></div>
            <div className="bell-clapper"></div>
            <div className="bell-glow"></div>
          </div>
        </div>
        <div className="bell-unit bell-low">
          <div className="bell-chain"></div>
          <div className="bell-body">
            <div className="bell-dome"></div>
            <div className="bell-rim"></div>
            <div className="bell-clapper"></div>
            <div className="bell-glow"></div>
          </div>
        </div>
      </div>

      <div
        className="hero-bells-cluster bells-right"
        aria-hidden="true"
        style={{
          transform: 'translate3d(calc(var(--mouse-x, 0) * 14px), calc(var(--mouse-y, 0) * 10px), 0)',
          transition: 'transform 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        <div className="bell-unit bell-top">
          <div className="bell-chain"></div>
          <div className="bell-body">
            <div className="bell-dome"></div>
            <div className="bell-rim"></div>
            <div className="bell-clapper"></div>
            <div className="bell-glow"></div>
          </div>
        </div>
        <div className="bell-unit bell-mid">
          <div className="bell-chain"></div>
          <div className="bell-body">
            <div className="bell-dome"></div>
            <div className="bell-rim"></div>
            <div className="bell-clapper"></div>
            <div className="bell-glow"></div>
          </div>
        </div>
        <div className="bell-unit bell-low">
          <div className="bell-chain"></div>
          <div className="bell-body">
            <div className="bell-dome"></div>
            <div className="bell-rim"></div>
            <div className="bell-clapper"></div>
            <div className="bell-glow"></div>
          </div>
        </div>
      </div>

      {/* Festive Bandhani Dandiya Sticks in Foreground Corners */}
      <div className="hero-dandiya-frame dandiya-left" aria-hidden="true">
        <div className="dandiya-stick stick-1"></div>
        <div className="dandiya-stick stick-2"></div>
        <div className="dandiya-tassel"></div>
      </div>
      <div className="hero-dandiya-frame dandiya-right" aria-hidden="true">
        <div className="dandiya-stick stick-1"></div>
        <div className="dandiya-stick stick-2"></div>
        <div className="dandiya-tassel"></div>
      </div>

      {/* Floating Diyas with Glowing Halos with Parallax */}
      <div
        className="floating-diya diya-bl"
        aria-hidden="true"
        style={{
          transform: 'translate3d(calc(var(--mouse-x, 0) * 22px), calc(var(--mouse-y, 0) * 16px), 0)',
          transition: 'transform 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        <div className="diya-oil-lamp"></div>
        <div className="diya-flame"></div>
        <div className="diya-halo"></div>
      </div>
      <div
        className="floating-diya diya-br"
        aria-hidden="true"
        style={{
          transform: 'translate3d(calc(var(--mouse-x, 0) * 22px), calc(var(--mouse-y, 0) * 16px), 0)',
          transition: 'transform 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        <div className="diya-oil-lamp"></div>
        <div className="diya-flame"></div>
        <div className="diya-halo"></div>
      </div>

      {/* HERO MAIN CONTENT */}
      <div className="hero-content">
        {/* 1. Official Logo with Radiant Golden Halo */}
        <div
          className="hero-logo-showcase"
          style={{
            transform: 'translate3d(calc(var(--mouse-x, 0) * 8px), calc(var(--mouse-y, 0) * 6px), 0)',
            transition: 'transform 0.25s ease-out',
          }}
        >
          <div className="logo-light-rays"></div>
          <div className="logo-ring-rotate"></div>
          <picture>
            <source srcSet="/assets/images/logo-360.webp" type="image/webp" />
            <img
              src="/assets/images/logo-360.webp"
              alt="Raas Rang Official Logo"
              className="hero-logo-img"
              width={130}
              height={130}
              fetchPriority="high"
              decoding="async"
            />
          </picture>
        </div>

        {/* 2, 3, 4. Top Royal Maroon Plaque & Heading */}
        <div className="hero-top-heading">
          {/* Royal Scalloped Maroon Plaque: DEAR GORAKHPUR! */}
          <div className="dear-gorakhpur-plaque">
            <div className="plaque-crown-crest"></div>
            <div className="plaque-filigree-bracket left"></div>
            <span className="plaque-text">DEAR GORAKHPUR!</span>
            <div className="plaque-filigree-bracket right"></div>
            <div className="plaque-lotus-finial"></div>
          </div>

          {/* Deep Navy Banner: GET READY FOR THE BEST NAVRATRI EVE */}
          <div className="get-ready-banner">
            <span className="banner-border top"></span>
            <span className="get-ready-text">GET READY FOR THE BEST NAVRATRI EVE</span>
            <span className="banner-border bottom"></span>
          </div>

          <div className="banner-lotus-accent" aria-hidden="true">
            <svg viewBox="0 0 24 16" width="22" height="14" className="lotus-svg">
              <path
                d="M12 1 C13 5, 17 8, 23 10 C18 12, 14 14, 12 15 C10 14, 6 12, 1 10 C7 8, 11 5, 12 1 Z"
                fill="url(#goldGrad)"
              />
              <circle cx="12" cy="9" r="1.5" fill="#FFF2D1" />
            </svg>
          </div>
          <div className="small-at">at</div>
        </div>

        {/* 5, 6, 7. Title Block (Brochure 3D Embossed Metallic Champagne Gold) */}
        <h1
          className="hero-title"
          style={{
            transform: 'translate3d(calc(var(--mouse-x, 0) * 5px), calc(var(--mouse-y, 0) * 3px), 0)',
            transition: 'transform 0.25s ease-out',
          }}
        >
          <span className="hero-title-main">RAAS-RANG</span>
          <span className="hero-title-sub">GARBA NIGHTS</span>
          <span className="hero-title-year">
            <span className="year-flourish-svg left" aria-hidden="true">
              <svg viewBox="0 0 70 30" width="60" height="26">
                <path
                  d="M68 22 C55 26, 42 16, 28 20 C16 24, 8 12, 2 15 C12 9, 24 12, 36 6 C48 0, 58 12, 68 10"
                  fill="none"
                  stroke="url(#goldGrad)"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
                <circle cx="4" cy="15" r="3" fill="url(#goldGrad)" />
                <circle cx="68" cy="22" r="2.5" fill="url(#goldGrad)" />
              </svg>
            </span>
            <span className="year-number">2026</span>
            <span className="year-flourish-svg right" aria-hidden="true">
              <svg viewBox="0 0 70 30" width="60" height="26" style={{ transform: 'scaleX(-1)' }}>
                <path
                  d="M68 22 C55 26, 42 16, 28 20 C16 24, 8 12, 2 15 C12 9, 24 12, 36 6 C48 0, 58 12, 68 10"
                  fill="none"
                  stroke="url(#goldGrad)"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
                <circle cx="4" cy="15" r="3" fill="url(#goldGrad)" />
                <circle cx="68" cy="22" r="2.5" fill="url(#goldGrad)" />
              </svg>
            </span>
          </span>
        </h1>

        {/* 8. Emotional Identity: Hindi Motto */}
        <p className="hero-tagline-hindi">
          <span className="hindi-word">भक्ति</span>
          <span className="tagline-lotus-svg" aria-hidden="true">
            <svg viewBox="0 0 20 14" width="18" height="12">
              <path
                d="M10 1 C11 4, 14 7, 19 8 C15 10, 12 11, 10 13 C8 11, 5 10, 1 8 C6 7, 9 4, 10 1 Z"
                fill="url(#goldGrad)"
              />
            </svg>
          </span>
          <span className="hindi-word">संस्कृति</span>
          <span className="tagline-lotus-svg" aria-hidden="true">
            <svg viewBox="0 0 20 14" width="18" height="12">
              <path
                d="M10 1 C11 4, 14 7, 19 8 C15 10, 12 11, 10 13 C8 11, 5 10, 1 8 C6 7, 9 4, 10 1 Z"
                fill="url(#goldGrad)"
              />
            </svg>
          </span>
          <span className="hindi-word">संगम</span>
        </p>

        {/* 9. Decorative Lotus Divider */}
        <div className="hero-ornament" aria-hidden="true">
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

        {/* 10, 11, 12. Venue / Date / Time Royal Engraved Plaques */}
        <div
          className="hero-info-frames"
          style={{
            transform: 'translate3d(calc(var(--mouse-x, 0) * 7px), calc(var(--mouse-y, 0) * 5px), 0)',
            transition: 'transform 0.25s ease-out',
          }}
        >
          {/* Venue Plaque */}
          <div className="info-frame venue-frame">
            <div className="frame-floral-wing left"></div>
            <div className="frame-filigree frame-filigree-tl"></div>
            <div className="frame-filigree frame-filigree-tr"></div>
            <div className="frame-filigree frame-filigree-bl"></div>
            <div className="frame-filigree frame-filigree-br"></div>
            <div className="frame-label-pill">✦ Venue ✦</div>
            <div className="frame-value script-font">{siteConfig.venueName}</div>
            <div className="frame-sub">{siteConfig.venueCityState}</div>
            <div className="frame-floral-wing right"></div>
          </div>

          {/* Date Plaque */}
          <div className="info-frame date-frame">
            <div className="frame-floral-wing left"></div>
            <div className="frame-filigree frame-filigree-tl"></div>
            <div className="frame-filigree frame-filigree-tr"></div>
            <div className="frame-filigree frame-filigree-bl"></div>
            <div className="frame-filigree frame-filigree-br"></div>
            <div className="frame-label-pill">✦ Date ✦</div>
            <div className="frame-value serif-font">{siteConfig.displayDate}</div>
            <div className="frame-sub">{siteConfig.displayDateSub}</div>
            <div className="frame-floral-wing right"></div>
          </div>

          {/* Time Plaque */}
          <div className="info-frame time-frame">
            <div className="frame-floral-wing left"></div>
            <div className="frame-filigree frame-filigree-tl"></div>
            <div className="frame-filigree frame-filigree-tr"></div>
            <div className="frame-filigree frame-filigree-bl"></div>
            <div className="frame-filigree frame-filigree-br"></div>
            <div className="frame-label-pill">✦ Time ✦</div>
            <div className="frame-value serif-font">{siteConfig.time}</div>
            <div className="frame-sub">{siteConfig.timeSub}</div>
            <div className="frame-floral-wing right"></div>
          </div>
        </div>

        {/* 13. CTA Buttons */}
        <div className="hero-buttons">
          <a
            href="#tickets"
            className="btn btn-primary"
            id="hero-book-tickets"
            onClick={(e) => {
              e.preventDefault();
              window.dispatchEvent(
                new CustomEvent('open-booking-modal', {
                  detail: { passType: 'COUPLE', passMode: 'offline' },
                })
              );
            }}
          >
            Book Tickets
          </a>
          <a
            href="#events"
            className="btn btn-outline"
            id="hero-explore-event"
            onClick={(e) => handleSmoothScroll(e, '#events')}
          >
            Explore Event
          </a>
        </div>

        {/* 14. Countdown Timer */}
        <div className="countdown-container" id="countdown-container">
          {isStarted ? (
            <div
              className="countdown-label"
              style={{ color: 'var(--antique-gold)', fontSize: '1.2rem' }}
            >
              🎉 The Celebration Has Begun! 🎉
            </div>
          ) : (
            <>
              <div className="countdown-label">Event Begins In</div>
              <div className="countdown-timer" id="countdown-timer">
                <div className="countdown-item">
                  <span className="countdown-value" id="countdown-days">
                    {days}
                  </span>
                  <span className="countdown-unit">Days</span>
                </div>
                <div className="countdown-separator">:</div>
                <div className="countdown-item">
                  <span className="countdown-value" id="countdown-hours">
                    {hours}
                  </span>
                  <span className="countdown-unit">Hours</span>
                </div>
                <div className="countdown-separator">:</div>
                <div className="countdown-item">
                  <span className="countdown-value" id="countdown-minutes">
                    {minutes}
                  </span>
                  <span className="countdown-unit">Minutes</span>
                </div>
                <div className="countdown-separator">:</div>
                <div className="countdown-item">
                  <span className="countdown-value" id="countdown-seconds">
                    {seconds}
                  </span>
                  <span className="countdown-unit">Seconds</span>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      
    </section>
  );
};
