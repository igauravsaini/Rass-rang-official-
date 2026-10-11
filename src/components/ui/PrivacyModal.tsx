import React, { useState, useEffect } from 'react';
import { useLockBodyScroll } from '../../hooks/useLockBodyScroll';
import { siteConfig } from '../../data/site';

interface PrivacyModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'privacy' | 'terms';
}

export const PrivacyModal: React.FC<PrivacyModalProps> = ({
  isOpen,
  onClose,
  initialTab = 'privacy',
}) => {
  const [activeTab, setActiveTab] = useState<'privacy' | 'terms'>(initialTab);

  useLockBodyScroll(isOpen);

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab, isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="privacy-modal-overlay"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="privacy-modal-title"
    >
      <div
        className="privacy-modal-box"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="privacy-modal-header">
          <div className="privacy-modal-badge">Official Festival Governance</div>
          <h2 id="privacy-modal-title" className="privacy-modal-title gold-shimmer">
            {siteConfig.name} Legal & Privacy
          </h2>
          <p className="privacy-modal-subtitle">
            Mahant Digvijaynath Park, Gorakhpur &bull; 17-18 October 2026
          </p>

          <button
            type="button"
            className="privacy-modal-close"
            onClick={onClose}
            aria-label="Close legal and privacy information modal"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="privacy-tab-nav" role="tablist">
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'privacy'}
            className={`privacy-tab-btn ${activeTab === 'privacy' ? 'active' : ''}`}
            onClick={() => setActiveTab('privacy')}
          >
            Privacy Policy
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'terms'}
            className={`privacy-tab-btn ${activeTab === 'terms' ? 'active' : ''}`}
            onClick={() => setActiveTab('terms')}
          >
            Terms & Conditions
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="privacy-modal-body">
          {activeTab === 'privacy' ? (
            <div className="privacy-tab-content">
              <section className="privacy-section">
                <h3>1. Commitment to Visitor Privacy</h3>
                <p>
                  At <strong>Raas~Rang Garba Nights</strong> (&ldquo;we&rdquo;, &ldquo;our&rdquo;, or &ldquo;the festival&rdquo;),
                  we prioritize the trust and privacy of all attendees, artists, and patrons. This policy details how we
                  handle information collected through our official portal (<code>raasranggkp.pages.dev</code>) and
                  at our physical venue at Mahant Digvijaynath Park, Gorakhpur.
                </p>
              </section>

              <section className="privacy-section">
                <h3>2. Information We Collect</h3>
                <p>We collect only the minimum information necessary to issue passes and ensure venue security:</p>
                <ul>
                  <li><strong>Booking Contact Details:</strong> Full name, 10-digit mobile number, and optional email address provided during offline pass reservation.</li>
                  <li><strong>Ticket Verification Details:</strong> Order IDs, Ticket Pass Numbers, and QR codes generated for physical/digital gate admission.</li>
                  <li><strong>Technical Usage:</strong> Anonymous analytics such as page performance metrics, device category (mobile/desktop), and security telemetry via Cloudflare to protect against malicious bots.</li>
                </ul>
              </section>

              <section className="privacy-section">
                <h3>3. Purpose of Processing</h3>
                <p>All data collected is strictly utilized to:</p>
                <ul>
                  <li>Confirm pass reservations and deliver digital ticket passes.</li>
                  <li>Enable instant pass lookup via our online ticket portal.</li>
                  <li>Verify authentic entry passes via our authorized gate scanner at the event venue.</li>
                  <li>Send urgent festival advisories or weather updates concerning the event dates (17-18 October 2026).</li>
                </ul>
              </section>

              <section className="privacy-section">
                <h3>4. Zero Third-Party Selling or Renting</h3>
                <p>
                  <strong>We do not sell, rent, trade, or monetize your personal information.</strong> Your contact details
                  are strictly retained by the organizing committee and are never transferred to unaffiliated commercial advertisers.
                </p>
              </section>

              <section className="privacy-section">
                <h3>5. Payment & Online Ticketing Redirection</h3>
                <p>
                  For online ticket bookings, patrons are seamlessly redirected to our official ticketing partner,
                  <strong> BookMyShow</strong>. All credit card, debit card, UPI, and net banking transactions are handled
                  directly on BookMyShow&rsquo;s PCI-DSS compliant infrastructure. Raas~Rang does not store or process card numbers, CVVs, or UPI PINs.
                </p>
              </section>

              <section className="privacy-section">
                <h3>6. Data Security & Storage</h3>
                <p>
                  All data in transit is encrypted using modern TLS/SSL cryptographic protocols.
                  Gate scanner access is restricted exclusively to authorized festival administration personnel with encrypted credentials.
                </p>
              </section>

              <section className="privacy-section">
                <h3>7. Privacy Inquiries & Contact</h3>
                <p>
                  If you have questions regarding your data or wish to request pass verification support, contact us at:
                  <br />
                  <strong>Email:</strong> <a href={`mailto:${siteConfig.email}`}>{siteConfig.email}</a>
                  <br />
                  <strong>Phone:</strong> {siteConfig.phones.map(p => p.display).join(' / ')}
                </p>
              </section>
            </div>
          ) : (
            <div className="privacy-tab-content">
              <section className="privacy-section">
                <h3>1. Event Entry & Admittance</h3>
                <p>
                  Entry to <strong>Raas~Rang Garba Nights 2026</strong> at Mahant Digvijaynath Park, Gorakhpur requires a valid
                  physical or digital QR entry pass issued by Raas~Rang or BookMyShow. The management reserves the right of admission.
                </p>
              </section>

              <section className="privacy-section">
                <h3>2. Traditional Garba Attire</h3>
                <p>
                  In honoring the sacred celebration of Navratri and Maa Durga, attendees are requested to dress in
                  traditional Indian festive attire (Chaniya Choli, Kurta Pajama, Kedia, or festive ethnic wear).
                </p>
              </section>

              <section className="privacy-section">
                <h3>3. Pass Validation & Re-Entry</h3>
                <ul>
                  <li>Each pass admits the number of attendees specified (Sigma: 1 Person, Couple: 2 Persons, Family: 4 Persons).</li>
                  <li>Passes are validated at entry gates via encrypted QR verification. Re-entry policies will be governed by on-ground security wristbands.</li>
                  <li>Duplication or forging of passes is strictly illegal and will result in denied entry and law enforcement reporting.</li>
                </ul>
              </section>

              <section className="privacy-section">
                <h3>4. Cancellation & Refund Policy</h3>
                <p>
                  Passes purchased are non-refundable and non-exchangeable. In the rare event of severe weather or force majeure
                  necessitating schedule modifications, rescheduling notices will be posted across official channels.
                </p>
              </section>

              <section className="privacy-section">
                <h3>5. Venue Conduct & Safety</h3>
                <p>
                  Raas~Rang maintains a zero-tolerance policy towards harassment, disorderly conduct, or unauthorized substances.
                  All visitors must undergo security bag checks and metal detector screenings at the park entrance.
                </p>
              </section>

              <section className="privacy-section">
                <h3>6. Media & Photography Notice</h3>
                <p>
                  By attending, patrons acknowledge that festival organizers may capture promotional photos and video reels
                  highlighting cultural performances for official broadcast and social media archives.
                </p>
              </section>
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="privacy-modal-footer">
          <p className="privacy-footer-note">
            Last Updated: October 2026 &bull; Raas~Rang Garba Nights Executive Committee
          </p>
          <button type="button" className="privacy-confirm-btn" onClick={onClose}>
            Understood & Agree
          </button>
        </div>
      </div>
    </div>
  );
};
