import React, { useEffect, useRef, useState } from 'react';
import QRCode from 'qrcode';
import { VirtualTicketData } from '../../types/booking';

interface VirtualTicketProps {
  ticket: VirtualTicketData;
  onBookAnother?: () => void;
  onClose?: () => void;
}

export const VirtualTicket: React.FC<VirtualTicketProps> = ({ ticket, onBookAnother, onClose }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const ticketRef = useRef<HTMLDivElement | null>(null);
  const [copied, setCopied] = useState(false);
  const [downloadingPng, setDownloadingPng] = useState(false);
  const [downloadingPdf, setDownloadingPdf] = useState(false);

  useEffect(() => {
    if (canvasRef.current && ticket.ticketNo) {
      QRCode.toCanvas(
        canvasRef.current,
        ticket.ticketNo,
        {
          width: 170,
          margin: 1,
          color: {
            dark: '#0a0412',
            light: '#ffffff',
          },
        },
        (error) => {
          if (error) console.error('[QR] Failed to generate code:', error);
        }
      );
    }
  }, [ticket.ticketNo]);

  const handleCopyTicketNo = () => {
    navigator.clipboard.writeText(ticket.ticketNo);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  /**
   * Prepares the ticket element for html2canvas capture by temporarily
   * resolving CSS custom properties and removing problematic gradient-text
   * clipping that html2canvas cannot render.
   */
  const prepareForCapture = (el: HTMLElement): (() => void) => {
    const cleanups: (() => void)[] = [];

    // 1. Force-resolve all CSS custom properties to computed values on key elements
    const ticketCard = el;

    // Inline the background so html2canvas doesn't see CSS vars
    const cs = getComputedStyle(ticketCard);
    const origBg = ticketCard.style.background;
    ticketCard.style.background = cs.background || cs.backgroundColor || '#240510';
    cleanups.push(() => { ticketCard.style.background = origBg; });

    const origColor = ticketCard.style.color;
    ticketCard.style.color = cs.color || '#fdf6e3';
    cleanups.push(() => { ticketCard.style.color = origColor; });

    const origBorder = ticketCard.style.borderColor;
    ticketCard.style.borderColor = cs.borderColor || '#f0b429';
    cleanups.push(() => { ticketCard.style.borderColor = origBorder; });

    // 2. Fix gradient-text elements (ticket number) — replace with solid gold
    const gradientTextEls = el.querySelectorAll<HTMLElement>('.vt-ticket-no');
    gradientTextEls.forEach((ge) => {
      const origStyles = {
        background: ge.style.background,
        backgroundClip: ge.style.backgroundClip,
        webkitBgClip: ge.style.getPropertyValue('-webkit-background-clip'),
        webkitFill: ge.style.getPropertyValue('-webkit-text-fill-color'),
        color: ge.style.color,
      };
      ge.style.background = 'none';
      ge.style.backgroundClip = 'unset';
      ge.style.setProperty('-webkit-background-clip', 'unset');
      ge.style.setProperty('-webkit-text-fill-color', 'unset');
      ge.style.color = '#f0b429';
      cleanups.push(() => {
        ge.style.background = origStyles.background;
        ge.style.backgroundClip = origStyles.backgroundClip;
        ge.style.setProperty('-webkit-background-clip', origStyles.webkitBgClip);
        ge.style.setProperty('-webkit-text-fill-color', origStyles.webkitFill);
        ge.style.color = origStyles.color;
      });
    });

    // 3. Resolve all CSS var() references for nested elements
    const allEls = el.querySelectorAll<HTMLElement>('*');
    allEls.forEach((child) => {
      const ccs = getComputedStyle(child);
      // Only override if the element uses a var-dependent color
      if (child.style.color === '' && ccs.color) {
        const origC = child.style.color;
        child.style.color = ccs.color;
        cleanups.push(() => { child.style.color = origC; });
      }
    });

    return () => cleanups.forEach((fn) => fn());
  };

  const handleDownloadPng = async () => {
    if (!ticketRef.current) return;
    try {
      setDownloadingPng(true);
      const { default: html2canvas } = await import('html2canvas');

      const restore = prepareForCapture(ticketRef.current);

      const canvas = await html2canvas(ticketRef.current, {
        scale: 3,
        backgroundColor: '#0a0412',
        useCORS: true,
        logging: false,
        allowTaint: true,
        removeContainer: true,
        imageTimeout: 5000,
      });

      restore();

      const dataUrl = canvas.toDataURL('image/png', 1.0);
      const link = document.createElement('a');
      link.download = `RaasRang-Pass-${ticket.ticketNo}.png`;
      link.href = dataUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error('[Download PNG] Failed:', err);
      alert('Unable to generate ticket image. Please take a screenshot instead.');
    } finally {
      setDownloadingPng(false);
    }
  };

  const handleDownloadPdf = async () => {
    if (!ticketRef.current) return;
    try {
      setDownloadingPdf(true);
      const [{ default: html2canvas }, { default: jsPDF }] = await Promise.all([
        import('html2canvas'),
        import('jspdf')
      ]);

      const restore = prepareForCapture(ticketRef.current);

      const canvas = await html2canvas(ticketRef.current, {
        scale: 3,
        backgroundColor: '#0a0412',
        useCORS: true,
        logging: false,
        allowTaint: true,
        removeContainer: true,
        imageTimeout: 5000,
      });

      restore();

      const imgData = canvas.toDataURL('image/png', 1.0);

      // Determine the best PDF page size from the canvas aspect ratio
      const imgAspect = canvas.width / canvas.height;
      const pdfW = 148; // A5 width in mm
      const pdfH = pdfW / imgAspect;

      const pdf = new jsPDF({
        orientation: pdfH > pdfW ? 'portrait' : 'landscape',
        unit: 'mm',
        format: [pdfW, pdfH + 10], // custom size with 5mm top+bottom padding
      });

      pdf.addImage(imgData, 'PNG', 0, 5, pdfW, pdfH);
      pdf.save(`RaasRang-Pass-${ticket.ticketNo}.pdf`);
    } catch (err) {
      console.error('[Download PDF] Failed:', err);
      alert('Unable to generate PDF. Please download the PNG instead.');
    } finally {
      setDownloadingPdf(false);
    }
  };

  const isOnline = ticket.passMode === 'ONLINE';

  const shareText = encodeURIComponent(
    `Jai Mata Di! Here is my ${isOnline ? 'Online Pass' : 'Offline Pass'} for Raas~Rang Garba Nights 2026 (Gorakhpur):\n` +
      `Ticket No: ${ticket.ticketNo}\n` +
      `Name: ${ticket.name}\n` +
      `Pass: ${ticket.passName}\n` +
      (isOnline
        ? `Direct Gate Entry: Mahant Digvijaynath Park\n`
        : `Collection Spot: ${ticket.spot}\n`) +
      `Event Date: 17 Oct 2026 at Mahant Digvijaynath Park.\n` +
      `Get your ticket here: ${typeof window !== 'undefined' ? window.location.origin : 'https://raasranggkp.pages.dev'}/`
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COLLECTED':
        return '#2ecc71';
      case 'CHECKED_IN':
        return '#00BFA5';
      case 'CANCELLED':
        return '#E53935';
      default:
        return '#f0b429';
    }
  };

  return (
    <div className="virtual-ticket-wrapper">
      {/* Printable / Downloadable Card */}
      <div id="virtualTicket" ref={ticketRef} className="virtual-ticket-card">
        {/* Ticket Header */}
        <div className="vt-header">
          <div className="vt-logo-row">
            <img src="/assets/images/logo.jpg" alt="Raas Rang Logo" className="vt-logo-img" />
            <div>
              <h2 className="vt-brand">RAAS~RANG GKP</h2>
              <p className="vt-subbrand">
                {isOnline ? 'NAVRATRI 2026 • OFFICIAL ONLINE PASS' : 'NAVRATRI 2026 • OFFLINE PASS RESERVATION'}
              </p>
            </div>
          </div>
          <div
            className="vt-status-badge"
            style={{
              borderColor: getStatusColor(ticket.status),
              color: getStatusColor(ticket.status),
            }}
          >
            ● {isOnline && ticket.status === 'ISSUED' ? 'ONLINE CONFIRMED' : ticket.status.replace('_', ' ')}
          </div>
        </div>

        {/* Golden Ornamental Divider */}
        <div className="vt-divider"></div>

        {/* Ticket Number Highlight */}
        <div className="vt-number-box">
          <span className="vt-number-label">
            {isOnline ? 'ONLINE PASS NUMBER' : 'OFFLINE RESERVATION NUMBER'}
          </span>
          <div className="vt-ticket-no">{ticket.ticketNo}</div>
          <span className="vt-number-note">
            {isOnline
              ? 'Present this QR pass on your phone at event gate for admission'
              : 'Bring this code to Caha Gorakhpur to collect physical wristbands'}
          </span>
        </div>

        {/* Attendee & Pass Details Grid */}
        <div className="vt-details-grid">
          <div className="vt-detail-item">
            <span className="vt-label">Attendee Name</span>
            <span className="vt-val highlight">{ticket.name}</span>
          </div>

          <div className="vt-detail-item">
            <span className="vt-label">Pass Category</span>
            <span className="vt-val">
              {/entry|person/i.test(ticket.passName || '')
                ? ticket.passName
                : `${ticket.passName} (${ticket.persons} Entry)`}
            </span>
          </div>

          <div className="vt-detail-item">
            <span className="vt-label">Mobile Number</span>
            <span className="vt-val">{ticket.mobileMasked}</span>
          </div>

          <div className="vt-detail-item">
            <span className="vt-label">
              {isOnline ? 'Pass Amount' : 'Amount Payable at Spot'}
            </span>
            <span className="vt-val gold">₹{ticket.price}</span>
          </div>

          <div className="vt-detail-item full-width">
            <span className="vt-label">
              {isOnline ? 'Entry Gate & Venue' : 'Designated Collection Spot'}
            </span>
            <span className="vt-val spot-name">
              📍 {isOnline ? 'Mahant Digvijaynath Park, Gorakhpur' : ticket.spot}
            </span>
            <span className="vt-spot-address">
              {isOnline
                ? 'Direct Smartphone QR Gate Entry — No prior physical pickup needed'
                : ticket.spotAddress}
            </span>
            <span className="vt-spot-timings">
              {isOnline
                ? '🕒 Event Date: Saturday, 17 October 2026 · Gates Open 6:00 PM'
                : `🕒 ${ticket.spotTimings} • 📞 ${ticket.spotContact}`}
            </span>
          </div>
        </div>

        {/* QR Code Section */}
        <div className="vt-qr-section">
          <div className="vt-qr-container">
            <canvas ref={canvasRef} className="vt-qr-canvas" />
          </div>
          <p className="vt-qr-caption">
            {isOnline
              ? 'Scan at event entrance gate for direct verified entry'
              : 'Scan at desk for wristband handover & verification'}
          </p>
        </div>

        {/* Footer Warning & Notice */}
        <div className="vt-footer">
          <p className="vt-notice">
            {isOnline ? (
              <>
                ✨ <strong>Official Online Pass:</strong> Show this virtual QR ticket on your smartphone at the gate on 17 October 2026 for seamless entry.
              </>
            ) : (
              <>
                ⚠️ <strong>Important:</strong> Please show this reservation number along with a valid photo ID at <strong>Caha Gorakhpur (Kajakpur, Rail Vihar Colony Phase 3rd, Taramandal)</strong> to make payment and collect physical wristbands.
              </>
            )}
          </p>
          <div className="vt-event-info">
            <span>📅 Saturday, 17 October 2026</span>
            <span>📍 Mahant Digvijaynath Park, Gorakhpur</span>
          </div>
        </div>
      </div>

      {/* Interactive Action Buttons */}
      <div className="vt-actions-row">
        <button type="button" className="btn btn-outline vt-btn" onClick={handleCopyTicketNo}>
          {copied ? '✓ Copied!' : '📋 Copy Ticket No'}
        </button>

        <button
          type="button"
          className="btn btn-primary vt-btn"
          onClick={handleDownloadPng}
          disabled={downloadingPng}
        >
          {downloadingPng ? 'Preparing PNG...' : '🖼️ Download PNG'}
        </button>

        <button
          type="button"
          className="btn btn-secondary vt-btn"
          onClick={handleDownloadPdf}
          disabled={downloadingPdf}
        >
          {downloadingPdf ? 'Preparing PDF...' : '📄 Download PDF'}
        </button>

        <a
          href={`https://wa.me/?text=${shareText}`}
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-outline vt-btn whatsapp"
        >
          💬 Share on WhatsApp
        </a>
      </div>

      {/* Switcher & Navigation Links */}
      <div className="vt-secondary-links">
        {onBookAnother && (
          <button type="button" className="vt-link-btn" onClick={onBookAnother}>
            + Get Another Pass
          </button>
        )}
        {onClose && (
          <button type="button" className="vt-link-btn close" onClick={onClose}>
            Back to Website
          </button>
        )}
      </div>
    </div>
  );
};
