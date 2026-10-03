export interface TicketPass {
  id: string;
  name: string;
  type: string;
  price: number;
  isPopular?: boolean;
  popularBadgeText?: string;
  features: string[];
  delay: string;
}

export const ticketPasses: TicketPass[] = [
  {
    id: 'ticket-sigma',
    name: 'Sigma Pass',
    type: 'Single Entry',
    price: 499,
    features: [
      '✦ Single person entry',
      '✦ Full event access',
      '✦ Dandiya sticks included',
      '✦ Food court access',
      '✦ Photo booth access',
    ],
    delay: '0.1s',
  },
  {
    id: 'ticket-couple',
    name: 'Couple Pass',
    type: 'Double Entry',
    price: 899,
    isPopular: true,
    popularBadgeText: 'Most Popular',
    features: [
      '✦ Entry for 2 persons',
      '✦ Full event access',
      '✦ Dandiya sticks for both',
      '✦ Food court access',
      '✦ Photo booth access',
      '✦ Priority entry lane',
    ],
    delay: '0.2s',
  },
  {
    id: 'ticket-family',
    name: 'Family Pass',
    type: 'Four Entries',
    price: 1699,
    features: [
      '✦ Entry for 4 persons',
      '✦ Full event access',
      '✦ Dandiya sticks for all',
      '✦ Food court access',
      '✦ Photo booth access',
      '✦ Priority entry lane',
      '✦ Family zone access',
    ],
    delay: '0.3s',
  },
];

export const ticketTerms: string[] = [
  'All tickets are non-refundable and non-transferable.',
  'Entry is subject to valid government-issued photo ID.',
  'Gates close 30 minutes after the scheduled opening.',
  'Consumption of alcohol and prohibited items is strictly not allowed.',
  'The organiser reserves the right to deny entry without explanation.',
  'Event schedule is subject to change without prior notice.',
  'By purchasing a ticket, you agree to be photographed/filmed for promotional content.',
];
