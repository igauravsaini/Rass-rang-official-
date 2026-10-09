import React, { useState, useEffect } from 'react';
import { navItems } from '../../data/navigation';
import { useScrolled } from '../../hooks/useScrolled';
import { useScrollSpy } from '../../hooks/useScrollSpy';
import { useLockBodyScroll } from '../../hooks/useLockBodyScroll';

export const Navbar: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isScrolled = useScrolled(60);

  const sectionIds = ['home', 'about', 'events', 'schedule', 'tickets', 'contact'];
  const activeSection = useScrollSpy(sectionIds);

  // Lock scroll when mobile menu is open
  useLockBodyScroll(mobileMenuOpen);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && mobileMenuOpen) {
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [mobileMenuOpen]);

  const toggleMobileMenu = () => {
    setMobileMenuOpen((prev) => !prev);
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    closeMobileMenu();

    if (href.startsWith('#')) {
      const target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        const offsetTop = (target as HTMLElement).offsetTop - 75;
        window.scrollTo({
          top: offsetTop,
          behavior: 'smooth',
        });
      }
    }
  };

  return (
    <>
      <nav
        id="main-nav"
        className={`navbar ${isScrolled ? 'scrolled' : ''}`.trim()}
        role="navigation"
        aria-label="Main navigation"
      >
        <div className="nav-container">
          <a
            href="#home"
            className="nav-logo"
            aria-label="Raas Rang Home"
            onClick={(e) => handleNavClick(e, '#home')}
          >
            <div className="nav-logo-wrap">
              <picture>
                <source srcSet="/assets/images/logo-360.webp" type="image/webp" />
                <img
                  src="/assets/images/logo.jpg"
                  alt="Raas Rang Logo"
                  className="nav-logo-img"
                  width={45}
                  height={45}
                  decoding="async"
                />
              </picture>
            </div>
            <span className="nav-brand-text">RAAS~RANG</span>
          </a>

          <button
            className={`nav-toggle ${mobileMenuOpen ? 'active' : ''}`.trim()}
            id="nav-toggle"
            aria-label="Toggle navigation"
            aria-expanded={mobileMenuOpen}
            onClick={toggleMobileMenu}
          >
            <span className="hamburger-line"></span>
            <span className="hamburger-line"></span>
            <span className="hamburger-line"></span>
          </button>

          <ul className={`nav-menu ${mobileMenuOpen ? 'active' : ''}`.trim()} id="nav-menu">
            {navItems.map((item) => {
              const isActive = activeSection === item.href.replace('#', '');
              return (
                <li key={item.label}>
                  <a
                    href={item.href}
                    className={`nav-link ${isActive ? 'active' : ''}`.trim()}
                    onClick={(e) => handleNavClick(e, item.href)}
                  >
                    {item.label}
                  </a>
                </li>
              );
            })}
            <li>
              <a
                href="#tickets"
                className="nav-cta-btn"
                onClick={(e) => {
                  e.preventDefault();
                  closeMobileMenu();
                  window.dispatchEvent(
                    new CustomEvent('open-booking-modal', {
                      detail: { passType: 'COUPLE', passMode: 'offline' },
                    })
                  );
                }}
              >
                Book Now
              </a>
            </li>
          </ul>
        </div>
      </nav>

      {/* Mobile Menu Backdrop */}
      {mobileMenuOpen && (
        <div
          className="mobile-nav-backdrop active"
          onClick={closeMobileMenu}
          aria-hidden="true"
        />
      )}
    </>
  );
};
