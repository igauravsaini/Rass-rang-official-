import React from 'react';
import { SectionHeading } from '../layout/SectionHeading';
import { Reveal } from '../ui/Reveal';
import { scheduleItems } from '../../data/schedule';

export const Schedule: React.FC = () => {
  return (
    <section id="schedule" className="section schedule-section">
      <div className="section-container">
        <SectionHeading
          eyebrow="Event Flow"
          title="Event Schedule"
          subtitle="17 October 2026 — One Magnificent Evening"
        />

        <div className="timeline">
          <div className="timeline-line"></div>
          {scheduleItems.map((item) => (
            <Reveal
              key={item.time}
              direction={item.align}
              delay={item.delay}
              className="timeline-item"
            >
              <div className="timeline-dot"></div>
              <div className="timeline-content">
                <span className="timeline-time">{item.time}</span>
                <h3>{item.title}</h3>
                <p>{item.description}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
};
