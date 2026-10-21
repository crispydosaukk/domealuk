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

    // Schedule cancellation at end of current billing period (NOT immediate).
    // This means:
    //   - If payment was already taken for this week (Saturday midnight cutoff),
    //     the current week's delivery continues as normal.
    //   - Stripe will stop charging after the current period ends.
    //   - Stripe will fire `customer.subscription.deleted` at period end, which
    //     is where we finalize the cancellation in Firestore.
    const updatedSubscription = await stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: true,
    });

    // Mark all Firestore orders for this subscription as 'cancelling'.
    // We do NOT change `status` (Order Received / Delivered / etc.) so the
    // current week's order is still fulfilled normally by the kitchen.
    if (dbAdmin) {
      const snap = await dbAdmin
        .collection('orders')
        .where('stripeSubscriptionId', '==', subscriptionId)
        .get();

      for (const d of snap.docs) {
        await dbAdmin.collection('orders').doc(d.id).update({
          subscriptionStatus: 'cancelling',
          // Do NOT update `status` — current week's delivery must proceed
        });
      }

      // Also ensure the specific orderId passed is updated (in case it's a
      // guest-order that doesn't have stripeSubscriptionId set yet)
      if (orderId) {
        await dbAdmin.collection('orders').doc(orderId).update({
          subscriptionStatus: 'cancelling',
        });
      }
    } else {
      try {
        const ordersRef = collection(db, 'orders');
        const q = query(ordersRef, where('stripeSubscriptionId', '==', subscriptionId));
        const querySnapshot = await getDocs(q);

        for (const docSnap of querySnapshot.docs) {
          await updateDoc(doc(db, 'orders', docSnap.id), {
            subscriptionStatus: 'cancelling',
            // Do NOT update `status` — current week's delivery must proceed
          });
        }

        if (orderId) {
          const orderRef = doc(db, 'orders', orderId);
          await updateDoc(orderRef, {
            subscriptionStatus: 'cancelling',
          });
        }
      } catch (e) {
        console.warn('Failed to update orders on server using client SDK fallback:', e);
      }
    }

    return NextResponse.json({
      success: true,
      status: updatedSubscription.status,
      cancel_at_period_end: updatedSubscription.cancel_at_period_end,
    });
  } catch (err: any) {
    console.error('Error scheduling subscription cancellation:', err);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
