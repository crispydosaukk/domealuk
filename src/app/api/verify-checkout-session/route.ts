import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { dbAdmin } from '@/lib/firebase-admin';
import Stripe from 'stripe';
import { FieldValue as AdminFieldValue } from 'firebase-admin/firestore';
import { doc, getDoc, updateDoc, runTransaction, serverTimestamp } from 'firebase/firestore';
import { sendOrderConfirmationEmails } from '@/lib/emailService';

export async function POST(req: NextRequest) {
  try {
    const { sessionId, orderId } = await req.json();

    if (!sessionId || !orderId) {
      return NextResponse.json({ error: 'Missing sessionId or orderId' }, { status: 400 });
    }

    let orderData: any = null;

    // Check if this is a Worldpay order
    if (orderId) {
      let existingOrder: any = null;
      if (dbAdmin) {
        const snap = await dbAdmin.collection('orders').doc(orderId).get();
        if (snap.exists) existingOrder = snap.data();
      } else {
        const snap = await getDoc(doc(db, 'orders', orderId));
        if (snap.exists()) existingOrder = snap.data();
      }

      if (existingOrder && (existingOrder.paymentMethod === 'worldpay' || !sessionId.startsWith('cs_'))) {
        // Worldpay payment verification
        if (dbAdmin) {
          const orderRef = dbAdmin.collection('orders').doc(orderId);
          await dbAdmin.runTransaction(async (transaction: any) => {
            const orderSnap = await transaction.get(orderRef);
            if (!orderSnap.exists) return;
            orderData = orderSnap.data();

            if (orderData.status === 'Pending Payment') {
              transaction.update(orderRef, {
                status: 'Order Received',
                subscriptionStatus: 'active',
                paymentStatus: 'paid',
                paymentMethod: 'worldpay',
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
                }
              }
            }
          });
        } else {
          const orderRef = doc(db, 'orders', orderId);
          await runTransaction(db, async (transaction) => {
            const orderSnap = await transaction.get(orderRef);
            if (!orderSnap.exists()) return;
            orderData = orderSnap.data();

            if (orderData.status === 'Pending Payment') {
              transaction.update(orderRef, {
                status: 'Order Received',
                subscriptionStatus: 'active',
                paymentStatus: 'paid',
                paymentMethod: 'worldpay',
                updatedAt: serverTimestamp(),
              });
            }
          });
        }

        if (orderData && !orderData.confirmationEmailSent) {
          try {
            await sendOrderConfirmationEmails(orderId, orderData);
            if (dbAdmin) {
              await dbAdmin.collection('orders').doc(orderId).update({ confirmationEmailSent: true });
            } else {
              await updateDoc(doc(db, 'orders', orderId), { confirmationEmailSent: true });
            }
          } catch (mErr) {
            console.error('Worldpay order email send failed:', mErr);
          }
        }

        return NextResponse.json({ success: true, order: { ...orderData, orderId } });
      }
    }

    // Otherwise, check Stripe (legacy fallback)
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
      return NextResponse.json({ error: 'Payment gateway not configured' }, { status: 500 });
    }

    const stripe = new Stripe(secretKey, {
      apiVersion: '2022-11-15' as any,
    });

    const session = await stripe.checkout.sessions.retrieve(sessionId);
    if (!session || session.payment_status !== 'paid') {
      return NextResponse.json({ error: 'Session not paid or invalid' }, { status: 400 });
    }

    if (dbAdmin) {
      const orderRef = dbAdmin.collection('orders').doc(orderId);
      await dbAdmin.runTransaction(async (transaction: any) => {
        const orderSnap = await transaction.get(orderRef);
        if (!orderSnap.exists) return;

        orderData = orderSnap.data();
        if (orderData.status !== 'Pending Payment') {
          return;
        }

        const resolvedCustomerEmail =
          orderData.customerEmail ||
          orderData.email ||
          session.customer_details?.email ||
          session.customer_email ||
          null;

        const updateData: any = {
          status: 'Order Received',
          subscriptionStatus: 'active',
          stripeSubscriptionId: session.subscription || null,
          updatedAt: AdminFieldValue.serverTimestamp(),
        };

        if (resolvedCustomerEmail && !orderData.customerEmail) {
          updateData.customerEmail = resolvedCustomerEmail;
          updateData.email = resolvedCustomerEmail;
        }

        transaction.update(orderRef, updateData);

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

        const resolvedCustomerEmail =
          orderData.customerEmail ||
          orderData.email ||
          session.customer_details?.email ||
          session.customer_email ||
          null;

        const updateData: any = {
          status: 'Order Received',
          subscriptionStatus: 'active',
          stripeSubscriptionId: session.subscription || null,
          updatedAt: serverTimestamp(),
        };

        if (resolvedCustomerEmail && !orderData.customerEmail) {
          updateData.customerEmail = resolvedCustomerEmail;
          updateData.email = resolvedCustomerEmail;
        }

        transaction.update(orderRef, updateData);

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

    // Trigger confirmation email (idempotent, checks confirmationEmailSent inside emailService)
    try {
      await sendOrderConfirmationEmails(orderId, orderData);
    } catch (emailErr) {
      console.error('Error sending confirmation email in verify-checkout-session:', emailErr);
    }

    return NextResponse.json({ success: true, order: orderData });
  } catch (err: any) {
    console.error('Error verifying checkout session:', err);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
