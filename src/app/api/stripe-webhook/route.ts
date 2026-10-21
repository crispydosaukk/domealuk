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
  runTransaction,
  FieldValue,
} from 'firebase/firestore';
import { FieldValue as AdminFieldValue } from 'firebase-admin/firestore';
import { sendOrderConfirmationEmails, sendPaymentDebitedEmail } from '@/lib/emailService';

// Helper function to safely extract epoch milliseconds from any timestamp format
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

// Helper function to resolve serverTimestamp or FieldValue.serverTimestamp
const getServerTimestamp = () => {
  if (dbAdmin) {
    return AdminFieldValue.serverTimestamp();
  }
  // Fallback to client SDK serverTimestamp
  const { serverTimestamp } = require('firebase/firestore');
  return serverTimestamp();
};

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get('stripe-signature');

  let stripe: Stripe;
  let event: Stripe.Event;

  try {
    // Load Stripe Key: Prioritize .env first, fall back to Firestore settings
    let secretKey = process.env.STRIPE_SECRET_KEY || '';
    let webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || '';

    if (!secretKey || !webhookSecret) {
      if (dbAdmin) {
        const globalSnap = await dbAdmin.collection('settings').doc('global').get();
        if (globalSnap.exists) {
          const data = globalSnap.data();
          if (!secretKey && data.stripeSecretKey) secretKey = data.stripeSecretKey;
          if (!webhookSecret && data.stripeWebhookSecret) webhookSecret = data.stripeWebhookSecret;
        }
      } else {
        const globalSnap = await getDoc(doc(db, 'settings', 'global'));
        if (globalSnap.exists()) {
          const data = globalSnap.data();
          if (!secretKey && data.stripeSecretKey) secretKey = data.stripeSecretKey;
          if (!webhookSecret && data.stripeWebhookSecret) webhookSecret = data.stripeWebhookSecret;
        }
      }
    }

    if (!secretKey) {
      return NextResponse.json({ error: 'Stripe Secret Key is not configured' }, { status: 500 });
    }

    stripe = new Stripe(secretKey, {
      apiVersion: '2022-11-15' as any,
    });

    if (webhookSecret && signature) {
      try {
        event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
      } catch (sigErr: any) {
        console.warn('Stripe signature verification failed, falling back to JSON.parse:', sigErr.message);
        event = JSON.parse(body);
      }
    } else {
      event = JSON.parse(body);
    }
  } catch (err: any) {
    console.error('Webhook payload parsing failed:', err.message);
    return NextResponse.json({ error: `Webhook error: ${err.message}` }, { status: 400 });
  }

  const session = event.data.object as any;

  try {
    switch (event.type) {
      case 'invoice.payment_succeeded': {
        const subscriptionId = session.subscription as string;
        const invoiceId = session.id as string;
        if (!subscriptionId) break;

        // Idempotency: avoid creating duplicate order for the same Stripe invoice
        if (invoiceId) {
          if (dbAdmin) {
            const existingOrderSnap = await dbAdmin
              .collection('orders')
              .where('stripeInvoiceId', '==', invoiceId)
              .limit(1)
              .get();
            if (!existingOrderSnap.empty) {
              console.log(`Order for invoice ${invoiceId} already exists (${existingOrderSnap.docs[0].id}). Skipping duplicate creation.`);
              break;
            }
          } else {
            try {
              const ordersRef = collection(db, 'orders');
              const q = query(ordersRef, where('stripeInvoiceId', '==', invoiceId));
              const querySnapshot = await getDocs(q);
              if (!querySnapshot.empty) {
                console.log(`Order for invoice ${invoiceId} already exists (${querySnapshot.docs[0].id}). Skipping duplicate creation.`);
                break;
              }
            } catch (e) {
              console.warn('Idempotency check query failed:', e);
            }
          }
        }

        // Retrieve subscription details
        let latestOrder: any = null;

        // Find the initial/previous order associated with this subscription
        if (dbAdmin) {
          const querySnapshot = await dbAdmin
            .collection('orders')
            .where('stripeSubscriptionId', '==', subscriptionId)
            .get();

          if (!querySnapshot.empty) {
            const ordersList = querySnapshot.docs.map((d: any) => ({ id: d.id, ...d.data() }));
            ordersList.sort((a: any, b: any) => getEpochTime(b.createdAt) - getEpochTime(a.createdAt));
            latestOrder = ordersList[0];

            // Update subscription status
            await dbAdmin.collection('orders').doc(latestOrder.id).update({
              subscriptionStatus: 'active',
            });
          }
        } else {
          try {
            const ordersRef = collection(db, 'orders');
            const q = query(ordersRef, where('stripeSubscriptionId', '==', subscriptionId));
            const querySnapshot = await getDocs(q);

            if (!querySnapshot.empty) {
              const ordersList = querySnapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
              ordersList.sort((a: any, b: any) => getEpochTime(b.createdAt) - getEpochTime(a.createdAt));
              latestOrder = ordersList[0];

              const latestOrderRef = doc(db, 'orders', latestOrder.id);
              await updateDoc(latestOrderRef, {
                subscriptionStatus: 'active',
              });
            }
          } catch (e) {
            console.error('Client SDK Webhook fallback failed to read/update order:', e);
          }
        }

        // Check if this is a recurring payment (not the first one)
        if (latestOrder && session.billing_reason === 'subscription_cycle') {
          // Generate a new Order ID
          const newOrderId = `VSL-${Math.floor(10000 + Math.random() * 90000)}`;

          // Calculate the new delivery dates based on the frequency
          const frequency = latestOrder.subscriptionFrequency || 'Delivery every 1 Week';
          const daysToAdd = frequency.toLowerCase().includes('2 week') ? 14 : 7;
          const today = new Date();
          today.setHours(0, 0, 0, 0);

          let newDeliveryDates: string[] = [];
          if (latestOrder.deliveryDates && latestOrder.deliveryDates.length > 0) {
            newDeliveryDates = latestOrder.deliveryDates.map((dStr: string) => {
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

          const renewalAmount =
            typeof session.amount_paid === 'number'
              ? Math.round((session.amount_paid / 100) * 100) / 100
              : latestOrder.total;

          const newOrderPayload = {
            userId: latestOrder.userId || 'guest-user',
            customerEmail: latestOrder.customerEmail || latestOrder.email || session.customer_email || '',
            email: latestOrder.customerEmail || latestOrder.email || session.customer_email || '',
            items: latestOrder.items || [],
            total: renewalAmount,
            subtotal: latestOrder.subtotal || renewalAmount,
            walletApplied: 0,
            discountApplied: 0,
            studentDiscountApplied: 0,
            studentDiscountPercent: 0,
            address: latestOrder.address,
            deliveryDates: newDeliveryDates,
            deliverySlot: latestOrder.deliverySlot || 'Standard Delivery',
            deliverySlotId: latestOrder.deliverySlotId || null,
            notes: latestOrder.notes || '',
            paymentMethod: 'pay-online',
            subscriptionFrequency: frequency,
            stripeSubscriptionId: subscriptionId,
            stripeInvoiceId: invoiceId || null,
            subscriptionStatus: 'active',
            allergiesInfo: latestOrder.allergiesInfo || '',
            createdAt: getServerTimestamp(),
            status: 'Order Received',
            dabbaFeeApplied: false,
            dabbaFee: 0,
            confirmationEmailSent: false,
          };

          if (dbAdmin) {
            await dbAdmin.collection('orders').doc(newOrderId).set(newOrderPayload);
          } else {
            try {
              const newOrderRef = doc(db, 'orders', newOrderId);
              await setDoc(newOrderRef, newOrderPayload);
            } catch (e) {
              console.error('Client SDK Webhook fallback failed to create cloned order:', e);
            }
          }

          console.log(
            `Created subsequent recurring order ${newOrderId} for subscription ${subscriptionId}`
          );

          try {
            await sendPaymentDebitedEmail(
              newOrderId,
              {
                amount: renewalAmount,
                deliveryDates: newDeliveryDates,
                invoiceId: invoiceId || undefined,
                frequency,
              },
              newOrderPayload
            );
          } catch (eErr) {
            console.error('Error sending payment debited email, falling back to confirmation email:', eErr);
            try {
              await sendOrderConfirmationEmails(newOrderId, newOrderPayload);
            } catch (fallbackErr) {
              console.error('Fallback confirmation email also failed:', fallbackErr);
            }
          }
        }
        break;
      }

      case 'invoice.payment_failed': {
        const subscriptionId = session.subscription as string;
        if (!subscriptionId) break;

        if (dbAdmin) {
          const querySnapshot = await dbAdmin
            .collection('orders')
            .where('stripeSubscriptionId', '==', subscriptionId)
            .get();

          for (const d of querySnapshot.docs) {
            await dbAdmin.collection('orders').doc(d.id).update({
              subscriptionStatus: 'past_due',
            });
          }
        } else {
          try {
            const ordersRef = collection(db, 'orders');
            const q = query(ordersRef, where('stripeSubscriptionId', '==', subscriptionId));
            const querySnapshot = await getDocs(q);

            for (const docSnap of querySnapshot.docs) {
              await updateDoc(doc(db, 'orders', docSnap.id), {
                subscriptionStatus: 'past_due',
              });
            }
          } catch (e) {
            console.error('Client SDK Webhook fallback failed to update failed payment order:', e);
          }
        }
        console.log(
          `Marked subscription ${subscriptionId} status as past_due because payment failed.`
        );
        break;
      }

      case 'customer.subscription.deleted': {
        const subscriptionId = session.id as string;
        if (!subscriptionId) break;

        // This webhook fires when the billing period truly ends (cancel_at_period_end reached).
        // At this point:
        //   - Mark subscriptionStatus = 'cancelled' on ALL orders for this subscription
        //   - Only set status = 'Cancelled' on orders still in 'Pending Payment'
        //     (orders already received/preparing/delivered are real fulfilled orders — don't touch them)
        const FULFILLED_STATUSES = ['Order Received', 'Confirmed', 'Preparing', 'Out for Delivery', 'Delivered'];

        if (dbAdmin) {
          const querySnapshot = await dbAdmin
            .collection('orders')
            .where('stripeSubscriptionId', '==', subscriptionId)
            .get();

          for (const d of querySnapshot.docs) {
            const orderData = d.data();
            const currentStatus = orderData.status || '';
            const isFulfilled = FULFILLED_STATUSES.includes(currentStatus);

            await dbAdmin.collection('orders').doc(d.id).update({
              subscriptionStatus: 'cancelled',
              // Only cancel orders not yet in progress — don't overwrite fulfilled delivery orders
              ...(isFulfilled ? {} : { status: 'Cancelled' }),
            });
          }
        } else {
          try {
            const ordersRef = collection(db, 'orders');
            const q = query(ordersRef, where('stripeSubscriptionId', '==', subscriptionId));
            const querySnapshot = await getDocs(q);

            for (const docSnap of querySnapshot.docs) {
              const orderData = docSnap.data();
              const currentStatus = orderData.status || '';
              const isFulfilled = FULFILLED_STATUSES.includes(currentStatus);

              await updateDoc(doc(db, 'orders', docSnap.id), {
                subscriptionStatus: 'cancelled',
                // Only cancel orders not yet in progress — don't overwrite fulfilled delivery orders
                ...(isFulfilled ? {} : { status: 'Cancelled' }),
              });
            }
          } catch (e) {
            console.error('Client SDK Webhook fallback failed to delete/cancel order:', e);
          }
        }
        console.log(`Subscription ${subscriptionId} period ended. Updated orders to cancelled (preserved fulfilled order statuses).`);
        break;
      }

      case 'checkout.session.completed': {
        const metadata = session.metadata;
        if (metadata && metadata.type === 'gift_card') {
          const senderName = metadata.senderName;
          const senderEmail = metadata.senderEmail;
          const recipientFirstName = metadata.recipientFirstName;
          const recipientLastName = metadata.recipientLastName;
          const recipientEmail = metadata.recipientEmail;
          const message = metadata.message;
          const sendOn = metadata.sendOn;
          const giftAmount = Number(metadata.giftAmount);
          const userId = metadata.userId;

          if (dbAdmin) {
            await dbAdmin.collection('gift_cards').add({
              stripeSessionId: session.id,
              senderName,
              senderEmail,
              recipientFirstName,
              recipientLastName,
              recipientEmail: recipientEmail.toLowerCase(),
              message: message || '',
              sendOn,
              giftAmount,
              claimed: false,
              createdAt: AdminFieldValue.serverTimestamp(),
            });
          }
        } else if (metadata?.orderId || (metadata && metadata.type === 'subscription_order')) {
          const orderId = metadata.orderId;
          const userId = metadata.userId;

          if (orderId) {
            if (dbAdmin) {
              const orderRef = dbAdmin.collection('orders').doc(orderId);
              await dbAdmin.runTransaction(async (transaction: any) => {
                const orderSnap = await transaction.get(orderRef);
                if (!orderSnap.exists) return;

                const orderData = orderSnap.data();
                if (orderData.status !== 'Pending Payment') {
                  return;
                }

                const resolvedCustomerEmail =
                  orderData.customerEmail ||
                  orderData.email ||
                  metadata?.customerEmail ||
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
                if (walletApplied > 0 && userId && userId !== 'guest-user') {
                  const userRef = dbAdmin.collection('users').doc(userId);
                  const userSnap = await transaction.get(userRef);
                  if (userSnap.exists) {
                    const currentBalance = userSnap.data().walletBalance || 0;
                    const newBalance = Math.max(0, currentBalance - walletApplied);
                    transaction.update(userRef, { walletBalance: newBalance });

                    const txRef = dbAdmin
                      .collection('wallet_transactions')
                      .doc(`order_debit_${orderId}`);
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
              try {
                const orderRef = doc(db, 'orders', orderId);
                await runTransaction(db, async (transaction) => {
                  const orderSnap = await transaction.get(orderRef);
                  if (!orderSnap.exists()) return;

                  const orderData = orderSnap.data();
                  if (orderData.status !== 'Pending Payment') return;

                  const resolvedCustomerEmail =
                    orderData.customerEmail ||
                    orderData.email ||
                    metadata?.customerEmail ||
                    session.customer_details?.email ||
                    session.customer_email ||
                    null;

                  const updateData: any = {
                    status: 'Order Received',
                    subscriptionStatus: 'active',
                    stripeSubscriptionId: session.subscription || null,
                    updatedAt: getServerTimestamp(),
                  };

                  if (resolvedCustomerEmail && !orderData.customerEmail) {
                    updateData.customerEmail = resolvedCustomerEmail;
                    updateData.email = resolvedCustomerEmail;
                  }

                  transaction.update(orderRef, updateData);
                });
              } catch (clientFallbackErr) {
                console.warn('Client SDK transaction fallback error:', clientFallbackErr);
              }
            }

            try {
              await sendOrderConfirmationEmails(orderId);
            } catch (eErr) {
              console.error('Webhook subscription order confirmation email error:', eErr);
            }
          }
        }
        break;
      }

      default:
        break;
    }

    return NextResponse.json({ received: true });
  } catch (err: any) {
    console.error('Webhook execution failed:', err);
    return NextResponse.json(
      { error: `Webhook execution failed: ${err.message}` },
      { status: 500 }
    );
  }
}
