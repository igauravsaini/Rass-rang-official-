export interface SponsorTier {
  id: string;
  badge: string;
  name: string;
  price: string;
  limitText?: string;
  benefits: string[];
  recommendedFor?: string;
  isTitle?: boolean;
  delay: string;
}

export interface ExclusivePartnership {
  id: string;
  icon: string;
  title: string;
  price: string;
  description: string;
  delay: string;
}

export const sponsorTiers: SponsorTier[] = [
  {
    id: 'sponsor-title',
    badge: '👑 Highest Category',
    name: 'Title Sponsor',
    price: '₹1,50,000',
    limitText: '1 Exclusive Brand Partner Only',
    isTitle: true,
    benefits: [
      '✦ Event Naming Rights — "[Your Brand] Presents Raas~Rang Garba Nights"',
      '✦ Entrance Dominance — Top marquee on 3D Light Gate & Welcome Banners',
      '✦ 90-sec Stage Address + 4 Live Emcee Plugs',
      '✦ Unlimited LED Video Ads during peak hours',
      '✦ Full 10×10 ft Branded Promo Canopy',
      '✦ 20 VIP Passes (Worth ₹1,699 each)',
      '✦ 3 Dedicated Social Media Reels',
      '✦ 6 Branded Venue Standees',
      '✦ Zero Competitor Clutter Guaranteed',
    ],
    recommendedFor: 'Recommended for: Real Estate Developers, Premium Auto Dealerships, Mega Retail Outlets & Universities.',
    delay: '0.1s',
  },
  {
    id: 'sponsor-copresenting',
    badge: '⭐ Tier 2',
    name: 'Co-Presenting',
    price: '₹1,00,000',
    benefits: [
      '✦ Co-Presenting Logo on Welcome Gates & Media Walls',
      '✦ 8 Full-Screen Video Slots on Main Stage LED',
      '✦ 60-sec Stage Address + 3 Emcee Plugs',
      '✦ Dedicated Promotional Desk/Booth',
      '✦ 12 VIP Passes',
      '✦ 4 Branded Venue Standees',
      '✦ 2 Dedicated Instagram Reels',
    ],
    delay: '0.2s',
  },
  {
    id: 'sponsor-powered',
    badge: '⚡ Tier 3',
    name: 'Powered By',
    price: '₹70,000',
    benefits: [
      '✦ "Powered By" Credit on banners, gates & digital creatives',
      '✦ 5 Full-Screen LED Video Slots',
      '✦ 40-sec Stage Address + 2 Emcee Mentions',
      '✦ 2 Venue Standees at key footfall areas',
      '✦ 8 VIP Passes',
    ],
    delay: '0.3s',
  },
  {
    id: 'sponsor-event',
    badge: '🎪 Entry Tier',
    name: 'Event Sponsor',
    price: '₹50,000',
    limitText: 'Associate Partner — High ROI Regional Package',
    benefits: [
      '✦ Welcome Banner Logo on 12×8 ft entry gates',
      '✦ 3 LED Video Commercial Runs',
      '✦ Opening Ceremony Emcee Announcement',
      '✦ Voucher Distribution to 1,500+ attendees',
      '✦ 4 Team Passes',
      '✦ 1 Branded Venue Standee',
    ],
    recommendedFor: 'Best for: Coaching academies, apparel boutiques, jewelry showrooms, wellness clinics, regional startups.',
    delay: '0.4s',
  },
];

export const exclusivePartnerships: ExclusivePartnership[] = [
  {
    id: 'partner-food',
    icon: '🍽️',
    title: 'Exclusive Food Partner',
    price: '₹2,00,000',
    description: '100% Venue Monopoly — Exclusive rights to all food counters. Branded pavilion, hourly stage plugs, WhatsApp ticket coupons, 10 Vendor + 4 VIP passes.',
    delay: '0.1s',
  },
  {
    id: 'partner-beverage',
    icon: '🥤',
    title: 'Beverage Partner',
    price: '₹50,000',
    description: 'Ideal for local cafés, bakeries, ice-cream parlours & snack brands. Beverage exclusivity with dedicated counter space.',
    delay: '0.15s',
  },
  {
    id: 'partner-auto',
    icon: '🚗',
    title: 'Auto Expo Partner',
    price: '₹75,000',
    description: '4-Wheeler Prime Showcase — Vehicle display platform at main entrance, test-drive desk, 3D Light Gate branding, Stage LED commercials, 6 Corporate Passes.',
    delay: '0.2s',
  },
  {
    id: 'partner-ev',
    icon: '⚡',
    title: 'EV Launch Partner',
    price: '₹50,000',
    description: '2-Wheeler / EV Launchpad — Dual-vehicle display zone, lead generation desk, welcome banner logo, LED ads, 6 VIP passes.',
    delay: '0.25s',
  },
  {
    id: 'partner-stall',
    icon: '🏪',
    title: 'Commercial F&B Stall',
    price: '₹50,000',
    description: '10×10 ft covered canopy in high-traffic dining zone. Keep 100% revenue. Own branded counter, 1 emcee plug, 4 vendor passes.',
    delay: '0.3s',
  },
];
