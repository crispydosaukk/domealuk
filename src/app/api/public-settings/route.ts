import { NextRequest, NextResponse } from 'next/server';
import { dbAdmin } from '@/lib/firebase-admin';

export async function POST(req: NextRequest) {
  try {
    const snap = await dbAdmin.collection('settings').doc('global').get();
    if (snap.exists) {
      const data = snap.data() || {};

      // Exclude sensitive credentials before serving to the client
      const { stripeSecretKey, ...publicSettings } = data;

      // Set a fallback for publishable key if not in firestore
      publicSettings.stripePublishableKey =
        publicSettings.stripePublishableKey || process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '';
      publicSettings.deliveryFee = publicSettings.deliveryFee ?? 5;

      return NextResponse.json(publicSettings);
    }
  } catch (err: any) {
    console.error('Failed to fetch public settings:', err);
  }

  return NextResponse.json({
    stripePublishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '',
    popupDiscountPercentage: 25,
    popupOrdersCount: 4,
    deliveryFee: 5,
    deliveryDays: [1, 4],
    deliverySlots: [
      { id: 'slot-1', label: 'Morning', time: '7:30 AM – 8:30 AM', icon: '🌅', enabled: true },
      { id: 'slot-2', label: 'Afternoon', time: '12:00 PM – 1:00 PM', icon: '☀️', enabled: true },
      { id: 'slot-3', label: 'Evening', time: '7:30 PM – 8:30 PM', icon: '🌙', enabled: true },
    ],
  });
}
