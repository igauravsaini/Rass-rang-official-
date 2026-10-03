import React from 'react';
import { SectionHeading } from '../layout/SectionHeading';
import { Reveal } from '../ui/Reveal';
import { Card3D } from '../ui/Card3D';

interface AboutCardData {
  icon: string;
  title: string;
  description: string;
  delay: string;
}

const aboutCards: AboutCardData[] = [
  {
    icon: '🪔',
    title: 'What is Raas~Rang?',
    description:
      'Celebrating the timeless traditions of Garba and Dandiya Raas, the event is designed to create an immersive festive experience for families, youth, friends, and the wider community — offering an evening filled with unforgettable experiences of dance, music, food, fashion, and devotion.',
    delay: '0.1s',
  },
  {
    icon: '🏛️',
    title: 'Why Gorakhpur?',
    description:
      'Set in the heart of Purvanchal, Gorakhpur is a city where spirituality, heritage, nature, and modern aspirations converge. Deeply associated with the legacy of Guru Gorakshnath and the scenic Ramgarh Taal, it serves as a regional centre drawing communities from Eastern UP, Bihar, and Nepal.',
    delay: '0.2s',
  },
  {
    icon: '🎯',
    title: 'Our Vision',
    description:
      "Raas~Rang aims to build upon Gorakhpur's regional character by creating a celebration that reflects the city's cultural identity while introducing the vibrant traditions of Garba and Dandiya to a wider audience in a professional, premium format.",
    delay: '0.3s',
  },
  {
    icon: '🤝',
    title: 'Community Impact',
    description:
      'With a well-planned promotional outreach campaign, the event creates strong engagement while providing a valuable platform for brand partners, sponsors, institutions, and local businesses — highlighting local talent, culinary culture, and the unique attractions of Gorakhpur.',
    delay: '0.4s',
  },
];

export const About: React.FC = () => {
  return (
    <section id="about" className="section about-section">
      <div className="section-container">
        <SectionHeading eyebrow="Our Story" title="About Raas~Rang" />

        <Reveal direction="up" className="about-intro">
          <p className="about-lead">
            Raas~Rang Garba Nights is the inaugural edition of a vibrant Garba and Navratri celebration,
            envisioned as a distinctive cultural experience that brings together the spirit of devotion,
            the energy of rhythm, the richness of tradition, and the joy of community.
          </p>
        </Reveal>

        <div className="about-cards">
          {aboutCards.map((card) => (
            <Reveal
              key={card.title}
              direction="up"
              delay={card.delay}
              style={{ display: 'flex', flexDirection: 'column' }}
            >
              <Card3D className="about-card" maxTilt={7} scale={1.02}>
                <div
                  className="about-card-icon"
                  style={{ transform: 'translateZ(25px)' }}
                >
                  {card.icon}
                </div>
                <h3 style={{ transform: 'translateZ(15px)' }}>{card.title}</h3>
                <p style={{ transform: 'translateZ(10px)' }}>{card.description}</p>
              </Card3D>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
};
