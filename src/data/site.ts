export interface SiteConfig {
  name: string;
  tagline: string;
  taglineHindi: string;
  description: string;
  eventDateISO: string; // Timezone-safe IST string
  displayDate: string;
  displayDateSub: string;
  time: string;
  timeSub: string;
  venueName: string;
  venueCityState: string;
  venueAddress: string;
  mapEmbedUrl: string;
  mapDirectionsUrl: string;
  phones: { display: string; tel: string }[];
  email: string;
  instagram: { handle: string; url: string };
  upiQrNote: string;
}

export const siteConfig: SiteConfig = {
  name: 'RAAS~RANG',
  tagline: 'Dance • Devotion • Togetherness',
  taglineHindi: 'भक्ति • संस्कृति • संगम',
  description: "Purvanchal's Premier Navratri Cultural Showcase & Festive Brand Expo",
  eventDateISO: '2026-10-17T18:00:00+05:30',
  displayDate: '17 October, 2026',
  displayDateSub: 'Festive Sharad Purnima Eve',
  time: '6:00 PM',
  timeSub: 'Onwards Till Late Night',
  venueName: 'Mahant Digvijaynath Park',
  venueCityState: 'Gorakhpur, Uttar Pradesh',
  venueAddress: 'Gorakhpur, Uttar Pradesh, India',
  mapEmbedUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3561.567!2d83.3732!3d26.7606!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3991446a0bfbbc35%3A0x724d30daa01b1be8!2sGorakhpur%2C%20Uttar%20Pradesh!5e0!3m2!1sen!2sin!4v1695000000000!5m2!1sen!2sin',
  mapDirectionsUrl: 'https://maps.google.com/?q=Mahant+Digvijaynath+Park+Gorakhpur',
  phones: [
    { display: '+91 96510 85051', tel: '+919651085051' },
  ],
  email: 'raasrang.gkp@gmail.com',
  instagram: {
    handle: '@raasrang_gkp',
    url: 'https://instagram.com/raasrang_gkp',
  },
  upiQrNote: 'QR payment available at checkout',
};
