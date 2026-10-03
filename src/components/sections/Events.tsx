import React from 'react';
import { SectionHeading } from '../layout/SectionHeading';
import { Reveal } from '../ui/Reveal';
import { Card3D } from '../ui/Card3D';
import { eventHighlights } from '../../data/events';

export const Events: React.FC = () => {
  return (
    <section id="events" className="section events-section">
      <div className="section-container">
        <SectionHeading
          eyebrow="Experience"
          title="Event Highlights"
          subtitle="A curated evening of culture, celebration, and community"
        />

        <div className="events-grid">
          {eventHighlights.map((event) => (
            <Reveal
              key={event.id}
              direction="up"
              delay={event.delay}
              id={event.id}
              style={{ display: 'flex', flexDirection: 'column' }}
            >
              <Card3D className="event-card" maxTilt={8} scale={1.02}>
                <div className="event-card-glow"></div>
                <div className="event-card-icon" style={{ transform: 'translateZ(25px)' }}>
                  {event.icon}
                </div>
                <h3 style={{ transform: 'translateZ(15px)' }}>{event.title}</h3>
                <p style={{ transform: 'translateZ(10px)' }}>{event.description}</p>
              </Card3D>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
};
