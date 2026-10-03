import React from 'react';
import { Reveal } from '../ui/Reveal';
import { Card3D } from '../ui/Card3D';
import { sponsorTiers, exclusivePartnerships } from '../../data/sponsors';

export const Sponsors: React.FC = () => {
  const handleScrollToContact = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const contact = document.getElementById('contact');
    if (contact) {
      const offsetTop = contact.offsetTop - 75;
      window.scrollTo({
        top: offsetTop,
        behavior: 'smooth',
      });
      const subjectSelect = document.getElementById('contact-subject') as HTMLSelectElement | null;
      if (subjectSelect) {
        subjectSelect.value = 'sponsorship';
      }
    }
  };

  return (
    <section id="sponsors" className="section sponsors-section">
      <div className="section-container">
        <div className="sponsors-hero">
          <span className="section-eyebrow">Partnership</span>
          <h2 className="section-title gold-shimmer">
            Partner With Purvanchal's Biggest Navratri Celebration
          </h2>
          <div className="section-divider">
            <span className="divider-lotus" aria-hidden="true">
              ❈
            </span>
          </div>
          <p className="section-subtitle">
            Connect with Gorakhpur's highest-spending festive crowd. Direct access during the peak
            pre-Diwali purchasing window.
          </p>
          <a
            href="#contact"
            className="btn btn-primary"
            id="sponsor-cta"
            onClick={handleScrollToContact}
          >
            Become a Sponsor
          </a>
        </div>

        {/* Core Sponsorship Tiers */}
        <Reveal direction="up" className="sponsor-tiers-header">
          <h3 className="subsection-title">Core Sponsorship Tiers</h3>
          <p>Investment matrix with category-exclusive brand associations</p>
        </Reveal>

        <div className="sponsor-grid">
          {sponsorTiers.map((tier) => (
            <Reveal
              key={tier.id}
              direction="up"
              delay={tier.delay}
              id={tier.id}
              style={{ display: 'flex', flexDirection: 'column' }}
            >
              <Card3D
                className={`sponsor-card ${tier.isTitle ? 'sponsor-title' : ''}`.trim()}
                maxTilt={6}
                scale={1.02}
              >
                <div className="sponsor-tier-badge" style={{ transform: 'translateZ(20px)' }}>
                  {tier.badge}
                </div>
                <h3 className="sponsor-tier-name" style={{ transform: 'translateZ(15px)' }}>
                  {tier.name}
                </h3>
                <div className="sponsor-price" style={{ transform: 'translateZ(18px)' }}>
                  {tier.price}
                </div>
                {tier.limitText && <p className="sponsor-limit">{tier.limitText}</p>}
                <div className="sponsor-benefits" style={{ transform: 'translateZ(10px)' }}>
                  {tier.benefits.map((b, i) => (
                    <div key={i} className="benefit-item">
                      {b}
                    </div>
                  ))}
                </div>
                {tier.recommendedFor && (
                  <p className="sponsor-recommended">{tier.recommendedFor}</p>
                )}
                <a
                  href="#contact"
                  className={`btn ${tier.isTitle ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={handleScrollToContact}
                  style={{ transform: 'translateZ(15px)' }}
                >
                  Enquire Now
                </a>
              </Card3D>
            </Reveal>
          ))}
        </div>

        <Reveal direction="up" className="sponsor-common-note">
          <p>
            ✦ All sponsors receive logo presence on print/news campaigns, social media collaborator
            tags, and official after-movie credits.
          </p>
        </Reveal>

        {/* Exclusive Partnerships */}
        <Reveal direction="up" className="sponsor-tiers-header exclusive-header">
          <h3 className="subsection-title">Exclusive Partnerships</h3>
          <p>Premium category-exclusive brand associations for maximum impact</p>
        </Reveal>

        <div className="exclusive-grid">
          {exclusivePartnerships.map((partner) => (
            <Reveal
              key={partner.id}
              direction="up"
              delay={partner.delay}
              id={partner.id}
              style={{ display: 'flex', flexDirection: 'column' }}
            >
              <Card3D className="exclusive-card" maxTilt={6} scale={1.02}>
                <div
                  className="exclusive-icon"
                  aria-hidden="true"
                  style={{ transform: 'translateZ(20px)' }}
                >
                  {partner.icon}
                </div>
                <h4 style={{ transform: 'translateZ(15px)' }}>{partner.title}</h4>
                <div className="exclusive-price" style={{ transform: 'translateZ(15px)' }}>
                  {partner.price}
                </div>
                <p>{partner.description}</p>
                <a
                  href="#contact"
                  className="btn btn-outline btn-sm"
                  onClick={handleScrollToContact}
                  style={{ transform: 'translateZ(15px)' }}
                >
                  Book Partnership
                </a>
              </Card3D>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
};
