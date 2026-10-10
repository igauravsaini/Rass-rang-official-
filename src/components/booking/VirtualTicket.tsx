import React, { useEffect, useRef, useState } from 'react';
import QRCode from 'qrcode';
import { VirtualTicketData } from '../../types/booking';
import {
  IconMapPin, IconClock, IconPhone,
  IconAlertTriangle, IconCalendar,
  IconCopy, IconCheck, IconImage, IconFile, IconMessageCircle,
} from './BookingIcons';

interface VirtualTicketProps {
  ticket: VirtualTicketData;
  onBookAnother?: () => void;
  onClose?: () => void;
}

/** Helper to draw rounded rectangle on Canvas */
function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

/**
 * Generates an exact 2634 × 1370 px (2x resolution, 1.92:1 landscape) ticket image.
 * Uses the official Sigma, Couple, or Family base art, places the attendee name & booking ID
 * on the left panel, and cleanly replaces the stub price with the white rounded QR tile & monospace ID.
 */
async function generateHighResTicketCanvas(ticket: VirtualTicketData): Promise<HTMLCanvasElement> {
  const canvas = document.createElement('canvas');
  canvas.width = 2634;
  canvas.height = 1370;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not create 2D canvas context');

  // Select background and theme by pass type
  let bgSrc = '/assets/images/tickets/ticket-bg-sigma.jpg';
  let stubBg = '#0c193c';
  if (ticket.passType === 'COUPLE') {
    bgSrc = '/assets/images/tickets/ticket-bg-couple.jpg';
    stubBg = '#240510';
  } else if (ticket.passType === 'FAMILY') {
    bgSrc = '/assets/images/tickets/ticket-bg-family.jpg';
    stubBg = '#041a14';
  }

  // 1. Draw base master background artwork
  const bgImg = new Image();
  bgImg.crossOrigin = 'anonymous';
  await new Promise<void>((resolve) => {
    bgImg.onload = () => resolve();
    bgImg.onerror = () => resolve();
    bgImg.src = bgSrc;
  });

  if (bgImg.complete && bgImg.naturalWidth > 0) {
    ctx.drawImage(bgImg, 0, 0, 2634, 1370);
  } else {
    // Fallback gradient if asset unavailable
    const grad = ctx.createLinearGradient(0, 0, 2634, 1370);
    grad.addColorStop(0, '#0a0314');
    grad.addColorStop(1, '#1b092a');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 2634, 1370);
  }

  // 2. Cover price area on the right stub with theme color
  ctx.save();
  ctx.fillStyle = stubBg;
  drawRoundedRect(ctx, 2080, 915, 370, 340, 16);
  ctx.fill();
  ctx.restore();

  // 3. Draw white rounded tile for QR code
  ctx.save();
  ctx.fillStyle = '#ffffff';
  ctx.strokeStyle = '#d4af37';
  ctx.lineWidth = 3;
  drawRoundedRect(ctx, 2145, 930, 240, 240, 18);
  ctx.fill();
  ctx.stroke();

  // Gold corner accents on white tile
  ctx.strokeStyle = '#f0b429';
  ctx.lineWidth = 4;
  ctx.lineCap = 'round';
  // Top-left
  ctx.beginPath();
  ctx.moveTo(2145, 955); ctx.lineTo(2145, 930); ctx.lineTo(2170, 930);
  ctx.stroke();
  // Top-right
  ctx.beginPath();
  ctx.moveTo(2385, 955); ctx.lineTo(2385, 930); ctx.lineTo(2360, 930);
  ctx.stroke();
  // Bottom-left
  ctx.beginPath();
  ctx.moveTo(2145, 1145); ctx.lineTo(2145, 1170); ctx.lineTo(2170, 1170);
  ctx.stroke();
  // Bottom-right
  ctx.beginPath();
  ctx.moveTo(2385, 1145); ctx.lineTo(2385, 1170); ctx.lineTo(2360, 1170);
  ctx.stroke();
  ctx.restore();

  // 4. Generate high-res QR code and draw inside tile
  try {
    const qrDataUrl = await QRCode.toDataURL(ticket.ticketNo, {
      margin: 1,
      width: 204,
      color: { dark: '#0a0412', light: '#ffffff' },
    });
    const qrImg = new Image();
    await new Promise<void>((res) => {
      qrImg.onload = () => res();
      qrImg.onerror = () => res();
      qrImg.src = qrDataUrl;
    });
    ctx.drawImage(qrImg, 2163, 948, 204, 204);
  } catch (err) {
    console.error('[QR generation failed for export]', err);
  }

  // 5. Monospace Ticket ID under QR
  ctx.save();
  ctx.fillStyle = '#f5d77f';
  ctx.font = 'bold 22px "Courier New", Courier, monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(ticket.ticketNo, 2265, 1215);
  ctx.restore();

  // 6. Buyer Name and Booking ID on Left Panel near bottom strip
  ctx.save();
  const attendeeText = `ATTENDEE: ${ticket.name.toUpperCase()}   ✦   BOOKING ID: ${ticket.ticketNo}`;
  ctx.font = '600 18px "Cinzel", "Playfair Display", Georgia, serif';
  const textWidth = ctx.measureText(attendeeText).width;
  const pillW = Math.max(textWidth + 80, 780);
  const pillX = 1150 - pillW / 2;

  // Translucent dark gold pill background
  ctx.fillStyle = 'rgba(6, 2, 14, 0.88)';
  ctx.strokeStyle = '#d4af37';
  ctx.lineWidth = 1.3;
  drawRoundedRect(ctx, pillX, 990, pillW, 38, 19);
  ctx.fill();
  ctx.stroke();

  // Pill text in gold
  ctx.fillStyle = '#f5d77f';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(attendeeText, 1150, 1010);
  ctx.restore();

  return canvas;
}

