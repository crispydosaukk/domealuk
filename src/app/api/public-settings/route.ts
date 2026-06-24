import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';

export async function POST(req: NextRequest) {
  try {
    const snap = await getDoc(doc(db, 'settings', 'global'));
    if (snap.exists()) {
      const data = snap.data();
      
      // Exclude sensitive credentials before serving to the client
      const { stripeSecretKey, ...publicSettings } = data;
      
      // Set a fallback for publishable key if not in firestore
      publicSettings.stripePublishableKey = publicSettings.stripePublishableKey || process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '';
      
      return NextResponse.json(publicSettings);
    }
  } catch (err: any) {
    console.error('Failed to fetch public settings:', err);
  }

  return NextResponse.json({
    stripePublishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '',
    popupDiscountPercentage: 25,
    popupOrdersCount: 4,
  });
}
