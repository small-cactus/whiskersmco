import type { Kitten } from '../types';

export const seedKittens: Kitten[] = [
  {
    id: 'kitten-luna',
    name: 'Luna',
    tagline: 'Velvet silver coat with ocean eyes',
    birthdate: '2024-04-12T00:00:00.000Z',
    gender: 'female',
    color: 'Silver tabby',
    weightLbs: 4.6,
    description:
      'Luna is our gentle daydreamer who loves curling up in sunny spots and purring softly when you talk to her. She has a playful streak in the evenings and already responds to her name.',
    traits: ['Lap-lover', 'Quiet companion', 'High intelligence'],
    groomingNeeds: 'Brush 3x weekly, ear check every Sunday, nails bi-weekly.',
    healthNotes:
      'Vaccinated, microchipped, and comes with genetic screening paperwork.',
    price: 2800,
    depositAmount: 350,
    depositCheckoutUrl: 'https://buy.stripe.com/test_28o4h51K65k13S28wx',
    buyNowCheckoutUrl: 'https://buy.stripe.com/test_00g8yTfzI2YuemQ7sv',
    status: 'available',
    heroImage:
      'https://images.unsplash.com/photo-1602595688238-9fffe12f60b7?auto=format&fit=crop&w=1200&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1583083527882-4bee9aba2afe?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1573865526739-10659fec78a5?auto=format&fit=crop&w=1200&q=80',
    ],
    bids: [
      {
        id: 'bid-luna-1',
        bidderName: 'Camille',
        amount: 2550,
        message: 'Ready to reserve and pick up in mid-July.',
        placedAt: '2024-06-28T14:25:00.000Z',
      },
    ],
    featured: true,
    createdAt: '2024-06-10T15:00:00.000Z',
    updatedAt: '2024-06-28T14:25:00.000Z',
  },
  {
    id: 'kitten-atlas',
    name: 'Atlas',
    tagline: 'Lion-like ear tufts and bold personality',
    birthdate: '2024-03-30T00:00:00.000Z',
    gender: 'male',
    color: 'Red smoke',
    weightLbs: 5.2,
    description:
      'Atlas is fearless, curious, and incredibly people-focused. He follows you from room to room and loves interactive toys. Perfect for an active family or someone who wants a shadow.',
    traits: ['Adventure buddy', 'Family-friendly', 'Raised with dogs'],
    groomingNeeds: 'Brush 4x weekly, lightly comb tail daily, nails weekly.',
    healthNotes:
      'Dewormed, vaccinated, microchipped, negative for HCM/PKD via parents.',
    price: 3000,
    depositAmount: 400,
    depositCheckoutUrl: 'https://buy.stripe.com/test_bIYdTOap83EG59a288',
    buyNowCheckoutUrl: 'https://buy.stripe.com/test_9AQeVp6GC3oQanWaEM',
    status: 'available',
    heroImage:
      'https://images.unsplash.com/photo-1518020382113-a7e8fc38eac9?auto=format&fit=crop&w=1200&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1543852786-1cf6624b9987?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1543852786-1cf6624b9987?auto=format&fit=crop&w=1200&q=80',
    ],
    bids: [
      {
        id: 'bid-atlas-1',
        bidderName: 'Marcus',
        amount: 2850,
        placedAt: '2024-06-25T18:05:00.000Z',
      },
      {
        id: 'bid-atlas-2',
        bidderName: 'Elena',
        amount: 2900,
        message: 'Can pick up next weekend.',
        placedAt: '2024-06-26T09:40:00.000Z',
      },
    ],
    featured: true,
    createdAt: '2024-06-01T15:15:00.000Z',
    updatedAt: '2024-06-26T09:40:00.000Z',
  },
  {
    id: 'kitten-nova',
    name: 'Nova',
    tagline: 'Blue smoke coat with endless energy',
    birthdate: '2024-04-20T00:00:00.000Z',
    gender: 'female',
    color: 'Blue smoke',
    weightLbs: 4.1,
    description:
      'Nova is a confident explorer who loves puzzle feeders and clicker training. She thrives on enrichment and will happily join you on harness walks when she is older.',
    traits: ['Clicker-trained', 'High energy', 'Great with older kids'],
    groomingNeeds:
      'Brush 3x weekly, gentle eye wipe every morning, nails bi-weekly.',
    healthNotes: 'Vet checked, FIV/FeLV negative, insured for 30 days.',
    price: 2650,
    depositAmount: 350,
    depositCheckoutUrl: 'https://buy.stripe.com/test_00gbKQ1zIclMdR6aEL',
    buyNowCheckoutUrl: 'https://buy.stripe.com/test_7sI6rS1yg4Pifpu6os',
    status: 'reserved',
    heroImage:
      'https://images.unsplash.com/photo-1602785164809-8f22f996a3f1?auto=format&fit=crop&w=1200&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1543852786-1cf6624b9987?auto=format&fit=crop&w=1200&q=80',
    ],
    bids: [],
    featured: false,
    createdAt: '2024-06-15T11:10:00.000Z',
    updatedAt: '2024-06-20T10:00:00.000Z',
  },
];