export const VirtualTicket: React.FC<VirtualTicketProps> = ({ ticket, onBookAnother, onClose }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const ticketRef = useRef<HTMLDivElement | null>(null);
  const [copied, setCopied] = useState(false);
  const [downloadingPng, setDownloadingPng] = useState(false);
  const [downloadingPdf, setDownloadingPdf] = useState(false);

  // Render on-screen QR code into the stub tile
  useEffect(() => {
    if (canvasRef.current && ticket.ticketNo) {
      QRCode.toCanvas(
        canvasRef.current,
        ticket.ticketNo,
        {
          width: 140,
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

  // Export ticket at 2x (2634 × 1370 px) as PNG
  const handleDownloadPng = async () => {
    try {
      setDownloadingPng(true);
      const canvas = await generateHighResTicketCanvas(ticket);
      const dataUrl = canvas.toDataURL('image/png', 1.0);
      const link = document.createElement('a');
      link.download = `RaasRang-${ticket.passType}-Pass-${ticket.ticketNo}.png`;
      link.href = dataUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error('[Download PNG] Failed:', err);
      alert('Unable to generate the ticket image. Please try again.');
    } finally {
      setDownloadingPng(false);
    }
  };

  // Export ticket at landscape 1.92:1 as PDF
  const handleDownloadPdf = async () => {
    try {
      setDownloadingPdf(true);
      const [{ default: jsPDF }, canvas] = await Promise.all([
        import('jspdf').then((module) => ({ default: module.jsPDF })),
        generateHighResTicketCanvas(ticket),
      ]);

      const imgData = canvas.toDataURL('image/png', 1.0);

      // Landscape format matching 2634 / 1370 mm ratio (263.4 × 137.0 mm)
      const pdfWidth = 263.4;
      const pdfHeight = 137.0;

      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: [pdfWidth, pdfHeight],
        compress: true,
      });

      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight, undefined, 'FAST');
      pdf.save(`RaasRang-${ticket.passType}-Pass-${ticket.ticketNo}.pdf`);
    } catch (err) {
      console.error('[Download PDF] Failed:', err);
      alert('Unable to generate the ticket PDF. Please try again.');
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
      `Official Website: ${typeof window !== 'undefined' ? window.location.origin : 'https://raasrang.live'}/`
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

  const passBgImage =
    ticket.passType === 'COUPLE'
      ? '/assets/images/tickets/ticket-bg-couple.jpg'
      : ticket.passType === 'FAMILY'
      ? '/assets/images/tickets/ticket-bg-family.jpg'
      : '/assets/images/tickets/ticket-bg-sigma.jpg';

  const stubThemeColor =
    ticket.passType === 'COUPLE'
      ? '#240510'
      : ticket.passType === 'FAMILY'
      ? '#041a14'
      : '#0c193c';

  return (
    <div className="virtual-ticket-wrapper">
      {/* ── 1. The Official Master Landscape Ticket (1.92:1) ── */}
      <div className="vt-landscape-ticket-container">
        <div id="virtualTicket" ref={ticketRef} className="vt-landscape-ticket">
          {/* Base Artwork matching Sigma / Couple / Family */}
          <img
            src={passBgImage}
            alt={`Raas~Rang 2026 ${ticket.passName} Ticket`}
            className="vt-landscape-bg"
            loading="eager"
          />

          {/* Left panel: Attendee Name & Booking ID in elegant type near the bottom strip */}
          <div className="vt-attendee-strip">
            <span className="vt-attendee-text">
              ATTENDEE: {ticket.name.toUpperCase()} <span className="vt-diamond">✦</span> BOOKING ID: {ticket.ticketNo}
            </span>
          </div>

          {/* Right stub: Cleanly replaces the price with white rounded QR tile + monospace ID */}
          <div
            className={`vt-stub-qr-tile-wrap theme-${ticket.passType.toLowerCase()}`}
            style={{ backgroundColor: stubThemeColor }}
          >
            <div className="vt-stub-qr-tile">
              {/* Gold corner accents */}
              <span className="vt-corner-bracket corner-tl" />
              <span className="vt-corner-bracket corner-tr" />
              <span className="vt-corner-bracket corner-bl" />
              <span className="vt-corner-bracket corner-br" />
              <canvas ref={canvasRef} className="vt-stub-qr-canvas" />
            </div>
            <div className="vt-stub-ticket-no">{ticket.ticketNo}</div>
          </div>
        </div>
      </div>

      {/* ── 2. Attendee Pass Info & Collection Guidelines Sheet ── */}
      <div className="vt-offline-sheet">
        <div className="vt-sheet-header">
          <div>
            <h3 className="vt-sheet-title">
              {isOnline ? 'Online Pass Confirmed' : 'Offline Reservation Confirmed'}
            </h3>
            <p className="vt-sheet-subtitle">
              {isOnline
                ? 'Your pass is confirmed. Show the QR code at event entrance gate.'
                : 'Your wristband is reserved. Bring this ticket to Caha Gorakhpur to pay and collect.'}
            </p>
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

        <div className="vt-offline-grid">
          <div className="vt-offline-item">
            <span className="vt-label">Attendee Name</span>
            <span className="vt-val highlight">{ticket.name}</span>
          </div>

          <div className="vt-offline-item">
            <span className="vt-label">Pass Category</span>
            <span className="vt-val">
              {ticket.passName} ({ticket.persons} Entry{ticket.persons > 1 ? 's' : ''})
            </span>
          </div>

          <div className="vt-offline-item">
            <span className="vt-label">Registered Mobile</span>
            <span className="vt-val">{ticket.mobileMasked}</span>
          </div>

          <div className="vt-offline-item">
            <span className="vt-label">
              {isOnline ? 'Pass Amount' : 'Amount Payable at Spot'}
            </span>
            <span className="vt-val gold">₹{ticket.price}</span>
          </div>

          <div className="vt-offline-item full-width">
            <span className="vt-label">
              {isOnline ? 'Event Gate & Venue' : 'Designated Collection Desk'}
            </span>
            <span className="vt-val spot-name">
              <IconMapPin size={16} /> {isOnline ? 'Mahant Digvijaynath Park, Gorakhpur' : ticket.spot}
            </span>
            <span className="vt-spot-address">
              {isOnline
                ? 'Direct Smartphone QR Gate Entry — No prior physical pickup needed'
                : ticket.spotAddress}
            </span>
            <span className="vt-spot-timings">
              {isOnline ? (
                <><IconClock size={14} /> Saturday, 17 October 2026 • Gates open 6:00 PM</>
              ) : (
                <><IconClock size={14} /> {ticket.spotTimings} • <IconPhone size={14} /> {ticket.spotContact}</>
              )}
            </span>
          </div>
        </div>

        <div className="vt-footer-notice">
          <IconAlertTriangle size={16} />{' '}
          <span>
            {isOnline ? (
              <strong>Important:</strong>
            ) : (
              <strong>Wristband Collection:</strong>
            )}{' '}
            {isOnline
              ? 'Please keep this pass or downloaded PNG handy on your phone on event night.'
              : 'Show this reservation number along with a valid photo ID at Caha Gorakhpur to collect physical wristbands.'}
          </span>
        </div>

        <div className="vt-event-info">
          <span><IconCalendar size={14} /> Saturday, 17 October 2026</span>
          <span><IconMapPin size={14} /> Mahant Digvijaynath Park, Gorakhpur</span>
        </div>
      </div>

      {/* ── 3. Interactive Action Buttons ── */}
      <div className="vt-actions-row">
        <button type="button" className="btn btn-outline vt-btn" onClick={handleCopyTicketNo}>
          {copied ? <><IconCheck size={16} /> Copied!</> : <><IconCopy size={16} /> Copy Ticket No</>}
        </button>

        <button
          type="button"
          className="btn btn-primary vt-btn"
          onClick={handleDownloadPng}
          disabled={downloadingPng}
        >
          {downloadingPng ? 'Generating 2x PNG...' : <><IconImage size={16} /> Download PNG (2x)</>}
        </button>

        <button
          type="button"
          className="btn btn-secondary vt-btn"
          onClick={handleDownloadPdf}
          disabled={downloadingPdf}
        >
          {downloadingPdf ? 'Preparing PDF...' : <><IconFile size={16} /> Download PDF</>}
        </button>

        <a
          href={`https://wa.me/?text=${shareText}`}
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-outline vt-btn whatsapp"
        >
          <IconMessageCircle size={16} /> Share on WhatsApp
        </a>
      </div>

      {/* ── 4. Switcher & Navigation Links ── */}
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
