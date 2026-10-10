import React from 'react';
import { SectionHeading } from '../layout/SectionHeading';
import { Reveal } from '../ui/Reveal';
import { Card3D } from '../ui/Card3D';
import { useInView } from '../../hooks/useInView';
import { useCountUp } from '../../hooks/useCountUp';
import { formatIndianNumber } from '../../lib/format';

interface StatItemProps {
  target: number;
  suffix: string;
  label: string;
  desc: string;
  delay: string;
  isTriggered: boolean;
}

const StatCounterItem: React.FC<StatItemProps> = ({
  target,
  suffix,
  label,
  desc,
  delay = '0s',
  isTriggered = true,
}) => {
  const count = useCountUp({ target, duration: 0, trigger: isTriggered });

  return (
    <Reveal direction="up" delay={delay} style={{ display: 'flex', flexDirection: 'column' }}>
      <Card3D className="stat-card" maxTilt={7} scale={1.02}>
        <div
          className="stat-value"
          data-target={target}
          data-suffix={suffix}
          style={{ transform: 'translateZ(20px)' }}
        >
          {formatIndianNumber(count)}
          {suffix}
        </div>
        <div className="stat-label" style={{ transform: 'translateZ(15px)' }}>
          {label}
        </div>
        <div className="stat-desc" style={{ transform: 'translateZ(10px)' }}>
          {desc}
        </div>
      </Card3D>
    </Reveal>
  );
};

export const Stats: React.FC = () => {
  const [sectionRef, isInView] = useInView<HTMLDivElement>({ threshold: 0.05 });

  return (
    <section id="stats" className="section stats-section">
      <div className="stats-bg"></div>
      <div className="section-container" ref={sectionRef}>
        <SectionHeading eyebrow="By the Numbers" title="Why Attend?" />

        <div className="stats-grid">
          <StatCounterItem
            target={1500}
            suffix="+"
            label="Expected Footfall"
            desc="Verified ticket buyers on ground"
            delay="0s"
            isTriggered={isInView}
          />
          <StatCounterItem
            target={2}
            suffix="M+"
            label="Regional Digital Reach"
            desc="Purvanchal digital ad campaign"
            delay="0s"
            isTriggered={isInView}
          />
          <StatCounterItem
            target={70}
            suffix="%"
            label="Youth & Professionals"
            desc="College students & young couples"
            delay="0s"
            isTriggered={isInView}
          />

          <Reveal direction="up" delay="0s" style={{ display: 'flex', flexDirection: 'column' }}>
            <Card3D className="stat-card" maxTilt={7} scale={1.02}>
              <div className="stat-value-text" style={{ transform: 'translateZ(20px)' }}>
                ₹499–₹1,699
              </div>
              <div className="stat-label" style={{ transform: 'translateZ(15px)' }}>
                Ticket Range
              </div>
              <div className="stat-desc" style={{ transform: 'translateZ(10px)' }}>
                High disposable festive income
              </div>
            </Card3D>
          </Reveal>
        </div>
      </div>
    </section>
  );
};
