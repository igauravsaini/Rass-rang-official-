import React from 'react';

/**
 * Gold-themed SVG icons for the Booking component.
 * All icons use 1.5px stroke, currentColor (defaults to antique-gold via CSS),
 * and a consistent 20×20 viewBox for optical alignment.
 */

interface IconProps {
  size?: number;
  className?: string;
  style?: React.CSSProperties;
}

const defaults: Required<Pick<IconProps, 'size'>> = { size: 20 };

/* ── Tab Icons ────────────────────────────────────── */

/** Ticket / Pass icon — used for "Get Offline Pass" tab */
export const IconTicket: React.FC<IconProps> = ({ size = defaults.size, className, style }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className} style={style} aria-hidden="true">
    <path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z" />
    <path d="M13 5v2" /><path d="M13 17v2" /><path d="M13 11v2" />
  </svg>
);

/** Globe icon — used for "Get Online Pass" tab */
export const IconGlobe: React.FC<IconProps> = ({ size = defaults.size, className, style }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className} style={style} aria-hidden="true">
    <circle cx="12" cy="12" r="10" />
    <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
    <path d="M2 12h20" />
  </svg>
);

/** Search icon — used for "Find My Ticket" tab */
export const IconSearch: React.FC<IconProps> = ({ size = defaults.size, className, style }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className} style={style} aria-hidden="true">
    <circle cx="11" cy="11" r="8" />
    <path d="m21 21-4.3-4.3" />
  </svg>
);

/* ── Alert Icons ──────────────────────────────────── */

/** Warning triangle — replaces ⚠️ in error alerts */
export const IconAlertTriangle: React.FC<IconProps> = ({ size = defaults.size, className, style }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className} style={style} aria-hidden="true">
    <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
    <path d="M12 9v4" /><path d="M12 17h.01" />
  </svg>
);

/** Info circle — replaces ℹ️ in warning alerts */
export const IconInfo: React.FC<IconProps> = ({ size = defaults.size, className, style }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className} style={style} aria-hidden="true">
    <circle cx="12" cy="12" r="10" />
    <path d="M12 16v-4" /><path d="M12 8h.01" />
  </svg>
);

/* ── Spot / Location Icons ────────────────────────── */

/** Building icon — replaces 🏢 */
export const IconBuilding: React.FC<IconProps> = ({ size = defaults.size, className, style }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className} style={style} aria-hidden="true">
    <rect width="16" height="20" x="4" y="2" rx="2" ry="2" />
    <path d="M9 22v-4h6v4" /><path d="M8 6h.01" /><path d="M16 6h.01" /><path d="M12 6h.01" />
    <path d="M12 10h.01" /><path d="M12 14h.01" /><path d="M16 10h.01" /><path d="M16 14h.01" />
    <path d="M8 10h.01" /><path d="M8 14h.01" />
  </svg>
);

/** Map pin icon — replaces 📍 */
export const IconMapPin: React.FC<IconProps> = ({ size = defaults.size, className, style }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className} style={style} aria-hidden="true">
    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);

/** Clock icon — replaces 🕒 */
export const IconClock: React.FC<IconProps> = ({ size = defaults.size, className, style }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className} style={style} aria-hidden="true">
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

/** Phone icon — replaces 📞 */
export const IconPhone: React.FC<IconProps> = ({ size = defaults.size, className, style }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className} style={style} aria-hidden="true">
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.362 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.338 1.85.573 2.81.7A2 2 0 0 1 22 16.92Z" />
  </svg>
);

/** Lightbulb icon — replaces 💡 */
export const IconLightbulb: React.FC<IconProps> = ({ size = defaults.size, className, style }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className} style={style} aria-hidden="true">
    <path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5" />
    <path d="M9 18h6" /><path d="M10 22h4" />
  </svg>
);

/* ── Action Icons ─────────────────────────────────── */

/** Clipboard / Copy icon — replaces 📋 */
export const IconCopy: React.FC<IconProps> = ({ size = defaults.size, className, style }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className} style={style} aria-hidden="true">
    <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
    <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
  </svg>
);

/** Image / Photo icon — replaces 🖼️ */
export const IconImage: React.FC<IconProps> = ({ size = defaults.size, className, style }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className} style={style} aria-hidden="true">
    <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
    <circle cx="9" cy="9" r="2" />
    <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
  </svg>
);

/** File / Document icon — replaces 📄 */
export const IconFile: React.FC<IconProps> = ({ size = defaults.size, className, style }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className} style={style} aria-hidden="true">
    <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
    <polyline points="14 2 14 8 20 8" />
  </svg>
);

/** Chat / Message icon — replaces 💬 for WhatsApp */
export const IconMessageCircle: React.FC<IconProps> = ({ size = defaults.size, className, style }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className} style={style} aria-hidden="true">
    <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" />
  </svg>
);

