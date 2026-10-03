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

  const handleDownloadPng = async () => {
    if (!ticketRef.current) return;
    try {
      setDownloadingPng(true);
      const { default: html2canvas } = await import('html2canvas');
      const canvas = await html2canvas(ticketRef.current, {
        scale: 2,
        backgroundColor: '#0a0412',
        useCORS: true,
      });
      const dataUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `RaasRang-Ticket-${ticket.ticketNo}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('[Download PNG] Failed:', err);
      alert('Unable to generate ticket image. Please take a screenshot.');
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
      const canvas = await html2canvas(ticketRef.current, {
        scale: 2,
        backgroundColor: '#0a0412',
        useCORS: true,
      });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a5',
      });
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      pdf.addImage(imgData, 'PNG', 0, 5, pdfWidth, pdfHeight);
      pdf.save(`RaasRang-Ticket-${ticket.ticketNo}.pdf`);
    } catch (err) {
      console.error('[Download PDF] Failed:', err);
      alert('Unable to generate PDF ticket. Please download the PNG instead.');
    } finally {
      setDownloadingPdf(false);
    }
  };

  const shareText = encodeURIComponent(
    `Jai Mata Di! Here is my Pre-Ticket for Raas~Rang Garba Nights 2026 (Gorakhpur):\n` +
      `🎫 Ticket No: ${ticket.ticketNo}\n` +
      `👤 Name: ${ticket.name}\n` +
      `🎟️ Pass: ${ticket.passName}\n` +
      `📍 Collection Spot: ${ticket.spot}\n` +
      `Event Date: 17 Oct 2026 at Mahant Digvijaynath Park.\n` +
      `Reserve your ticket here: ${typeof window !== 'undefined' ? window.location.origin : 'https://raasranggkp.pages.dev'}/`
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
        return 'var(--antique-gold)';
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
              <p className="vt-subbrand">NAVRATRI 2026 • PRE-TICKET RESERVATION</p>
            </div>
          </div>
          <div
            className="vt-status-badge"
            style={{
              borderColor: getStatusColor(ticket.status),
              color: getStatusColor(ticket.status),
            }}
          >
            ● {ticket.status.replace('_', ' ')}
          </div>
        </div>

        {/* Golden Ornamental Divider */}
        <div className="vt-divider"></div>

        {/* Ticket Number Highlight */}
        <div className="vt-number-box">
          <span className="vt-number-label">RESERVATION NUMBER</span>
          <div className="vt-ticket-no">{ticket.ticketNo}</div>
          <span className="vt-number-note">Bring this code to collect physical passes</span>
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
            <span className="vt-label">Amount Payable at Spot</span>
            <span className="vt-val gold">₹{ticket.price}</span>
          </div>

          <div className="vt-detail-item full-width">
            <span className="vt-label">Designated Collection Spot</span>
            <span className="vt-val spot-name">📍 {ticket.spot}</span>
            <span className="vt-spot-address">{ticket.spotAddress}</span>
            <span className="vt-spot-timings">🕒 {ticket.spotTimings} • 📞 {ticket.spotContact}</span>
          </div>
        </div>

        {/* QR Code Section */}
        <div className="vt-qr-section">
          <div className="vt-qr-container">
            <canvas ref={canvasRef} className="vt-qr-canvas" />
          </div>
          <p className="vt-qr-caption">Scan at desk for pass handover & verification</p>
        </div>

        {/* Footer Warning & Notice */}
        <div className="vt-footer">
          <p className="vt-notice">
            ⚠️ <strong>Important:</strong> This is a pre-ticket reservation only. Please show this ticket number along with a valid government photo ID at the collection spot to make payment and collect physical entry passes.
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
            + Book Another Pass
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
