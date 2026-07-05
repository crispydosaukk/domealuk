import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { dbAdmin } from '@/lib/firebase-admin';
import Stripe from 'stripe';
import { FieldValue as AdminFieldValue } from 'firebase-admin/firestore';
import { doc, getDoc, runTransaction, serverTimestamp } from 'firebase/firestore';

export async function POST(req: NextRequest) {
  try {
    const { sessionId, orderId } = await req.json();

    if (!sessionId || !orderId) {
      return NextResponse.json({ error: 'Missing sessionId or orderId' }, { status: 400 });
    }

    // 1. Initialize Stripe: Prioritize .env first, fall back to Firestore settings
    let secretKey = process.env.STRIPE_SECRET_KEY || '';
    if (!secretKey) {
      if (dbAdmin) {
        const globalSnap = await dbAdmin.collection('settings').doc('global').get();
        if (globalSnap.exists) {
          secretKey = globalSnap.data().stripeSecretKey || '';
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
      return NextResponse.json({ error: 'Stripe Secret Key not configured' }, { status: 500 });
    }

    const stripe = new Stripe(secretKey, {
      apiVersion: '2022-11-15' as any,
    });

    // 2. Retrieve checkout session
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    if (!session || session.payment_status !== 'paid') {
      return NextResponse.json({ error: 'Session not paid or invalid' }, { status: 400 });
    }

    let orderData: any = null;

    if (dbAdmin) {
      const orderRef = dbAdmin.collection('orders').doc(orderId);
      await dbAdmin.runTransaction(async (transaction: any) => {
        const orderSnap = await transaction.get(orderRef);
        if (!orderSnap.exists) return;

        orderData = orderSnap.data();
        if (orderData.status !== 'Pending Payment') {
          return;
        }

        transaction.update(orderRef, {
          status: 'Order Received',
          subscriptionStatus: 'active',
          stripeSubscriptionId: session.subscription || null,
          updatedAt: AdminFieldValue.serverTimestamp(),
        });

        const walletApplied = Number(orderData.walletApplied) || 0;
        const userId = orderData.userId;

        if (walletApplied > 0 && userId && userId !== 'guest-user') {
          const userRef = dbAdmin.collection('users').doc(userId);
          const userSnap = await transaction.get(userRef);
          if (userSnap.exists) {
            const currentBalance = userSnap.data().walletBalance || 0;
            const newBalance = Math.max(0, currentBalance - walletApplied);
            transaction.update(userRef, { walletBalance: newBalance });

            const txRef = dbAdmin.collection('wallet_transactions').doc(`order_debit_${orderId}`);
            transaction.set(txRef, {
              userId,
              amount: walletApplied,
              type: 'debit',
              status: 'completed',
              description: `Payment for Order #${orderId}`,
              createdAt: AdminFieldValue.serverTimestamp(),
            });
          }
        }
      });
    } else {
      // Client SDK fallback
      const orderRef = doc(db, 'orders', orderId);
      await runTransaction(db, async (transaction) => {
        const orderSnap = await transaction.get(orderRef);
        if (!orderSnap.exists()) return;

        orderData = orderSnap.data();
        if (orderData.status !== 'Pending Payment') {
          return;
        }

        transaction.update(orderRef, {
          status: 'Order Received',
          subscriptionStatus: 'active',
          stripeSubscriptionId: session.subscription || null,
          updatedAt: serverTimestamp(),
        });

        const walletApplied = Number(orderData.walletApplied) || 0;
        const userId = orderData.userId;

        if (walletApplied > 0 && userId && userId !== 'guest-user') {
          const userRef = doc(db, 'users', userId);
          const userSnap = await transaction.get(userRef);
          if (userSnap.exists()) {
            const currentBalance = userSnap.data().walletBalance || 0;
            const newBalance = Math.max(0, currentBalance - walletApplied);
            transaction.update(userRef, { walletBalance: newBalance });

            const txRef = doc(db, 'wallet_transactions', `order_debit_${orderId}`);
            transaction.set(txRef, {
              userId,
              amount: walletApplied,
              type: 'debit',
              status: 'completed',
              description: `Payment for Order #${orderId}`,
              createdAt: serverTimestamp(),
            });
          }
        }
      });
    }

    return NextResponse.json({ success: true, order: orderData });
  } catch (err: any) {
    console.error('Error verifying checkout session:', err);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
