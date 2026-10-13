import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { db } from '@/lib/firebase';
import { dbAdmin } from '@/lib/firebase-admin';
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  updateDoc,
  setDoc,
  getDoc,
} from 'firebase/firestore';
import { FieldValue as AdminFieldValue } from 'firebase-admin/firestore';
import { sendOrderConfirmationEmails } from '@/lib/emailService';

const getEpochTime = (val: any): number => {
  if (!val) return 0;
  if (typeof val.toDate === 'function') return val.toDate().getTime();
  if (val instanceof Date) return val.getTime();
  if (typeof val.toMillis === 'function') return val.toMillis();
  if (typeof val === 'number') return val;
  if (typeof val === 'string') {
    const parsed = new Date(val).getTime();
    return isNaN(parsed) ? 0 : parsed;
  }
  return 0;
};

const getServerTimestamp = () => {
  if (dbAdmin) {
    return AdminFieldValue.serverTimestamp();
  }
  const { serverTimestamp } = require('firebase/firestore');
  return serverTimestamp();
};

export async function POST(req: NextRequest) {
  try {
    // 1. Load Stripe Key
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

    // 2. Fetch all subscriptions from Stripe
    const subscriptions = await stripe.subscriptions.list({
      status: 'all',
      limit: 100,
    });

    const syncResults = {
      totalSubscriptions: subscriptions.data.length,
      ordersCreated: [] as string[],
      ordersUpdated: [] as string[],
      skippedInvoices: [] as string[],
    };

    for (const sub of subscriptions.data) {
      const subscriptionId = sub.id;

      // Update subscription status in Firestore orders
      if (dbAdmin) {
        const orderSnap = await dbAdmin
          .collection('orders')
          .where('stripeSubscriptionId', '==', subscriptionId)
          .get();

        for (const orderDoc of orderSnap.docs) {
          const currentStatus = orderDoc.data().subscriptionStatus;
          const mappedStatus =
            sub.status === 'active'
              ? 'active'
              : sub.status === 'past_due'
              ? 'past_due'
              : sub.status === 'canceled'
              ? 'cancelled'
              : sub.status;

          if (currentStatus !== mappedStatus) {
            await dbAdmin.collection('orders').doc(orderDoc.id).update({
              subscriptionStatus: mappedStatus,
            });
            syncResults.ordersUpdated.push(orderDoc.id);
          }
        }
      }

      // Check invoices for recurring renewal cycles
      const invoices = await stripe.invoices.list({
        subscription: subscriptionId,
        limit: 20,
      });

      for (const invoice of invoices.data) {
        // Only process paid cycle invoices
        if (invoice.status !== 'paid' || invoice.billing_reason !== 'subscription_cycle') {
          continue;
        }

        const invoiceId = invoice.id;

        // Check if order already exists for this invoice
        let existingOrder: any = null;
        if (dbAdmin) {
          const checkSnap = await dbAdmin
            .collection('orders')
            .where('stripeInvoiceId', '==', invoiceId)
            .limit(1)
            .get();
          if (!checkSnap.empty) {
            existingOrder = checkSnap.docs[0];
          }
        } else {
          const q = query(collection(db, 'orders'), where('stripeInvoiceId', '==', invoiceId));
          const snap = await getDocs(q);
          if (!snap.empty) {
            existingOrder = snap.docs[0];
          }
        }

        if (existingOrder) {
          syncResults.skippedInvoices.push(invoiceId);
          continue;
        }

        // Find the base order for this subscription to copy customer info, items, and slot
        let baseOrder: any = null;
        if (dbAdmin) {
          const baseSnap = await dbAdmin
            .collection('orders')
            .where('stripeSubscriptionId', '==', subscriptionId)
            .get();

          if (!baseSnap.empty) {
            const list = baseSnap.docs.map((d: any) => ({ id: d.id, ...d.data() }));
            list.sort((a: any, b: any) => getEpochTime(b.createdAt) - getEpochTime(a.createdAt));
            baseOrder = list[0];
          }
        } else {
          const q = query(collection(db, 'orders'), where('stripeSubscriptionId', '==', subscriptionId));
          const snap = await getDocs(q);
          if (!snap.empty) {
            const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
            list.sort((a: any, b: any) => getEpochTime(b.createdAt) - getEpochTime(a.createdAt));
            baseOrder = list[0];
          }
        }

        if (!baseOrder) {
          console.warn(`No base order found for subscription ${subscriptionId}, skipping invoice ${invoiceId}`);
          continue;
        }

        // Calculate delivery dates
        const frequency = baseOrder.subscriptionFrequency || 'Delivery every 1 Week';
        const daysToAdd = frequency.toLowerCase().includes('2 week') ? 14 : 7;
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        let newDeliveryDates: string[] = [];
        if (baseOrder.deliveryDates && baseOrder.deliveryDates.length > 0) {
          newDeliveryDates = baseOrder.deliveryDates.map((dStr: string) => {
            const d = new Date(dStr);
            d.setDate(d.getDate() + daysToAdd);
            while (d < today) {
              d.setDate(d.getDate() + 7);
            }
            return d.toISOString().split('T')[0];
          });
        } else {
          const d = new Date();
          d.setDate(d.getDate() + daysToAdd);
          newDeliveryDates = [d.toISOString().split('T')[0]];
        }

        const newOrderId = `VSL-${Math.floor(10000 + Math.random() * 90000)}`;
        const renewalAmount =
          typeof invoice.amount_paid === 'number'
            ? Math.round((invoice.amount_paid / 100) * 100) / 100
            : baseOrder.total;

        const newOrderPayload = {
          userId: baseOrder.userId || 'guest-user',
          customerEmail: baseOrder.customerEmail || baseOrder.email || invoice.customer_email || '',
          email: baseOrder.customerEmail || baseOrder.email || invoice.customer_email || '',
          items: baseOrder.items || [],
          total: renewalAmount,
          subtotal: baseOrder.subtotal || renewalAmount,
          walletApplied: 0,
          discountApplied: 0,
          studentDiscountApplied: 0,
          studentDiscountPercent: 0,
          address: baseOrder.address,
          deliveryDates: newDeliveryDates,
          deliverySlot: baseOrder.deliverySlot || 'Standard Delivery',
          deliverySlotId: baseOrder.deliverySlotId || null,
          notes: baseOrder.notes || '',
          paymentMethod: 'pay-online',
          subscriptionFrequency: frequency,
          stripeSubscriptionId: subscriptionId,
          stripeInvoiceId: invoiceId,
          subscriptionStatus: 'active',
          allergiesInfo: baseOrder.allergiesInfo || '',
          createdAt: invoice.created ? new Date(invoice.created * 1000) : getServerTimestamp(),
          status: 'Order Received',
          dabbaFeeApplied: false,
          dabbaFee: 0,
          confirmationEmailSent: false,
        };

        if (dbAdmin) {
          await dbAdmin.collection('orders').doc(newOrderId).set(newOrderPayload);
        } else {
          await setDoc(doc(db, 'orders', newOrderId), newOrderPayload);
        }

        syncResults.ordersCreated.push(newOrderId);
        console.log(`[Sync] Created renewal order ${newOrderId} for subscription ${subscriptionId} and invoice ${invoiceId}`);

        try {
          await sendOrderConfirmationEmails(newOrderId);
        } catch (emailErr) {
          console.error(`[Sync] Confirmation email error for ${newOrderId}:`, emailErr);
        }
      }
    }

    return NextResponse.json({
      success: true,
      results: syncResults,
    });
  } catch (err: any) {
    console.error('Error syncing Stripe subscriptions:', err);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
