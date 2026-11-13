import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { dbAdmin } from '@/lib/firebase-admin';
import { collection, query, where, getDocs, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { FieldValue as AdminFieldValue } from 'firebase-admin/firestore';
import { sendPreDebitReminderEmail } from '@/lib/emailService';
import {
  calculateNextDeliveryDates,
  formatRenewalDateString,
  isSubscriptionOrder,
} from '@/lib/subscriptionScheduler';

export async function GET(req: NextRequest) {
  return handlePreDebitReminders(req);
}

export async function POST(req: NextRequest) {
  return handlePreDebitReminders(req);
}

async function handlePreDebitReminders(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const force = searchParams.get('force') === 'true'; // allows manual testing
    const targetOrderId = searchParams.get('orderId');

    const now = new Date();
    // 48 hours window for advance reminder
    const reminderThreshold = new Date(now.getTime() + 48 * 60 * 60 * 1000);

    let activeOrders: any[] = [];

    if (dbAdmin) {
      if (targetOrderId) {
        const snap = await dbAdmin.collection('orders').doc(targetOrderId).get();
        if (snap.exists) activeOrders = [{ id: snap.id, ...snap.data() }];
      } else {
        const snap = await dbAdmin.collection('orders').where('subscriptionStatus', '==', 'active').get();
        activeOrders = snap.docs.map((d: any) => ({ id: d.id, ...d.data() }));
      }
    } else {
      const q = query(collection(db, 'orders'), where('subscriptionStatus', '==', 'active'));
      const snap = await getDocs(q);
      activeOrders = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      if (targetOrderId) {
        activeOrders = activeOrders.filter((o) => o.id === targetOrderId);
      }
    }

    const candidateOrders = activeOrders.filter((order) => {
      if (order.isRenewal) return false;
      return isSubscriptionOrder(order);
    });

    const results = {
      totalFound: candidateOrders.length,
      remindersSent: [] as string[],
      skippedNotWithinWindow: [] as string[],
      skippedAlreadyReminded: [] as string[],
    };

    for (const baseOrder of candidateOrders) {
      const orderId = baseOrder.id;

      if (!baseOrder.nextBillingDate) {
        results.skippedNotWithinWindow.push(orderId);
        continue;
      }

      const nextBilling = new Date(baseOrder.nextBillingDate);
      const isWithinWindow = force || (nextBilling > now && nextBilling <= reminderThreshold);

      if (!isWithinWindow) {
        results.skippedNotWithinWindow.push(orderId);
        continue;
      }

      // Check if reminder was already sent for this billing date cycle
      const cycleKey = nextBilling.toISOString().split('T')[0];
      if (!force && baseOrder.lastPreDebitReminderCycle === cycleKey) {
        results.skippedAlreadyReminded.push(orderId);
        continue;
      }

      const frequency = baseOrder.subscriptionFrequency || 'Delivery every 1 Week';
      const renewalAmount = Number(baseOrder.subtotal || baseOrder.total || 0);
      const estimatedDeliveryDates = calculateNextDeliveryDates(baseOrder.deliveryDates || [], frequency);
      const renewalDateStr = formatRenewalDateString(nextBilling);

      const emailRes = await sendPreDebitReminderEmail(
        orderId,
        {
          amount: renewalAmount,
          renewalDateStr,
          deliveryDates: estimatedDeliveryDates,
          frequency,
        },
        baseOrder
      );

      if (emailRes.success) {
        const updatePayload: any = {
          lastPreDebitReminderCycle: cycleKey,
          lastPreDebitReminderSentAt: dbAdmin ? AdminFieldValue.serverTimestamp() : serverTimestamp(),
        };

        if (dbAdmin) {
          await dbAdmin.collection('orders').doc(orderId).update(updatePayload);
        } else {
          await updateDoc(doc(db, 'orders', orderId), updatePayload);
        }

        results.remindersSent.push(orderId);
      }
    }

    return NextResponse.json({
      success: true,
      timestamp: now.toISOString(),
      results,
    });
  } catch (err: any) {
    console.error('[Pre-Debit Reminder] Runner error:', err);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}

