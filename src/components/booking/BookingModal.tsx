import React, { useState, useEffect, useRef } from 'react';
import { PassItem, CollectionSpot, VirtualTicketData, PassCode } from '../../types/booking';
import { VirtualTicket } from './VirtualTicket';
import { useLockBodyScroll } from '../../hooks/useLockBodyScroll';
import { safeParseJson } from '../../lib/api';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultPass?: PassCode;
}

export const BookingModal: React.FC<BookingModalProps> = ({ isOpen, onClose, defaultPass = 'COUPLE' }) => {
  const [activeTab, setActiveTab] = useState<'book' | 'lookup'>('book');

  // Config data loaded from backend
  const [passes, setPasses] = useState<PassItem[]>([]);
  const [spots, setSpots] = useState<CollectionSpot[]>([]);
  const [configLoading, setConfigLoading] = useState(true);
  const [configError, setConfigError] = useState<string | null>(null);

  // Booking Form State
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [email, setEmail] = useState('');
  const [selectedPass, setSelectedPass] = useState<PassCode>(defaultPass);
  const [selectedSpotId, setSelectedSpotId] = useState<number | ''>('');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Turnstile state
  const turnstileSiteKey = (import.meta as any).env?.VITE_TURNSTILE_SITE_KEY || '';
  const [turnstileToken, setTurnstileToken] = useState<string>('');
  const turnstileRef = useRef<HTMLDivElement | null>(null);

  // Lookup Form State
  const [lookupTicketNo, setLookupTicketNo] = useState('');
  const [lookupMobileLast4, setLookupMobileLast4] = useState('');
  const [isLookingUp, setIsLookingUp] = useState(false);
  const [lookupError, setLookupError] = useState<string | null>(null);

  // Completed or Restored Ticket
  const [activeTicket, setActiveTicket] = useState<VirtualTicketData | null>(null);

  // Render Turnstile when available
  useEffect(() => {
    if (!turnstileSiteKey || !turnstileRef.current || activeTab !== 'book') return;
    const timer = setTimeout(() => {
      if ((window as any).turnstile && turnstileRef.current) {
        try {
          (window as any).turnstile.render(turnstileRef.current, {
            sitekey: turnstileSiteKey,
            callback: (tok: string) => setTurnstileToken(tok),
          });
        } catch {
          // ignore already rendered
        }
      }
    }, 250);
    return () => clearTimeout(timer);
  }, [turnstileSiteKey, activeTab, isOpen]);

  // Lock body scroll when modal is open
  useLockBodyScroll(isOpen);

  // Restore ticket from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('raas_rang_active_ticket');
      if (saved) {
        setActiveTicket(JSON.parse(saved));
      }
    } catch {
      // ignore
    }
  }, []);

  // Update selected pass if defaultPass prop changes
  useEffect(() => {
    if (defaultPass) {
      setSelectedPass(defaultPass);
    }
  }, [defaultPass]);

  // Load config (passes & collection spots)
  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;
    setConfigLoading(true);
    setConfigError(null);

    fetch('/api/config')
      .then((res) => safeParseJson(res))
      .then((data) => {
        if (!isMounted) return;
        if (data.success) {
          setPasses(data.passes || []);
          setSpots(data.spots || []);
          if (data.spots && data.spots.length > 0 && selectedSpotId === '') {
            setSelectedSpotId(data.spots[0].id);
          }
        } else {
          throw new Error(data.error || 'Server error loading passes');
        }
      })
      .catch((err) => {
        if (!isMounted) return;
        console.error('[Config Fetch] Error:', err);
        setConfigError('Unable to load collection spots. Falling back to venue counter.');
        // Sensible fallbacks
        setPasses([
          { id: 1, code: 'SIGMA', label: 'Sigma Pass (Single Person)', persons: 1, price: 499 },
          { id: 2, code: 'COUPLE', label: 'Couple Pass (2 Persons)', persons: 2, price: 899 },
          { id: 3, code: 'FAMILY', label: 'Family Pass (4 Persons)', persons: 4, price: 1699 },
        ]);
        setSpots([
          {
            id: 1,
            name: 'Mahant Digvijaynath Park Gate Counter',
            address: 'Mahant Digvijaynath Park, Ramgarh Tal Rd',
            city: 'Gorakhpur',
            contact_person: 'Festival In-charge',
            contact_phone: '9876543210',
            timings: '10:00 AM – 08:00 PM (Daily)',
          },
        ]);
        setSelectedSpotId(1);
      })
      .finally(() => {
        if (isMounted) setConfigLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [isOpen]);

  // Handle Booking Submit
  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    // Client-side Validation
    if (!name.trim() || name.trim().length < 2) {
      setFormError('Please enter your full name (at least 2 letters).');
      return;
    }
    if (!/^[6-9]\d{9}$/.test(mobile.trim())) {
      setFormError('Please enter a valid 10-digit mobile number starting with 6, 7, 8, or 9.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setFormError('Please enter a valid email address for your confirmation.');
      return;
    }
    if (!selectedSpotId) {
      setFormError('Please select a collection spot.');
      return;
    }
    if (!termsAccepted) {
      setFormError('Please accept the terms and conditions to proceed.');
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch('/api/book-ticket', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          mobile: mobile.trim(),
          email: email.trim(),
          passType: selectedPass,
          spotId: selectedSpotId,
          termsAccepted: true,
          turnstileToken: turnstileToken || undefined,
        }),
      });

      const data = await safeParseJson(res);

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to complete reservation.');
      }

      // Success
      setActiveTicket(data.ticket);
      try {
        localStorage.setItem('raas_rang_active_ticket', JSON.stringify(data.ticket));
      } catch {
        // ignore
      }
    } catch (err: any) {
      setFormError(err.message || 'Something went wrong. Please check your connection.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Find My Ticket Submit
  const handleLookupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLookupError(null);

    const formattedTicketNo = lookupTicketNo.trim().toUpperCase();
    if (!formattedTicketNo || !/^RRG-\d{2}-[23456789ABCDEFGHJKMNPQRSTUVWXYZ]{6}$/.test(formattedTicketNo)) {
      setLookupError('Invalid ticket number format. Expected format: RRG-26-XXXXXX.');
      return;
    }

    if (!/^\d{4}$/.test(lookupMobileLast4.trim())) {
      setLookupError('Please enter exactly the last 4 digits of your registered mobile number.');
      return;
    }

    setIsLookingUp(true);

    try {
      const res = await fetch('/api/get-ticket', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ticketNo: formattedTicketNo,
          mobileLast4: lookupMobileLast4.trim(),
        }),
      });

      const data = await safeParseJson(res);

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Ticket not found.');
      }

      setActiveTicket(data.ticket);
      try {
        localStorage.setItem('raas_rang_active_ticket', JSON.stringify(data.ticket));
      } catch {
        // ignore
      }
    } catch (err: any) {
      setLookupError(err.message || 'Lookup failed.');
    } finally {
      setIsLookingUp(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="booking-modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="booking-modal-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="booking-modal-content">
        {/* Close Button */}
        <button
          type="button"
          className="booking-modal-close"
          aria-label="Close booking modal"
          onClick={onClose}
        >
          &times;
        </button>

        {activeTicket ? (
          /* Render Virtual Ticket View */
          <VirtualTicket
            ticket={activeTicket}
            onBookAnother={() => {
              setActiveTicket(null);
              setName('');
              setMobile('');
              setEmail('');
            }}
            onClose={onClose}
          />
        ) : (
          /* Render Forms (Pre-Book or Find My Ticket) */
          <div className="booking-form-container">
            <div className="booking-modal-header">
              <span className="booking-eyebrow">Raas~Rang 2026 • Official Pre-Ticket System</span>
              <h2 id="booking-modal-title" className="booking-modal-title">
                Reserve Your Navratri Pass
              </h2>
              <p className="booking-modal-subtitle">
                Reserve now online with zero payment. Pay & collect your physical entry wristbands at your nearest Gorakhpur spot.
              </p>
            </div>

            {/* Navigation Tabs */}
            <div className="booking-tabs" role="tablist">
              <button
                type="button"
                role="tab"
                aria-selected={activeTab === 'book'}
                className={`booking-tab ${activeTab === 'book' ? 'active' : ''}`}
                onClick={() => setActiveTab('book')}
              >
                🎟️ Pre-Book Pass
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={activeTab === 'lookup'}
                className={`booking-tab ${activeTab === 'lookup' ? 'active' : ''}`}
                onClick={() => setActiveTab('lookup')}
              >
                🔍 Find My Ticket
              </button>
            </div>

            {activeTab === 'book' ? (
              /* TAB 1: PRE-BOOKING FORM */
              <form onSubmit={handleBookingSubmit} className="booking-form" noValidate>
                {formError && (
                  <div className="booking-alert error" role="alert">
                    ⚠️ {formError}
                  </div>
                )}

                {configError && (
                  <div className="booking-alert warning" role="alert">
                    ℹ️ {configError}
                  </div>
                )}

                {/* 1. Attendee Personal Details */}
                <div className="booking-form-grid">
                  <div className="form-group">
                    <label htmlFor="bk-name">
                      Full Name <span className="req">*</span>
                    </label>
                    <input
                      type="text"
                      id="bk-name"
                      placeholder="e.g. Gaurav Saini"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="bk-mobile">
                      Mobile Number <span className="req">*</span>
                    </label>
                    <input
                      type="tel"
                      id="bk-mobile"
                      maxLength={10}
                      placeholder="10-digit mobile number"
                      value={mobile}
                      onChange={(e) => setMobile(e.target.value.replace(/\D/g, ''))}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="bk-email">
                    Email Address (for confirmation ticket) <span className="req">*</span>
                  </label>
                  <input
                    type="email"
                    id="bk-email"
                    placeholder="e.g. name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                {/* 2. Pass Selection */}
                <div className="form-group">
                  <label>
                    Select Pass Category <span className="req">*</span>
                  </label>
                  <div className="pass-selector-grid">
                    {passes.map((pass) => (
                      <label
                        key={pass.code}
                        className={`pass-option-card ${selectedPass === pass.code ? 'selected' : ''}`}
                      >
                        <input
                          type="radio"
                          name="passType"
                          value={pass.code}
                          checked={selectedPass === pass.code}
                          onChange={() => setSelectedPass(pass.code)}
                          className="sr-only"
                        />
                        <div className="pass-option-header">
                          <span className="pass-option-name">{pass.code} PASS</span>
                          <span className="pass-option-price">₹{pass.price}</span>
                        </div>
                        <span className="pass-option-desc">{pass.persons} Person{pass.persons > 1 ? 's' : ''} Entry</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* 3. Collection Spot Selector */}
                <div className="form-group">
                  <label htmlFor="bk-spot">
                    Choose Nearest Ticket Collection Spot <span className="req">*</span>
                  </label>
                  <select
                    id="bk-spot"
                    value={selectedSpotId}
                    onChange={(e) => setSelectedSpotId(Number(e.target.value))}
                    disabled={configLoading}
                    required
                  >
                    {spots.map((spot) => (
                      <option key={spot.id} value={spot.id}>
                        📍 {spot.name} — {spot.timings}
                      </option>
                    ))}
                  </select>
                  {selectedSpotId && (
                    <span className="spot-preview-hint">
                      Address: {spots.find((s) => s.id === Number(selectedSpotId))?.address}
                    </span>
                  )}
                </div>

                {/* 4. Terms Checkbox */}
                <div className="terms-checkbox-wrap">
                  <label className="terms-checkbox-label">
                    <input
                      type="checkbox"
                      id="bk-terms"
                      checked={termsAccepted}
                      onChange={(e) => setTermsAccepted(e.target.checked)}
                      required
                    />
                    <span>
                      I understand that this is a <strong>reservation only</strong>. I agree to show this pre-ticket number with a valid photo ID at the selected collection spot to complete payment and collect the physical entry pass.
                    </span>
                  </label>
                </div>

                {/* Cloudflare Turnstile Container */}
                {turnstileSiteKey && (
                  <div style={{ display: 'flex', justifyContent: 'center', margin: '8px 0' }}>
                    <div ref={turnstileRef} className="cf-turnstile"></div>
                  </div>
                )}

                {/* 5. Submit Button */}
                <button
                  type="submit"
                  className="btn btn-primary booking-submit-btn"
                  disabled={isSubmitting || configLoading}
                >
                  {isSubmitting ? (
                    <span className="btn-loading-state">
                      <span className="spinner"></span> Generating Pre-Ticket Number...
                    </span>
                  ) : (
                    '✨ Generate Pre-Ticket Number'
                  )}
                </button>
              </form>
            ) : (
              /* TAB 2: FIND MY TICKET LOOKUP */
              <form onSubmit={handleLookupSubmit} className="booking-form lookup-form" noValidate>
                {lookupError && (
                  <div className="booking-alert error" role="alert">
                    ⚠️ {lookupError}
                  </div>
                )}

                <p className="lookup-info-text">
                  Already reserved a ticket? Enter your ticket number and the last 4 digits of your registered mobile number to retrieve and download your virtual pass.
                </p>

                <div className="form-group">
                  <label htmlFor="lookup-ticket">Ticket Number <span className="req">*</span></label>
                  <input
                    type="text"
                    id="lookup-ticket"
                    placeholder="e.g. RRG-26-7K3M9P"
                    value={lookupTicketNo}
                    onChange={(e) => setLookupTicketNo(e.target.value.toUpperCase())}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="lookup-last4">Registered Mobile Last 4 Digits <span className="req">*</span></label>
                  <input
                    type="text"
                    id="lookup-last4"
                    maxLength={4}
                    placeholder="e.g. 3210"
                    value={lookupMobileLast4}
                    onChange={(e) => setLookupMobileLast4(e.target.value.replace(/\D/g, ''))}
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="btn btn-secondary booking-submit-btn"
                  disabled={isLookingUp}
                >
                  {isLookingUp ? 'Searching Database...' : '🔎 Retrieve My Ticket'}
                </button>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
