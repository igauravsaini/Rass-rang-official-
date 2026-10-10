import React, { useState, useEffect, useRef, useCallback } from 'react';
import { PassItem, CollectionSpot, VirtualTicketData, PassCode } from '../../types/booking';
import { VirtualTicket } from './VirtualTicket';
import { useLockBodyScroll } from '../../hooks/useLockBodyScroll';
import { safeParseJson } from '../../lib/api';
import {
  IconTicket, IconGlobe, IconSearch,
  IconAlertTriangle, IconInfo,
  IconBuilding, IconMapPin, IconClock, IconPhone, IconLightbulb,
  IconExternalLink, IconShieldCheck,
} from './BookingIcons';
import '../../styles/booking.css';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultPass?: PassCode;
  defaultMode?: 'online' | 'offline';
}

export const BookingModal: React.FC<BookingModalProps> = ({
  isOpen,
  onClose,
  defaultPass = 'COUPLE',
  defaultMode = 'offline',
}) => {
  const [activeTab, setActiveTab] = useState<'online' | 'offline' | 'lookup'>(defaultMode || 'offline');

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

  // BookMyShow redirect flow
  const [showBmsModal, setShowBmsModal] = useState(false);
  const [bmsProgress, setBmsProgress] = useState(0);
  const bmsTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const BMS_BASE_URL = 'https://in.bookmyshow.com/activities/raasrang-garba-nights-2026/ET00521642';
  const sigmaPass = passes.find((pass) => pass.code === 'SIGMA') ?? {
    id: 1,
    code: 'SIGMA' as PassCode,
    label: 'Sigma Pass',
    persons: 1,
    price: 499,
  };

  const getBmsUrl = useCallback((passCode: PassCode) => {
    return `${BMS_BASE_URL}?utm_source=site&utm_medium=passcard&utm_campaign=raasrang2026&pass=${passCode.toLowerCase()}`;
  }, []);

  const handleBookOnBms = () => {
    setShowBmsModal(true);
    setBmsProgress(0);

    let tick = 0;
    bmsTimerRef.current = setInterval(() => {
      tick += 1;
      const pct = Math.min((tick / 30) * 100, 100);
      setBmsProgress(pct);

      if (tick >= 30) {
        if (bmsTimerRef.current) clearInterval(bmsTimerRef.current);
        window.open(getBmsUrl('SIGMA'), '_blank', 'noopener,noreferrer');
        setTimeout(() => setShowBmsModal(false), 400);
      }
    }, 100); // 30 ticks × 100ms = 3 seconds
  };

  const cancelBmsRedirect = () => {
    if (bmsTimerRef.current) clearInterval(bmsTimerRef.current);
    setShowBmsModal(false);
    setBmsProgress(0);
  };

  // Clean up BMS timer on unmount
  useEffect(() => {
    return () => {
      if (bmsTimerRef.current) clearInterval(bmsTimerRef.current);
    };
  }, []);

  // Sync mode when defaultMode or modal open changes
  useEffect(() => {
    if (isOpen && defaultMode) {
      setActiveTab(defaultMode);
    }
  }, [isOpen, defaultMode]);

  // Dynamically load Turnstile script on demand and render challenge
  useEffect(() => {
    if (!turnstileSiteKey || !turnstileRef.current || activeTab === 'lookup' || !isOpen) return;

    if (!(window as any).turnstile && !document.querySelector('script[src*="turnstile/v0/api.js"]')) {
      const script = document.createElement('script');
      script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);
    }

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
    }, 300);
    return () => clearTimeout(timer);
  }, [turnstileSiteKey, activeTab, isOpen]);

  // Modal Animation & Background Blur State
  const [isRendered, setIsRendered] = useState(isOpen);
  const [animationState, setAnimationState] = useState<'entering' | 'entered' | 'exiting' | 'exited'>(
    isOpen ? 'entering' : 'exited'
  );

  useEffect(() => {
    if (isOpen) {
      setIsRendered(true);
      document.body.classList.add('booking-overlay-active');
      const raf = requestAnimationFrame(() => {
        setAnimationState('entering');
        const timer = setTimeout(() => {
          setAnimationState('entered');
        }, 300);
        return () => clearTimeout(timer);
      });
      return () => cancelAnimationFrame(raf);
    } else if (isRendered) {
      setAnimationState('exiting');
      document.body.classList.remove('booking-overlay-active');
      const timer = setTimeout(() => {
        setAnimationState('exited');
        setIsRendered(false);
      }, 250);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Clean up body class on unmount
  useEffect(() => {
    return () => {
      document.body.classList.remove('booking-overlay-active');
    };
  }, []);

 const handleAnimatedClose = () => {
  if (animationState === 'exiting') return;

  setAnimationState('exiting');
  document.body.classList.remove('booking-overlay-active');

  setTimeout(() => {
    setActiveTicket(null);

    setName('');
    setMobile('');
    setEmail('');
    setTermsAccepted(false);
    setFormError(null);

    setLookupTicketNo('');
    setLookupMobileLast4('');
    setLookupError(null);

    setAnimationState('exited');
    setIsRendered(false);
    onClose();
  }, 240);
};

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleAnimatedClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  // Lock body scroll when modal is rendered
  useLockBodyScroll(isRendered);

  // Restore ticket from localStorage on mount
  
  // Update selected pass if defaultPass prop changes
  useEffect(() => {
    if (defaultPass) {
      setSelectedPass(defaultPass);
    }
  }, [defaultPass]);

  // Load config (passes & collection spots)
  useEffect(() => {
    if (!isOpen) return;

    // ---------------------------------------------------------
    // OFFLINE PASS
    // Never call /api/config for offline bookings.
    // ---------------------------------------------------------
    if (activeTab === 'offline') {
      setConfigError(null);

      setPasses([
        {
          id: 1,
          code: 'SIGMA',
          label: 'Sigma Pass (Single Person)',
          persons: 1,
          price: 499,
        },
        {
          id: 2,
          code: 'COUPLE',
          label: 'Couple Pass (2 Persons)',
          persons: 2,
          price: 899,
        },
        {
          id: 3,
          code: 'FAMILY',
          label: 'Family Pass (4 Persons)',
          persons: 4,
          price: 1699,
        },
      ]);

      setSpots([
        {
          id: 1,
          name: 'Caha Gorakhpur',
          address:
            'Kajakpur, Rail Vihar Colony Phase 3rd, Taramandal, Gorakhpur, Uttar Pradesh 273017',
          city: 'Gorakhpur',
          contact_person: 'Festival Helpdesk',
          contact_phone: '9876543210',
          timings: '10:00 AM – 08:00 PM (Daily)',
        },
      ]);

      setSelectedSpotId(1);
      setConfigLoading(false);

      return;
    }

    // ---------------------------------------------------------
    // ONLINE PASS
    // Keep the existing Supabase-backed configuration.
    // ---------------------------------------------------------
    let isMounted = true;

    setConfigLoading(true);
    setConfigError(null);

    fetch('/api/config')
      .then((res) => safeParseJson(res))
      .then((data) => {
        if (!isMounted) return;

        if (!data.success) {
          throw new Error(data.error || 'Server error loading passes');
        }

        setPasses(data.passes || []);
        setSpots(data.spots || []);

        if (data.spots?.length > 0 && selectedSpotId === '') {
          setSelectedSpotId(data.spots[0].id);
        }
      })
      .catch((err) => {
        if (!isMounted) return;

        console.error('[Config Fetch] Error:', err);
        setConfigError('Unable to load server config.');

        setPasses([
          {
            id: 1,
            code: 'SIGMA',
            label: 'Sigma Pass (Single Person)',
            persons: 1,
            price: 499,
          },
          {
            id: 2,
            code: 'COUPLE',
            label: 'Couple Pass (2 Persons)',
            persons: 2,
            price: 899,
          },
          {
            id: 3,
            code: 'FAMILY',
            label: 'Family Pass (4 Persons)',
            persons: 4,
            price: 1699,
          },
        ]);
        setSpots([
          {
            id: 1,
            name: 'Caha Gorakhpur',
            address:
              'Kajakpur, Rail Vihar Colony Phase 3rd, Taramandal, Gorakhpur, Uttar Pradesh 273017',
            city: 'Gorakhpur',
            contact_person: 'Festival Helpdesk',
            contact_phone: '9876543210',
            timings: '10:00 AM – 08:00 PM (Daily)',
          },
        ]);
        setSelectedSpotId(1);
      })
      .finally(() => {
        if (isMounted) {
          setConfigLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [isOpen, activeTab]);

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
    if (!termsAccepted) {
      setFormError('Please accept the confirmation checkbox to proceed.');
      return;
    }

    const passMode = activeTab === 'offline' ? 'offline' : 'online';
    const spotToUse = selectedSpotId || (spots[0]?.id ?? 1);

    setIsSubmitting(true);

    try {
      const endpoint =
     activeTab === 'offline'
    ? '/api/offline-booking'
    : '/api/book-ticket';

    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: name.trim(),
        mobile: mobile.trim(),
        email: email.trim(),
        passType: selectedPass,
        passMode,
        spotId: spotToUse,
        termsAccepted: true,
        turnstileToken: turnstileToken || undefined,
      }),
    });

    const data = await safeParseJson(res);

    // ---------------------------------------------------------
    // OFFLINE DUPLICATE REGISTRATION
    // The backend found an existing active reservation for the
    // same mobile + email combination.
    // Do NOT show the existing ticket.
    // ---------------------------------------------------------
    if (
      activeTab === 'offline' &&
      res.status === 409 &&
      data.code === 'ALREADY_REGISTERED'
    ) {
      setFormError(
        'This mobile number and email are already registered for an offline pass. Please use different details, or use “Find My Ticket” to access your existing reservation.'
      );

      return;
    }

    // ---------------------------------------------------------
    // OTHER ERRORS
    // ---------------------------------------------------------
    if (!res.ok || !data.success) {
      throw new Error(
        data.error || 'Failed to complete pass issuance.'
      );
    }
      const enrichedTicket: VirtualTicketData = {
        ...data.ticket,
        passMode: passMode === 'online' ? 'ONLINE' : 'OFFLINE',
      };

      // Success
      setActiveTicket(enrichedTicket);
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

  if (!isRendered) return null;

  return (
    <div
      className={`booking-modal-overlay ${animationState}`}
      role="dialog"
      aria-modal="true"
      aria-labelledby="booking-modal-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) handleAnimatedClose();
      }}
    >
      <div className="booking-modal-content">
        {/* Close Button */}
        <button
          type="button"
          className="booking-modal-close"
          aria-label="Close booking modal"
          onClick={handleAnimatedClose}
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
            onClose={handleAnimatedClose}
          />
        ) : (
          /* Render Forms (Get Online Pass, Get Offline Pass, or Find My Ticket) */
          <div className="booking-form-container">
            <div className="booking-modal-header">
              <span className="booking-eyebrow">
                {activeTab === 'online'
                  ? 'Raas~Rang 2026 • Official Online Pass'
                  : activeTab === 'offline'
                  ? 'Raas~Rang 2026 • Official Offline Pass'
                  : 'Raas~Rang 2026 • Pass Verification'}
              </span>
              <h2 id="booking-modal-title" className="booking-modal-title">
                {activeTab === 'online'
                  ? 'Get Your Online Pass'
                  : activeTab === 'offline'
                  ? 'Get Your Offline Pass'
                  : 'Find My Ticket'}
              </h2>
              <p className="booking-modal-subtitle">
                {activeTab === 'online'
                  ? 'Book official online passes securely via BookMyShow — our official online ticketing partner.'
                  : activeTab === 'offline'
                  ? 'Reserve your physical entry wristbands with zero online payment. Pay & collect at Caha Gorakhpur (Taramandal).'
                  : 'Already reserved an online or offline pass? Enter your ticket number and mobile last 4 digits to view and download it.'}
              </p>
            </div>

            {/* Navigation Tabs */}
            <div className="booking-tabs" role="tablist">
              <button
                type="button"
                role="tab"
                aria-selected={activeTab === 'offline'}
                className={`booking-tab ${activeTab === 'offline' ? 'active' : ''}`}
                onClick={() => setActiveTab('offline')}
              >
                <IconTicket size={16} /> Get Offline Pass
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={activeTab === 'online'}
                className={`booking-tab ${activeTab === 'online' ? 'active' : ''}`}
                onClick={() => setActiveTab('online')}
              >
                <IconGlobe size={16} /> Get Online Pass
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={activeTab === 'lookup'}
                className={`booking-tab ${activeTab === 'lookup' ? 'active' : ''}`}
                onClick={() => setActiveTab('lookup')}
              >
                <IconSearch size={16} /> Find My Ticket
              </button>
            </div>

            {activeTab === 'offline' ? (
              /* TAB 1: PASS BOOKING FORM (OFFLINE) */
              <form onSubmit={handleBookingSubmit} className="booking-form" noValidate>
                {formError && (
                  <div className="booking-alert error" role="alert">
                    <IconAlertTriangle size={16} /> {formError}
                  </div>
                )}

                {configError && (
                  <div className="booking-alert warning" role="alert">
                    <IconInfo size={16} /> {configError}
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

                {/* 3. Spot Info */}
                <div className="form-group">
                  <label htmlFor="bk-spot">
                    Official Ticket Collection Spot <span className="req">*</span>
                  </label>
                  <div className="spot-preview-card offline-spot">
                    <div className="spot-badge-tag"><IconBuilding size={14} /> Official Collection Counter (Single Authorized Spot)</div>
                    <div className="spot-card-title"><IconMapPin size={16} /> Caha Gorakhpur</div>
                    <div className="spot-card-address">
                      Kajakpur, Rail Vihar Colony Phase 3rd, Taramandal, Gorakhpur, Uttar Pradesh 273017
                    </div>
                    <div className="spot-card-meta">
                      <span><IconClock size={14} /> Timings: 10:00 AM – 08:00 PM (Daily)</span>
                      <span><IconPhone size={14} /> Helpdesk: 9876543210</span>
                    </div>
                    <span className="spot-card-note"><IconLightbulb size={14} /> Present your reservation number here to make payment and collect physical entry wristbands.</span>
                  </div>
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
                      I understand that this is an <strong>offline pass reservation</strong>. I agree to show my pass reservation number at <strong>Caha Gorakhpur (Kajakpur, Rail Vihar Colony Phase 3rd, Taramandal)</strong> to complete payment and collect physical entry wristbands.
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
                      <span className="spinner"></span> Reserving Offline Pass...
                    </span>
                  ) : (
                    <><IconTicket size={18} /> Get Offline Pass</>
                  )}
                </button>
              </form>
            ) : activeTab === 'online' ? (
              /* TAB: ONLINE PASS — BOOK ON BOOKMYSHOW */
              <div className="booking-form bms-online-container">
                {/* Header visual */}
                <div className="bms-online-hero">
                  {/* Centered 3rd image event banner with glow */}
                  <div className="bms-online-banner-wrap">
                    <img
                      src="/assets/images/online-ticket-banner.jpg"
                      alt="Raas~Rang Garba Nights 2026 - DJ Saifu & DJ Daisy"
                      className="bms-online-banner-img"
                      width={880}
                      height={440}
                      loading="eager"
                      decoding="async"
                    />
                  </div>

                  {/* Centered BookMyShow logo badge with glow */}
                  <div className="bms-online-logo-wrap">
                    <div className="bms-online-logo-badge">
                      <img
                        src="/assets/images/bookmyshow-logo.png"
                        alt="BookMyShow"
                        className="bms-online-logo-img"
                        width={180}
                        height={40}
                      />
                    </div>
                  </div>

                  <h3 className="bms-online-title">Book on BookMyShow</h3>
                  <p className="bms-online-desc">
                    Book your official Sigma Pass directly on BookMyShow — India's most trusted ticketing platform. You'll be redirected securely to complete your purchase.
                  </p>
                </div>

                {/* Pass selector */}
                <div className="form-group" style={{ width: '100%' }}>
                  <label>Available Online</label>
                  <div className="pass-selector-grid bms-pass-selector-grid">
                    <div className="pass-option-card selected bms-pass-card">
                      <div className="pass-option-header">
                        <span className="pass-option-name">SIGMA PASS</span>
                        <span className="pass-option-price">₹{sigmaPass.price}</span>
                      </div>
                      <span className="pass-option-desc">{sigmaPass.persons} Person Entry</span>
                    </div>
                  </div>
                </div>

                {/* "Book on BookMyShow" CTA button */}
                <button
                  type="button"
                  className="btn btn-primary booking-submit-btn bms-cta-btn"
                  onClick={handleBookOnBms}
                >
                  <IconExternalLink size={18} />
                  Book on BookMyShow — Sigma Pass
                </button>

                <p className="bms-online-note">
                  <IconShieldCheck size={14} /> Booked on BookMyShow? Your ticket will be sent by BookMyShow.
                </p>

                {/* BMS Redirect Progress Modal */}
                {showBmsModal && (
                  <div className="bms-redirect-overlay" onClick={cancelBmsRedirect}>
                    <div className="bms-redirect-modal" onClick={(e) => e.stopPropagation()}>
                      <div className="bms-redirect-spinner">
                        <svg viewBox="0 0 50 50" className="bms-circular-progress">
                          <circle
                            cx="25" cy="25" r="20"
                            fill="none" stroke="rgba(240,180,41,0.15)" strokeWidth="4"
                          />
                          <circle
                            cx="25" cy="25" r="20"
                            fill="none" stroke="var(--antique-gold)" strokeWidth="4"
                            strokeLinecap="round"
                            strokeDasharray={`${2 * Math.PI * 20}`}
                            strokeDashoffset={`${2 * Math.PI * 20 * (1 - bmsProgress / 100)}`}
                            style={{ transition: 'stroke-dashoffset 0.1s linear', transform: 'rotate(-90deg)', transformOrigin: 'center' }}
                          />
                        </svg>
                        <span className="bms-redirect-pct">{Math.round(bmsProgress)}%</span>
                      </div>
                      <h4 className="bms-redirect-title">Redirecting to BookMyShow</h4>
                      <div className="bms-redirect-summary">
                        <span className="bms-summary-pill">SIGMA PASS</span>
                        <span className="bms-summary-price">
                          ₹{sigmaPass.price}
                        </span>
                        <span className="bms-summary-entries">
                          ({sigmaPass.persons} Person{sigmaPass.persons > 1 ? 's' : ''} Entry)
                        </span>
                      </div>
                      <p className="bms-redirect-desc">
                        You are being redirected to BookMyShow, our official online ticketing partner. Your payment is completed securely there.
                      </p>
                      <div className="bms-redirect-actions">
                        <button
                          type="button"
                          className="btn btn-primary bms-redirect-continue"
                          onClick={() => {
                            if (bmsTimerRef.current) clearInterval(bmsTimerRef.current);
                            window.open(getBmsUrl('SIGMA'), '_blank', 'noopener,noreferrer');
                            setShowBmsModal(false);
                          }}
                        >
                          Continue now
                        </button>
                        <button
                          type="button"
                          className="btn btn-outline bms-redirect-cancel"
                          onClick={cancelBmsRedirect}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* TAB 2: FIND MY TICKET LOOKUP */
              <form onSubmit={handleLookupSubmit} className="booking-form lookup-form" noValidate>
                {lookupError && (
                  <div className="booking-alert error" role="alert">
                    <IconAlertTriangle size={16} /> {lookupError}
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
                  {isLookingUp ? 'Searching Database...' : <><IconSearch size={16} /> Retrieve My Ticket</>}
                </button>
              </form>
            )}
          </div>
        )}
      </div>

      {/* Toast notifications removed — BMS redirect flow replaces DM flow */}
    </div>
  );
};
