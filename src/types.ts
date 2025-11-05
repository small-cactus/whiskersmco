export type KittenStatus = 'available' | 'reserved' | 'sold';

export interface Bid {
  id: string;
  bidderName: string;
  amount: number;
  message?: string;
  placedAt: string; // ISO string
}

export interface Kitten {
  id: string;
  name: string;
  tagline: string;
  birthdate: string; // ISO string
  gender: 'male' | 'female';
  color: string;
  weightLbs: number;
  description: string;
  traits: string[];
  groomingNeeds: string;
  healthNotes: string;
  price: number;
  depositAmount: number;
  depositCheckoutUrl: string;
  buyNowCheckoutUrl: string;
  status: KittenStatus;
  heroImage: string;
  gallery: string[];
  bids: Bid[];
  createdAt: string;
  updatedAt: string;
  featured: boolean;
}

export type CheckoutActionType = 'deposit' | 'purchase';

export interface PendingCheckout {
  kittenId: string;
  action: CheckoutActionType;
  initiatedAt: string;
}

export interface KittenDraft {
  id?: string;
  name: string;
  tagline: string;
  birthdate: string;
  gender: 'male' | 'female';
  color: string;
  weightLbs: number;
  description: string;
  traits: string[];
  groomingNeeds: string;
  healthNotes: string;
  price: number;
  depositAmount: number;
  depositCheckoutUrl: string;
  buyNowCheckoutUrl: string;
  status?: KittenStatus;
  heroImage: string;
  gallery: string[];
  featured?: boolean;
}
