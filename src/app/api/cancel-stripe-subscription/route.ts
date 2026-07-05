import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { db } from '@/lib/firebase';
import { dbAdmin } from '@/lib/firebase-admin';
import { doc, getDoc, updateDoc } from 'firebase/firestore';

export async function POST(req: NextRequest) {
  try {
    const { subscriptionId, orderId } = await req.json();

    if (!subscriptionId) {
      return NextResponse.json({ error: 'Missing subscriptionId' }, { status: 400 });
    }

    // Load Stripe Key: Prioritize .env first, fall back to Firestore settings
    let secretKey = process.env.STRIPE_SECRET_KEY || '';

    if (!secretKey) {
      if (dbAdmin) {
        const globalSnap = await dbAdmin.collection('settings').doc('global').get();
        if (globalSnap.exists) {
          const data = globalSnap.data();
          if (data.stripeSecretKey) secretKey = data.stripeSecretKey;
        }
      } else {
        const globalSnap = await getDoc(doc(db, 'settings', 'global'));
        if (globalSnap.exists()) {
          const data = globalSnap.data();
          if (data.stripeSecretKey) secretKey = data.stripeSecretKey;
        }
      }
    }

    if (!secretKey) {
      return NextResponse.json({ error: 'Stripe Secret Key is not configured' }, { status: 500 });
    }

    const stripe = new Stripe(secretKey, {
      apiVersion: '2022-11-15' as any,
    });

    // Cancel subscription on Stripe
    const cancelledSubscription = await stripe.subscriptions.cancel(subscriptionId);

    // Update Firestore order if orderId is provided
    if (orderId) {
      if (dbAdmin) {
        await dbAdmin.collection('orders').doc(orderId).update({
          subscriptionStatus: 'cancelled',
          status: 'Cancelled',
        });
      } else {
        try {
          const orderRef = doc(db, 'orders', orderId);
          await updateDoc(orderRef, {
            subscriptionStatus: 'cancelled',
            status: 'Cancelled',
          });
        } catch (e) {
          console.warn('Failed to update order status on server using client SDK fallback:', e);
        }
      }
    }

    return NextResponse.json({
      success: true,
      status: cancelledSubscription.status,
    });
  } catch (err: any) {
    console.error('Error cancelling Stripe subscription:', err);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
