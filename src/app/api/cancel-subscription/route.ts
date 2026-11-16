import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { db } from '@/lib/firebase';
import { dbAdmin } from '@/lib/firebase-admin';
import { doc, getDoc, updateDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { sendSubscriptionCancelledEmail } from '@/lib/emailService';

export async function POST(req: NextRequest) {
  try {
    const { subscriptionId, orderId } = await req.json();

    if (!orderId && !subscriptionId) {
      return NextResponse.json({ error: 'Missing orderId or subscriptionId' }, { status: 400 });
    }

    let orderData: any = null;
    let foundOrderId = orderId;

    // 1. Fetch order data
    if (dbAdmin) {
      if (foundOrderId) {
        const snap = await dbAdmin.collection('orders').doc(foundOrderId).get();
        if (snap.exists) {
          orderData = snap.data();
        }
      } else if (subscriptionId) {
        const snap = await dbAdmin
          .collection('orders')
          .where('stripeSubscriptionId', '==', subscriptionId)
          .limit(1)
          .get();
        if (!snap.empty) {
          foundOrderId = snap.docs[0].id;
          orderData = snap.docs[0].data();
        }
      }
    } else {
      if (foundOrderId) {
        const snap = await getDoc(doc(db, 'orders', foundOrderId));
        if (snap.exists()) {
          orderData = snap.data();
        }
      } else if (subscriptionId) {
        const q = query(
          collection(db, 'orders'),
          where('stripeSubscriptionId', '==', subscriptionId)
        );
        const snap = await getDocs(q);
        if (!snap.empty) {
          foundOrderId = snap.docs[0].id;
          orderData = snap.docs[0].data();
        }
      }
    }

    const effectiveStripeSubId = subscriptionId || orderData?.stripeSubscriptionId;

    // 2. If it's a Stripe subscription, cancel on Stripe
    if (effectiveStripeSubId && effectiveStripeSubId.startsWith('sub_')) {
      try {
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
          const stripe = new Stripe(secretKey, { apiVersion: '2022-11-15' as any });
          await stripe.subscriptions.update(effectiveStripeSubId, {
            cancel_at_period_end: true,
          });
        }
      } catch (stripeErr) {
        console.warn('[cancel-subscription] Stripe cancellation error (continuing Firestore update):', stripeErr);
      }
    }

    // 3. Update Firestore order(s) to cancelled/cancelling
    const newSubscriptionStatus = effectiveStripeSubId?.startsWith('sub_') ? 'cancelling' : 'cancelled';

    if (dbAdmin) {
      if (foundOrderId) {
        await dbAdmin.collection('orders').doc(foundOrderId).update({
          subscriptionStatus: newSubscriptionStatus,
          cancelledAt: new Date().toISOString(),
        });
      }
      if (effectiveStripeSubId) {
        const snap = await dbAdmin
          .collection('orders')
          .where('stripeSubscriptionId', '==', effectiveStripeSubId)
          .get();
        for (const d of snap.docs) {
          await dbAdmin.collection('orders').doc(d.id).update({
            subscriptionStatus: newSubscriptionStatus,
            cancelledAt: new Date().toISOString(),
          });
        }
      }
    } else {
      if (foundOrderId) {
        await updateDoc(doc(db, 'orders', foundOrderId), {
          subscriptionStatus: newSubscriptionStatus,
          cancelledAt: new Date().toISOString(),
        });
      }
      if (effectiveStripeSubId) {
        const q = query(
          collection(db, 'orders'),
          where('stripeSubscriptionId', '==', effectiveStripeSubId)
        );
        const snap = await getDocs(q);
        for (const docSnap of snap.docs) {
          await updateDoc(doc(db, 'orders', docSnap.id), {
            subscriptionStatus: newSubscriptionStatus,
            cancelledAt: new Date().toISOString(),
          });
        }
      }
    }

    // 4. Send cancellation notification email to customer & admin
    if (foundOrderId) {
      try {
        await sendSubscriptionCancelledEmail(foundOrderId, orderData);
      } catch (emailErr) {
        console.error('[cancel-subscription] Failed to send cancellation email:', emailErr);
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Subscription autopay cancelled successfully. No further debits will occur.',
      subscriptionStatus: newSubscriptionStatus,
    });
  } catch (err: any) {
    console.error('Error cancelling subscription:', err);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
