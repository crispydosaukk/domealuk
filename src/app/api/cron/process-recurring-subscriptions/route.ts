import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { dbAdmin } from '@/lib/firebase-admin';
import { collection, query, where, getDocs, doc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { FieldValue as AdminFieldValue } from 'firebase-admin/firestore';
import { chargeWorldpayRecurringPayment } from '@/lib/worldpay';
import { sendPaymentDebitedEmail } from '@/lib/emailService';
import {
  calculateNextDeliveryDates,
  getNextSaturdayMidnight,
  isSubscriptionOrder,
} from '@/lib/subscriptionScheduler';

export async function GET(req: NextRequest) {
  return handleProcessSubscriptions(req);
}

export async function POST(req: NextRequest) {
  return handleProcessSubscriptions(req);
}

async function handleProcessSubscriptions(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const force = searchParams.get('force') === 'true'; // allows manual testing/triggering
    const targetOrderId = searchParams.get('orderId'); // allows renewing a specific order

    const now = new Date();

    // 1. Fetch active subscription orders
    let activeOrders: any[] = [];

    if (dbAdmin) {
      let q = dbAdmin.collection('orders').where('subscriptionStatus', '==', 'active');
      if (targetOrderId) {
        const snap = await dbAdmin.collection('orders').doc(targetOrderId).get();
        if (snap.exists) {
          activeOrders = [{ id: snap.id, ...snap.data() }];
        }
      } else {
        const snap = await q.get();
        activeOrders = snap.docs.map((d: any) => ({ id: d.id, ...d.data() }));
      }
    } else {
      let q = query(collection(db, 'orders'), where('subscriptionStatus', '==', 'active'));
      const snap = await getDocs(q);
      activeOrders = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      if (targetOrderId) {
        activeOrders = activeOrders.filter((o) => o.id === targetOrderId);
      }
    }

    // Filter to valid subscription orders
    const candidateOrders = activeOrders.filter((order) => {
      // Avoid renewing child renewal orders directly; renew the parent base order
      if (order.isRenewal) return false;
      return isSubscriptionOrder(order);
    });

    const results = {
      totalFound: candidateOrders.length,
      processed: [] as string[],
      skippedNotDue: [] as string[],
      failed: [] as { orderId: string; reason: string }[],
    };

    for (const baseOrder of candidateOrders) {
      const orderId = baseOrder.id;

      // Check if billing is due
      let isDue = false;
      if (force) {
        isDue = true;
      } else if (baseOrder.nextBillingDate) {
        const nextBilling = new Date(baseOrder.nextBillingDate);
        // Due if nextBillingDate has passed or is within 1 hour
        isDue = nextBilling.getTime() <= now.getTime() + 60 * 60 * 1000;
      } else {
        // If nextBillingDate is not set, set it to the upcoming Saturday midnight and skip immediate debit
        const nextSaturday = getNextSaturdayMidnight().toISOString();
        if (dbAdmin) {
          await dbAdmin.collection('orders').doc(orderId).update({ nextBillingDate: nextSaturday });
        } else {
          await updateDoc(doc(db, 'orders', orderId), { nextBillingDate: nextSaturday });
        }
        results.skippedNotDue.push(orderId);
        continue;
      }

      if (!isDue) {
        results.skippedNotDue.push(orderId);
        continue;
      }

      // 2. Determine renewal pricing & details
      const renewalAmount = Number(baseOrder.subtotal || baseOrder.total || 0);
      const frequency = baseOrder.subscriptionFrequency || 'Delivery every 1 Week';
      const customerEmail = baseOrder.customerEmail || baseOrder.email || 'customer@domeal.co.uk';
      const newOrderId = `VSL-REC-${Math.floor(10000 + Math.random() * 90000)}`;
      const nextDeliveryDates = calculateNextDeliveryDates(baseOrder.deliveryDates || [], frequency);

      // 3. Process payment debit via Worldpay
      let paymentSuccess = false;
      let paymentStatus = 'paid';
      let failureReason = '';

      if (baseOrder.paymentMethod === 'worldpay') {
        try {
          const debitRes = await chargeWorldpayRecurringPayment({
            transactionReference: newOrderId,
            amount: renewalAmount,
            currencyCode: 'GBP',
            customerEmail,
            description: `DoMeal Subscription ${newOrderId}`,
          });

          if (debitRes.success) {
            paymentSuccess = true;
            paymentStatus = 'paid';
          } else {
            paymentSuccess = false;
            failureReason = debitRes.error || debitRes.status || 'Worldpay recurring charge declined';
          }
        } catch (payErr: any) {
          paymentSuccess = false;
          failureReason = payErr.message || 'Payment execution error';
        }
      } else {
        // For other methods (legacy Stripe / pay-online)
        paymentSuccess = true;
      }

      if (!paymentSuccess) {
        console.error(`[Recurring Billing] Debit failed for subscription ${orderId}: ${failureReason}`);
        if (dbAdmin) {
          await dbAdmin.collection('orders').doc(orderId).update({
            subscriptionStatus: 'past_due',
            lastFailedBillingAt: dbAdmin ? AdminFieldValue.serverTimestamp() : new Date(),
            lastFailedBillingReason: failureReason,
          });
        } else {
          await updateDoc(doc(db, 'orders', orderId), {
            subscriptionStatus: 'past_due',
            lastFailedBillingAt: serverTimestamp(),
            lastFailedBillingReason: failureReason,
          });
        }

        results.failed.push({ orderId, reason: failureReason });
        continue;
      }

      // 4. Create the new weekly order in Firestore
      const newOrderPayload: any = {
        parentOrderId: orderId,
        userId: baseOrder.userId || 'guest-user',
        customerEmail,
        email: customerEmail,
        items: baseOrder.items || [],
        total: renewalAmount,
        subtotal: renewalAmount,
        walletApplied: 0,
        discountApplied: 0,
        studentDiscountApplied: 0,
        studentDiscountPercent: 0,
        address: baseOrder.address || null,
        deliveryDates: nextDeliveryDates,
        deliverySlot: baseOrder.deliverySlot || 'Standard Delivery',
        deliverySlotId: baseOrder.deliverySlotId || null,
        notes: baseOrder.notes || '',
        paymentMethod: baseOrder.paymentMethod || 'worldpay',
        subscriptionFrequency: frequency,
        subscriptionStatus: 'active',
        allergiesInfo: baseOrder.allergiesInfo || '',
        createdAt: dbAdmin ? AdminFieldValue.serverTimestamp() : serverTimestamp(),
        status: 'Order Received',
        paymentStatus,
        dabbaFeeApplied: false,
        dabbaFee: 0,
        deliveryFee: baseOrder.deliveryFee ?? 5.0,
        isRenewal: true,
        billingCycle: (Number(baseOrder.billingCycle) || 1) + 1,
        confirmationEmailSent: false,
      };

      if (dbAdmin) {
        await dbAdmin.collection('orders').doc(newOrderId).set(newOrderPayload);
      } else {
        await setDoc(doc(db, 'orders', newOrderId), newOrderPayload);
      }

      // 5. Advance parent subscription billing date to next cycle
      const isBiWeekly = frequency.toLowerCase().includes('2 week');
      const isMonthly = frequency.toLowerCase().includes('4 week');
      const daysToAdd = isMonthly ? 28 : isBiWeekly ? 14 : 7;

      const nextSaturday = new Date(baseOrder.nextBillingDate ? new Date(baseOrder.nextBillingDate) : now);
      nextSaturday.setDate(nextSaturday.getDate() + daysToAdd);
      nextSaturday.setHours(23, 59, 59, 999);

      const parentUpdates: any = {
        lastBilledAt: dbAdmin ? AdminFieldValue.serverTimestamp() : serverTimestamp(),
        lastRenewalOrderId: newOrderId,
        nextBillingDate: nextSaturday.toISOString(),
        billingCycle: (Number(baseOrder.billingCycle) || 1) + 1,
        subscriptionStatus: 'active',
        updatedAt: dbAdmin ? AdminFieldValue.serverTimestamp() : serverTimestamp(),
      };

      if (dbAdmin) {
        await dbAdmin.collection('orders').doc(orderId).update(parentUpdates);
      } else {
        await updateDoc(doc(db, 'orders', orderId), parentUpdates);
      }

      // 6. Send Renewal Confirmation / Payment Debited Email
      try {
        await sendPaymentDebitedEmail(
          newOrderId,
          {
            amount: renewalAmount,
            deliveryDates: nextDeliveryDates,
            frequency,
          },
          newOrderPayload
        );
      } catch (emailErr) {
        console.error(`[Recurring Billing] Error sending renewal email for ${newOrderId}:`, emailErr);
      }

      results.processed.push(newOrderId);
    }

    return NextResponse.json({
      success: true,
      timestamp: now.toISOString(),
      results,
    });
  } catch (err: any) {
    console.error('[Recurring Billing] Fatal runner error:', err);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}

