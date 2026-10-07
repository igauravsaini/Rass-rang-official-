import React from 'react';
import { SectionHeading } from '../layout/SectionHeading';
import { Reveal } from '../ui/Reveal';
import { Card3D } from '../ui/Card3D';
import { ticketPasses, ticketTerms } from '../../data/tickets';
import { formatIndianNumber } from '../../lib/format';
import { PassCode } from '../../types/booking';

export const Tickets: React.FC = () => {
  const handleBookNow = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    let passCode: PassCode = 'COUPLE';
    if (id === 'ticket-sigma') passCode = 'SIGMA';
    else if (id === 'ticket-family') passCode = 'FAMILY';

    window.dispatchEvent(
      new CustomEvent('open-booking-modal', {
        detail: { passType: passCode, passMode: 'offline' },
      })
    );
  };

  return (
    <section id="tickets" className="section tickets-section">
      <div className="section-container">
        <SectionHeading
          eyebrow="Choose Your Pass"
          title="Tickets & Passes"
          subtitle="Get your verified digital online pass or reserve your offline pass for collection"
        />

        <div className="tickets-grid">
          {ticketPasses.map((ticket) => {
            return (
              <Reveal
                key={ticket.id}
                direction="up"
                delay={ticket.delay}
                id={ticket.id}
                style={{ display: 'flex', flexDirection: 'column' }}
              >
                <Card3D
                  className={`ticket-card ${ticket.isPopular ? 'ticket-popular' : ''}`.trim()}
                  maxTilt={6}
                  scale={1.02}
                >
                  {ticket.isPopular && (
                    <div
                      className="ticket-popular-badge"
                      style={{ transform: 'translateZ(25px)' }}
                    >
                      {ticket.popularBadgeText}
                    </div>
                  )}
                  <div className="ticket-badge"></div>
                  <div className="ticket-header" style={{ transform: 'translateZ(15px)' }}>
                    <h3 className="ticket-name">{ticket.name}</h3>
                    <p className="ticket-type">{ticket.type}</p>
                  </div>
                  <div className="ticket-price" style={{ transform: 'translateZ(20px)' }}>
                    <span className="price-currency">₹</span>
                    <span className="price-amount">{formatIndianNumber(ticket.price)}</span>
                  </div>
                  <ul className="ticket-features" style={{ transform: 'translateZ(10px)' }}>
                    {ticket.features.map((feature, i) => (
                      <li key={i}>{feature}</li>
                    ))}
                  </ul>
                  <button
                    type="button"
                    className="btn btn-primary ticket-book-btn"
                    onClick={(e) => handleBookNow(e, ticket.id)}
                    style={{ transform: 'translateZ(20px)' }}
                  >
                    BOOK NOW
                  </button>
                </Card3D>
              </Reveal>
            );
          })}
        </div>

        <Reveal direction="up" className="ticket-terms">
          <details>
            <summary>Terms & Conditions</summary>
            <ul>
              {ticketTerms.map((term, i) => (
                <li key={i}>{term}</li>
              ))}
            </ul>
          </details>
        </Reveal>
      </div>
    </section>
  );
};
