export type PassCode = 'SIGMA' | 'COUPLE' | 'FAMILY';

export type TicketStatus = 'PRE_BOOKED' | 'ISSUED' | 'COLLECTED' | 'CHECKED_IN' | 'CANCELLED';

export type PaymentStatus = 'PENDING' | 'PAID' | 'REFUNDED';

export interface PassItem {
  id: number;
  code: PassCode;
  label: string;
  persons: number;
  price: number;
  total_quota?: number | null;
}

export interface CollectionSpot {
  id: number;
  name: string;
  address: string;
  city: string;
  timings: string;
  contact_person: string;
  contact_phone: string;
}

export interface VirtualTicketData {
  ticketNo: string;
  name: string;
  mobileMasked: string;
  emailMasked?: string;
  passType: PassCode;
  passName: string;
  passMode?: 'ONLINE' | 'OFFLINE';
  persons: number;
  price: number;
  spot: string;
  spotAddress: string;
  spotCity?: string;
  spotTimings: string;
  spotContact: string;
  status: TicketStatus;
  paymentStatus?: PaymentStatus;
  createdAt: string;
  collectedAt?: string | null;
  checkedInAt?: string | null;
}

export interface BookingFormData {
  name: string;
  mobile: string;
  email: string;
  passType: PassCode;
  passMode?: 'ONLINE' | 'OFFLINE';
  spotId: number | '';
  termsAccepted: boolean;
  turnstileToken?: string;
}
