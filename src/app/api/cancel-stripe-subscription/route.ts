import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { db } from '@/lib/firebase';
import { dbAdmin } from '@/lib/firebase-admin';
import { doc, getDoc, updateDoc, collection, query, where, getDocs } from 'firebase/firestore';

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

    // Update all Firestore orders associated with this subscriptionId
    if (dbAdmin) {
      const snap = await dbAdmin
        .collection('orders')
        .where('stripeSubscriptionId', '==', subscriptionId)
        .get();

      for (const d of snap.docs) {
        await dbAdmin.collection('orders').doc(d.id).update({
          subscriptionStatus: 'cancelled',
          status: 'Cancelled',
        });
      }

      if (orderId) {
        await dbAdmin.collection('orders').doc(orderId).update({
          subscriptionStatus: 'cancelled',
          status: 'Cancelled',
        });
      }
    } else {
      try {
        const ordersRef = collection(db, 'orders');
        const q = query(ordersRef, where('stripeSubscriptionId', '==', subscriptionId));
        const querySnapshot = await getDocs(q);

        for (const docSnap of querySnapshot.docs) {
          await updateDoc(doc(db, 'orders', docSnap.id), {
            subscriptionStatus: 'cancelled',
            status: 'Cancelled',
          });
        }

        if (orderId) {
          const orderRef = doc(db, 'orders', orderId);
          await updateDoc(orderRef, {
            subscriptionStatus: 'cancelled',
            status: 'Cancelled',
          });
        }
      } catch (e) {
        console.warn('Failed to update orders on server using client SDK fallback:', e);
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
