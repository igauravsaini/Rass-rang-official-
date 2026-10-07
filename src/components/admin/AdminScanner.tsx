import React, { useState, useEffect, useRef } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { safeParseJson } from '../../lib/api';
import '../../styles/booking.css';

export const AdminScanner: React.FC = () => {
  const [apiKey, setApiKey] = useState<string>(() => sessionStorage.getItem('rrg_admin_key') || '');
  const [keyInput, setKeyInput] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => Boolean(sessionStorage.getItem('rrg_admin_key')));

  const [ticketInput, setTicketInput] = useState('');
  const [activeAction, setActiveAction] = useState<'CHECK_IN' | 'COLLECT'>('CHECK_IN');
  const [isProcessing, setIsProcessing] = useState(false);
  const [scanResult, setScanResult] = useState<{
    type: 'success' | 'warning' | 'error';
    title: string;
    message: string;
    booking?: any;
  } | null>(null);

  const [recentScans, setRecentScans] = useState<any[]>([]);
  const scannerInstanceRef = useRef<Html5QrcodeScanner | null>(null);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!keyInput.trim()) return;
    sessionStorage.setItem('rrg_admin_key', keyInput.trim());
    setApiKey(keyInput.trim());
    setIsAuthenticated(true);
  };

  const playChime = (type: 'success' | 'error') => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);

      if (type === 'success') {
        osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
        osc.frequency.setValueAtTime(880.0, audioCtx.currentTime + 0.15); // A5
        gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.5);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.5);
      } else {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(220, audioCtx.currentTime); // A3
        osc.frequency.setValueAtTime(164.81, audioCtx.currentTime + 0.15); // E3
        gain.gain.setValueAtTime(0.4, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.6);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.6);
      }
    } catch {
      // AudioContext unavailable or blocked by browser
    }
  };

  const processTicket = async (ticketNo: string, currentKey: string, actionType: 'CHECK_IN' | 'COLLECT') => {
    if (!ticketNo || isProcessing) return;
    setIsProcessing(true);

    try {
      const res = await fetch('/api/verify-ticket', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': currentKey,
        },
        body: JSON.stringify({
          ticketNo: ticketNo.trim().toUpperCase(),
          action: actionType,
        }),
      });

      const data = await safeParseJson(res);

      if (res.status === 409 || data.error === 'ALREADY USED') {
        playChime('error');
        setScanResult({
          type: 'warning',
          title: '🚨 ALREADY USED TICKET!',
          message: data.message || 'This ticket was already checked in. Entry denied!',
          booking: data.booking,
        });
      } else if (!res.ok || !data.success) {
        playChime('error');
        setScanResult({
          type: 'error',
          title: '❌ Verification Failed',
          message: data.error || 'Invalid ticket code.',
          booking: data.booking,
        });
      } else {
        playChime('success');
        setScanResult({
          type: 'success',
          title: actionType === 'CHECK_IN' ? '✅ ENTRY GRANTED!' : '✅ PASS COLLECTED & PAID!',
          message: data.message,
          booking: data.booking,
        });

        setRecentScans((prev) => [
          {
            ticketNo: data.booking?.ticket_no || ticketNo,
            name: data.booking?.name,
            pass: data.booking?.passes?.code,
            time: new Date().toLocaleTimeString(),
            action: actionType,
          },
          ...prev.slice(0, 9),
        ]);
      }
    } catch (err: any) {
      playChime('error');
      setScanResult({
        type: 'error',
        title: 'Network / Server Error',
        message: err.message || 'Failed to reach server.',
      });
    } finally {
      setIsProcessing(false);
      setTicketInput('');
    }
  };

  useEffect(() => {
    if (!isAuthenticated || !apiKey) return;

    // Initialize Html5QrcodeScanner
    try {
      const scanner = new Html5QrcodeScanner(
        'qr-reader-container',
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          rememberLastUsedCamera: true,
        },
        /* verbose= */ false
      );

      scanner.render(
        (decodedText) => {
          let cleaned = decodedText.trim();
          // Extract RRG-26-XXXXXX if QR contains a full URL
          const match = cleaned.match(/RRG-\d{2}-[23456789ABCDEFGHJKMNPQRSTUVWXYZ]{6}/i);
          if (match) {
            cleaned = match[0].toUpperCase();
          }
          processTicket(cleaned, apiKey, activeAction);
        },
        () => {
          // ignore scan frame errors
        }
      );

      scannerInstanceRef.current = scanner;
    } catch (err) {
      console.error('[Scanner Init Error]', err);
    }

    return () => {
      if (scannerInstanceRef.current) {
        scannerInstanceRef.current.clear().catch(() => {});
      }
    };
  }, [isAuthenticated, apiKey, activeAction]);

  if (!isAuthenticated) {
    return (
      <div className="admin-login-screen">
        <div className="admin-login-card">
          <div className="admin-badge">Raas~Rang 2026 Scanner</div>
          <h2>Volunteer / Gate Key Required</h2>
          <p>Please enter your API Key to initialize the gate scanner camera.</p>
          <form onSubmit={handleLogin} className="admin-login-form">
            <input
              type="password"
              placeholder="Enter x-api-key"
              value={keyInput}
              onChange={(e) => setKeyInput(e.target.value)}
              required
            />
            <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
              Launch Scanner
            </button>
          </form>
          <a href="/admin" className="admin-back-link">← Go to Admin Dashboard</a>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-scanner-page">
      <header className="admin-navbar">
        <div className="admin-nav-brand">
          <span className="brand-dot"></span>
          <h1>Gate Pass Scanner • Raas~Rang 2026</h1>
        </div>
        <div className="admin-nav-actions">
          <a href="/admin" className="btn btn-outline btn-sm">
            ← Dashboard
          </a>
        </div>
      </header>

      <main className="scanner-main">
        {/* Action Toggle Bar */}
        <div className="scanner-action-toggle">
          <button
            type="button"
            className={`action-toggle-btn ${activeAction === 'CHECK_IN' ? 'active checkin' : ''}`}
            onClick={() => setActiveAction('CHECK_IN')}
          >
            🚪 Gate Check-In (Entry)
          </button>
          <button
            type="button"
            className={`action-toggle-btn ${activeAction === 'COLLECT' ? 'active collect' : ''}`}
            onClick={() => setActiveAction('COLLECT')}
          >
            🏷️ Desk Collection (Handover & Pay)
          </button>
        </div>

        {/* Live Result Banner */}
        {scanResult && (
          <div className={`scan-result-card ${scanResult.type}`}>
            <h3>{scanResult.title}</h3>
            <p>{scanResult.message}</p>
            {scanResult.booking && (
              <div className="result-ticket-details">
                <div><strong>Ticket:</strong> {scanResult.booking.ticket_no}</div>
                <div><strong>Attendee:</strong> {scanResult.booking.name}</div>
                <div><strong>Pass:</strong> {scanResult.booking.passes?.label || scanResult.booking.passes?.code} ({scanResult.booking.passes?.persons} Entry)</div>
                <div><strong>Current Status:</strong> <span className="highlight-status">{scanResult.booking.status}</span></div>
              </div>
            )}
          </div>
        )}

        {/* Camera Scanner Viewport */}
        <div className="scanner-viewport-card">
          <div id="qr-reader-container" style={{ width: '100%' }}></div>
        </div>

        {/* Manual Code Input Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            processTicket(ticketInput, apiKey, activeAction);
          }}
          className="manual-ticket-form"
        >
          <input
            type="text"
            placeholder="Or enter ticket no: RRG-26-XXXXXX"
            value={ticketInput}
            onChange={(e) => setTicketInput(e.target.value.toUpperCase())}
          />
          <button type="submit" className="btn btn-primary" disabled={isProcessing || !ticketInput.trim()}>
            {isProcessing ? 'Verifying...' : 'Verify Code'}
          </button>
        </form>

        {/* Recent Scans Session Log */}
        {recentScans.length > 0 && (
          <div className="recent-scans-card">
            <h4>Recent Scans This Session</h4>
            <div className="recent-scans-list">
              {recentScans.map((scan, i) => (
                <div key={i} className="recent-scan-item">
                  <span className="sc-time">{scan.time}</span>
                  <span className="sc-code">{scan.ticketNo}</span>
                  <span className="sc-name">{scan.name}</span>
                  <span className="sc-pass">{scan.pass}</span>
                  <span className={`sc-badge ${scan.action.toLowerCase()}`}>{scan.action}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
