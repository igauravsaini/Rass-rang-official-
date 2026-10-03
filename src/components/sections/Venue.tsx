import React from 'react';
import { SectionHeading } from '../layout/SectionHeading';
import { Reveal } from '../ui/Reveal';
import { siteConfig } from '../../data/site';

interface Facility {
  icon: string;
  label: string;
}

const facilities: Facility[] = [
  { icon: '🅿️', label: 'Parking Available' },
  { icon: '🚪', label: 'Dedicated Entry Gate' },
  { icon: '🍽️', label: 'Food Court Zone' },
  { icon: '🎤', label: 'Main Performance Stage' },
  { icon: 'ℹ️', label: 'Help Desk & First Aid' },
];

export const Venue: React.FC = () => {
  return (
    <section id="venue" className="section venue-section">
      <div className="section-container">
        <SectionHeading eyebrow="Location" title="Venue" />

        <div className="venue-content">
          <Reveal direction="up" className="venue-info">
            <h3 className="venue-name">{siteConfig.venueName}</h3>
            <p className="venue-address">{siteConfig.venueAddress}</p>

            <div className="venue-facilities">
              {facilities.map((fac) => (
                <div key={fac.label} className="facility-item">
                  <span className="facility-icon" aria-hidden="true">
                    {fac.icon}
                  </span>
                  <span>{fac.label}</span>
                </div>
              ))}
            </div>

            <a
              href={siteConfig.mapDirectionsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-primary"
              id="venue-navigate"
            >
              Navigate to Venue
            </a>
          </Reveal>

          <Reveal direction="up" delay="0.2s" className="venue-map">
            <iframe
              title="Venue Location Map"
              src={siteConfig.mapEmbedUrl}
              width="100%"
              height="400"
              style={{ border: 0, borderRadius: '16px' }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            ></iframe>
          </Reveal>
        </div>
      </div>
    </section>
  );
};
