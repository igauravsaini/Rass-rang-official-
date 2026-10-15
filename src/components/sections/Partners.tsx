import React from 'react';
import '../../styles/partners.css';

interface SponsorItem {
  id: string;
  name: string;
  label: string;
  logo: string;
  isCircular?: boolean;
}

const sponsors: SponsorItem[] = [
  {
    id: 'caha',
    name: 'Caha, The Coffee Club',
    label: 'Official Partner',
    logo: '/assets/images/sponsors/caha-coffee-club.webp',
  },
  {
    id: 'amar-ujala',
    name: 'Amar Ujala',
    label: 'Print Partner',
    logo: '/assets/images/sponsors/amar-ujala.webp?v=2',
  },
  {
    id: 'gd-goenka',
    name: 'GD Goenka Healthcare Academy, Mohaddipur',
    label: 'Healthcare Partner',
    logo: '/assets/images/sponsors/gd-goenka.webp',
    isCircular: true,
  },
  {
    id: 'onkar',
    name: 'Onkar Furniture and Decor',
    label: 'Associate Sponsor',
    logo: '/assets/images/sponsors/onkar-furniture.webp',
  },
  {
    id: 'shri-balaji',
    name: 'Shri Balaji Jewellers',
    label: 'Gifting Partner',
    logo: '/assets/images/sponsors/shri-balaji.webp',
  },
];

// Repeat 5 sponsors 3 times per half for 4K screen coverage (15 cards per half)
const singleSet = sponsors;
const firstHalf = [...singleSet, ...singleSet, ...singleSet];
const secondHalf = [...singleSet, ...singleSet, ...singleSet];

export const Partners: React.FC = () => {
  return (
    <section id="partners" className="partners-section" aria-label="Our partners">
      <div className="partners-container">
        {/* Subtle decorative hairline with diamond */}
        <div className="partners-top-ornament" aria-hidden="true">
          <span className="partners-top-diamond">◆</span>
        </div>

        {/* Section Heading matching site standard */}
        <div className="section-header">
          <span className="section-eyebrow">Our Partners</span>
          <h2 className="section-title gold-shimmer">
            Celebrating with those who make it possible
          </h2>
          <div className="section-divider">
            <span className="divider-lotus" aria-hidden="true">
              🪷
            </span>
          </div>
        </div>

        {/* Responsive Content Row: Featured card on left, marquee on right (desktop >= 1200px) */}
        <div className="partners-layout">
          {/* Featured Official Partner Card */}
          <div className="featured-partner-card">
            <span className="featured-partner-badge">
              <span>★</span> Official Partner <span>★</span>
            </span>
            <div className="featured-partner-logo-box">
              <img
                src="/assets/images/sponsors/caha-coffee-club.webp"
                alt="Caha, The Coffee Club"
                className="featured-partner-logo"
                loading="lazy"
                width={210}
                height={56}
              />
            </div>
            <span className="featured-partner-name">Caha, The Coffee Club</span>
          </div>

          {/* Vertical Hairline Divider for Desktop */}
          <div className="partners-vertical-divider" aria-hidden="true" />

          {/* Continuously Floating Right-to-Left Marquee Strip */}
          <div
            className="partners-marquee-wrapper"
            role="region"
            aria-label="Floating sponsors marquee"
            tabIndex={0}
          >
            <div className="partners-marquee-track">
              {/* Primary Half Track */}
              {firstHalf.map((sponsor, index) => (
                <div
                  key={`primary-${sponsor.id}-${index}`}
                  className="partner-card"
                  tabIndex={0}
                >
                  <div className="partner-logo-box">
                    <img
                      src={sponsor.logo}
                      alt={sponsor.name}
                      className={`partner-logo ${sponsor.isCircular ? 'partner-logo-circular' : ''}`}
                      loading="lazy"
                      width={sponsor.isCircular ? 58 : 180}
                      height={58}
                    />
                  </div>
                  <span className="partner-label">{sponsor.label}</span>
                </div>
              ))}

              {/* Seamless Duplicate Half Track for Infinite Right-to-Left Loop */}
              {secondHalf.map((sponsor, index) => (
                <div
                  key={`duplicate-${sponsor.id}-${index}`}
                  className="partner-card"
                  aria-hidden="true"
                >
                  <div className="partner-logo-box">
                    <img
                      src={sponsor.logo}
                      alt=""
                      className={`partner-logo ${sponsor.isCircular ? 'partner-logo-circular' : ''}`}
                      loading="lazy"
                      width={sponsor.isCircular ? 58 : 180}
                      height={58}
                    />
                  </div>
                  <span className="partner-label">{sponsor.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Partners;
