import React, { useState } from 'react';
import { SectionHeading } from '../layout/SectionHeading';
import { Reveal } from '../ui/Reveal';
import { Card3D } from '../ui/Card3D';
import { QuantityStepper } from '../ui/QuantityStepper';
import { ticketPasses, ticketTerms } from '../../data/tickets';
import { formatIndianNumber } from '../../lib/format';
import { PassCode } from '../../types/booking';

export const Tickets: React.FC = () => {
  const [quantities, setQuantities] = useState<Record<string, number>>({
    'ticket-sigma': 1,
    'ticket-couple': 1,
    'ticket-family': 1,
  });

  const handleQtyChange = (id: string, val: number) => {
    setQuantities((prev) => ({ ...prev, [id]: val }));
  };

  const handleBookNow = (e: React.MouseEvent, id: string, mode: 'online' | 'offline' = 'online') => {
    e.preventDefault();
    let passCode: PassCode = 'COUPLE';
    if (id === 'ticket-sigma') passCode = 'SIGMA';
    else if (id === 'ticket-family') passCode = 'FAMILY';

    window.dispatchEvent(
      new CustomEvent('open-booking-modal', {
        detail: { passType: passCode, passMode: mode },
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
                  <div className="ticket-qty" style={{ transform: 'translateZ(15px)' }}>
                    <label htmlFor={`qty-${ticket.id}`}>Quantity:</label>
                    <QuantityStepper
                      value={quantities[ticket.id] || 1}
                      min={1}
                      max={10}
                      onChange={(val) => handleQtyChange(ticket.id, val)}
                      ariaLabel={`${ticket.name} quantity`}
                    />
                  </div>
                  <div className="ticket-actions-group" style={{ transform: 'translateZ(20px)' }}>
                    <button
                      type="button"
                      className="btn btn-primary ticket-btn-online"
                      onClick={(e) => handleBookNow(e, ticket.id, 'online')}
                    >
                      🌐 Get Online Pass
                    </button>
                    <button
                      type="button"
                      className="btn btn-secondary ticket-btn-offline"
                      onClick={(e) => handleBookNow(e, ticket.id, 'offline')}
                    >
                      🎟️ Get Offline Pass
                    </button>
                  </div>
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
