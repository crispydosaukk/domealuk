import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { db } from '@/lib/firebase';
import { dbAdmin } from '@/lib/firebase-admin';
import { doc, getDoc, updateDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { sendSubscriptionCancelledEmail } from '@/lib/emailService';

export async function POST(req: NextRequest) {
  try {
    const { subscriptionId, orderId } = await req.json();

    if (!subscriptionId && !orderId) {
      return NextResponse.json({ error: 'Missing subscriptionId or orderId' }, { status: 400 });
    }

    let orderData: any = null;
    let targetOrderId = orderId;

    if (targetOrderId) {
      if (dbAdmin) {
        const snap = await dbAdmin.collection('orders').doc(targetOrderId).get();
        if (snap.exists) orderData = snap.data();
      } else {
        const snap = await getDoc(doc(db, 'orders', targetOrderId));
        if (snap.exists()) orderData = snap.data();
      }
    }

    if (subscriptionId && subscriptionId.startsWith('sub_')) {
      let secretKey = process.env.STRIPE_SECRET_KEY || '';
      if (!secretKey) {
        if (dbAdmin) {
          const globalSnap = await dbAdmin.collection('settings').doc('global').get();
          if (globalSnap.exists) secretKey = globalSnap.data()?.stripeSecretKey || '';
        } else {
          const globalSnap = await getDoc(doc(db, 'settings', 'global'));
          if (globalSnap.exists()) secretKey = globalSnap.data()?.stripeSecretKey || '';
        }
      }

      if (secretKey) {
        try {
          const stripe = new Stripe(secretKey, {
            apiVersion: '2022-11-15' as any,
          });
          await stripe.subscriptions.update(subscriptionId, {
            cancel_at_period_end: true,
          });
        } catch (stripeErr) {
          console.warn('[cancel-stripe-subscription] Stripe API error:', stripeErr);
        }
      }
    }

    const newSubStatus = subscriptionId?.startsWith('sub_') ? 'cancelling' : 'cancelled';

    if (dbAdmin) {
      if (subscriptionId) {
        const snap = await dbAdmin
          .collection('orders')
          .where('stripeSubscriptionId', '==', subscriptionId)
          .get();
        for (const d of snap.docs) {
          await dbAdmin.collection('orders').doc(d.id).update({
            subscriptionStatus: newSubStatus,
            cancelledAt: new Date().toISOString(),
          });
          if (!targetOrderId) targetOrderId = d.id;
          if (!orderData) orderData = d.data();
        }
      }
      if (targetOrderId) {
        await dbAdmin.collection('orders').doc(targetOrderId).update({
          subscriptionStatus: newSubStatus,
          cancelledAt: new Date().toISOString(),
        });
      }
    } else {
      try {
        if (subscriptionId) {
          const ordersRef = collection(db, 'orders');
          const q = query(ordersRef, where('stripeSubscriptionId', '==', subscriptionId));
          const querySnapshot = await getDocs(q);
          for (const docSnap of querySnapshot.docs) {
            await updateDoc(doc(db, 'orders', docSnap.id), {
              subscriptionStatus: newSubStatus,
              cancelledAt: new Date().toISOString(),
            });
            if (!targetOrderId) targetOrderId = docSnap.id;
            if (!orderData) orderData = docSnap.data();
          }
        }
        if (targetOrderId) {
          const orderRef = doc(db, 'orders', targetOrderId);
          await updateDoc(orderRef, {
            subscriptionStatus: newSubStatus,
            cancelledAt: new Date().toISOString(),
          });
        }
      } catch (e) {
        console.warn('Failed to update orders on server using client SDK fallback:', e);
      }
    }

    if (targetOrderId) {
      try {
        await sendSubscriptionCancelledEmail(targetOrderId, orderData);
      } catch (e) {
        console.error('Failed to send subscription cancelled email:', e);
      }
    }

    return NextResponse.json({
      success: true,
      subscriptionStatus: newSubStatus,
    });
  } catch (err: any) {
    console.error('Error scheduling subscription cancellation:', err);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