/** Check circle — replaces ✅ */
export const IconCheckCircle: React.FC<IconProps> = ({ size = defaults.size, className, style }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className} style={style} aria-hidden="true">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <polyline points="22 4 12 14.01 9 11.01" />
  </svg>
);

/** Checkmark icon — replaces ✓ */
export const IconCheck: React.FC<IconProps> = ({ size = defaults.size, className, style }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className} style={style} aria-hidden="true">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

/** Calendar icon — replaces 📅 */
export const IconCalendar: React.FC<IconProps> = ({ size = defaults.size, className, style }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className} style={style} aria-hidden="true">
    <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
    <line x1="16" x2="16" y1="2" y2="6" /><line x1="8" x2="8" y1="2" y2="6" />
    <line x1="3" x2="21" y1="10" y2="10" />
  </svg>
);

/** Sparkles / Star icon — replaces ✨ */
export const IconSparkles: React.FC<IconProps> = ({ size = defaults.size, className, style }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className} style={style} aria-hidden="true">
    <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
    <path d="M5 3v4" /><path d="M19 17v4" /><path d="M3 5h4" /><path d="M17 19h4" />
  </svg>
);

/** External link icon — for BookMyShow redirect */
export const IconExternalLink: React.FC<IconProps> = ({ size = defaults.size, className, style }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className} style={style} aria-hidden="true">
    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
    <polyline points="15 3 21 3 21 9" />
    <line x1="10" x2="21" y1="14" y2="3" />
  </svg>
);

/** Shield / Verified icon — for secure redirect messaging */
export const IconShieldCheck: React.FC<IconProps> = ({ size = defaults.size, className, style }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className} style={style} aria-hidden="true">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" />
    <path d="m9 12 2 2 4-4" />
  </svg>
);

/** Download icon */
export const IconDownload: React.FC<IconProps> = ({ size = defaults.size, className, style }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className} style={style} aria-hidden="true">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="7 10 12 15 17 10" />
    <line x1="12" x2="12" y1="15" y2="3" />
  </svg>
);

/* ── Person / Entry Category Icons ────────────────── */

/** Person icon — for 1 entry / Sigma Pass */
export const IconPerson: React.FC<IconProps> = ({ size = defaults.size, className, style }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className} style={style} aria-hidden="true">
    <circle cx="12" cy="7" r="4" />
    <path d="M5.5 21a6.5 6.5 0 0 1 13 0" />
  </svg>
);

/** Couple icon — for 2 entries / Couple Pass */
export const IconCouple: React.FC<IconProps> = ({ size = defaults.size, className, style }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className} style={style} aria-hidden="true">
    <circle cx="9" cy="7" r="3.5" />
    <path d="M3 21a6 6 0 0 1 11.5-2" />
    <circle cx="16.5" cy="8" r="3" />
    <path d="M15.5 14.5A5.5 5.5 0 0 1 21 20" />
  </svg>
);

/** Family icon — for 4 entries / Family Pass */
export const IconFamily: React.FC<IconProps> = ({ size = defaults.size, className, style }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className} style={style} aria-hidden="true">
    <circle cx="7" cy="7" r="3" />
    <path d="M2 20a5 5 0 0 1 9.5-2" />
    <circle cx="17" cy="7" r="3" />
    <path d="M12.5 18a5 5 0 0 1 9.5 2" />
    <circle cx="12" cy="11.5" r="2" />
    <path d="M9.5 21a3 3 0 0 1 5 0" />
  </svg>
);

/* ── QR & Motif Icons ─────────────────────────────── */

/** QR code icon */
export const IconQR: React.FC<IconProps> = ({ size = defaults.size, className, style }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className} style={style} aria-hidden="true">
    <rect width="6" height="6" x="3" y="3" rx="1" />
    <rect width="6" height="6" x="15" y="3" rx="1" />
    <rect width="6" height="6" x="3" y="15" rx="1" />
    <path d="M15 15h2v2h-2z" />
    <path d="M19 19h2v2h-2z" />
    <path d="M15 19v2h2" />
    <path d="M19 15h2v2" />
  </svg>
);

/** Lotus icon — traditional gold line motif */
export const IconLotus: React.FC<IconProps> = ({ size = defaults.size, className, style }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className} style={style} aria-hidden="true">
    <path d="M12 3c-1.5 3.5-2 6.5 0 10 2-3.5 1.5-6.5 0-10Z" />
    <path d="M12 13c-3-2-6.5-1.5-9 1 2 2.5 5 3 9 1Z" />
    <path d="M12 13c3-2 6.5-1.5 9 1-2 2.5-5 3-9 1Z" />
    <path d="M7 11.5C5 7 2 8 2 10.5c0 2 3 3.5 6 3" />
    <path d="M17 11.5C19 7 22 8 22 10.5c0 2-3 3.5-6 3" />
    <path d="M8 20c2 1 6 1 8 0" />
  </svg>
);

