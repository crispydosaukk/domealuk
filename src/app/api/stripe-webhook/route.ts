import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { db } from '@/lib/firebase';
import { dbAdmin } from '@/lib/firebase-admin';
import { collection, query, where, getDocs, doc, updateDoc, setDoc, getDoc, FieldValue } from 'firebase/firestore';

// Helper function to resolve serverTimestamp or FieldValue.serverTimestamp
const getServerTimestamp = () => {
  if (dbAdmin) {
    return require('firebase-admin').firestore.FieldValue.serverTimestamp();
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

    stripe = new Stripe(secretKey, {
      apiVersion: '2022-11-15',
    });

    if (process.env.STRIPE_WEBHOOK_SECRET && signature) {
      event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET);
    } else {
      event = JSON.parse(body);
    }
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message);
    return NextResponse.json({ error: `Webhook error: ${err.message}` }, { status: 400 });
  }

  const session = event.data.object as any;

  try {
    switch (event.type) {
      case 'invoice.payment_succeeded': {
        const subscriptionId = session.subscription as string;
        if (!subscriptionId) break;

        // Retrieve subscription details
        const subscription = await stripe.subscriptions.retrieve(subscriptionId);

        let latestOrder: any = null;

        // Find the initial/previous order associated with this subscription
        if (dbAdmin) {
          const querySnapshot = await dbAdmin
            .collection('orders')
            .where('stripeSubscriptionId', '==', subscriptionId)
            .get();

          if (!querySnapshot.empty) {
            const ordersList = querySnapshot.docs.map((d: any) => ({ id: d.id, ...d.data() }));
            ordersList.sort((a: any, b: any) => {
              const aTime = a.createdAt?.toDate?.()?.getTime() || 0;
              const bTime = b.createdAt?.toDate?.()?.getTime() || 0;
              return bTime - aTime;
            });
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
              const ordersList = querySnapshot.docs.map(d => ({ id: d.id, ...d.data() }));
              ordersList.sort((a: any, b: any) => (b.createdAt?.toMillis?.() || 0) - (a.createdAt?.toMillis?.() || 0));
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
          const newDeliveryDates = latestOrder.deliveryDates?.map((dStr: string) => {
            const d = new Date(dStr);
            const frequency = latestOrder.subscriptionFrequency || 'Delivery every 1 Week';
            const daysToAdd = frequency.toLowerCase().includes('2 week') ? 14 : 7;
            d.setDate(d.getDate() + daysToAdd);
            return d.toISOString().split('T')[0];
          }) || [];

          const newOrderPayload = {
            userId: latestOrder.userId,
            items: latestOrder.items,
            total: latestOrder.total,
            walletApplied: 0,
            discountApplied: 0,
            address: latestOrder.address,
            deliveryDates: newDeliveryDates,
            deliverySlot: latestOrder.deliverySlot || 'slot-1',
            notes: latestOrder.notes || '',
            paymentMethod: latestOrder.paymentMethod || 'pay-card',
            subscriptionFrequency: latestOrder.subscriptionFrequency || 'Delivery every 1 Week',
            stripeSubscriptionId: subscriptionId,
            subscriptionStatus: 'active',
            allergiesInfo: latestOrder.allergiesInfo || '',
            createdAt: getServerTimestamp(),
            status: 'Order Received'
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

          console.log(`Created subsequent recurring order ${newOrderId} for subscription ${subscriptionId}`);
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
        console.log(`Marked subscription ${subscriptionId} status as past_due because payment failed.`);
        break;
      }

      case 'customer.subscription.deleted': {
        const subscriptionId = session.id as string;
        if (!subscriptionId) break;

        if (dbAdmin) {
          const querySnapshot = await dbAdmin
            .collection('orders')
            .where('stripeSubscriptionId', '==', subscriptionId)
            .get();

          for (const d of querySnapshot.docs) {
            await dbAdmin.collection('orders').doc(d.id).update({
              subscriptionStatus: 'cancelled',
              status: 'Cancelled'
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
                status: 'Cancelled'
              });
            }
          } catch (e) {
            console.error('Client SDK Webhook fallback failed to delete/cancel order:', e);
          }
        }
        console.log(`Subscription ${subscriptionId} deleted. Updated orders to cancelled.`);
        break;
      }

      default:
        break;
    }

    return NextResponse.json({ received: true });
  } catch (err: any) {
    console.error('Webhook execution failed:', err);
    return NextResponse.json({ error: `Webhook execution failed: ${err.message}` }, { status: 500 });
  }
}
