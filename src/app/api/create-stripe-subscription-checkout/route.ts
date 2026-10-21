import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { db } from '@/lib/firebase';
import { dbAdmin } from '@/lib/firebase-admin';
import { FieldValue as AdminFieldValue } from 'firebase-admin/firestore';
import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';

export async function POST(req: NextRequest) {
  try {
    const {
      email,
      name,
      phone,
      amount,
      frequency,
      userId,
      orderId,
      address,
      deliveryDates,
      deliverySlot,
      deliverySlotId,
      notes,
      subtotal,
      deliveryFee,
      walletApplied,
      discountApplied,
      studentDiscountApplied,
      studentDiscountPercent,
      allergiesInfo,
      items,
      dabbaFeeApplied,
    } = await req.json();

    if (!email || !amount || !frequency || !userId || !orderId) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
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

    // 2. Get or Create Stripe Customer
    let stripeCustomerId = '';
    if (userId && userId !== 'guest-user') {
      if (dbAdmin) {
        const userSnap = await dbAdmin.collection('users').doc(userId).get();
        if (userSnap.exists) {
          stripeCustomerId = userSnap.data().stripeCustomerId || '';
        }
      } else {
        try {
          const userSnap = await getDoc(doc(db, 'users', userId));
          if (userSnap.exists()) {
            stripeCustomerId = userSnap.data().stripeCustomerId || '';
          }
        } catch (e) {
          console.warn('Failed to read user doc using client SDK fallback:', e);
        }
      }
    }

    // Verify customer exists in this Stripe account/environment
    if (stripeCustomerId) {
      try {
        const customerObj = await stripe.customers.retrieve(stripeCustomerId);
        if ('deleted' in customerObj && customerObj.deleted) {
          stripeCustomerId = '';
        }
      } catch (e) {
        console.warn(`Customer ${stripeCustomerId} not found in Stripe:`, e);
        stripeCustomerId = '';
      }
    }

    if (!stripeCustomerId) {
      const existingCustomers = await stripe.customers.list({ email, limit: 1 });
      if (existingCustomers.data.length > 0) {
        stripeCustomerId = existingCustomers.data[0].id;
      } else {
        const customer = await stripe.customers.create({
          email,
          name: name || undefined,
          phone: phone || undefined,
          metadata: { userId },
        });
        stripeCustomerId = customer.id;
      }

      if (userId && userId !== 'guest-user') {
        if (dbAdmin) {
          await dbAdmin.collection('users').doc(userId).update({ stripeCustomerId });
        } else {
          try {
            await updateDoc(doc(db, 'users', userId), { stripeCustomerId });
          } catch (e) {
            console.warn('Failed to update stripeCustomerId using client SDK fallback:', e);
          }
        }
      }
    }

    // 3. Create a Price object for Stripe Checkout
    let recurringAmount = amount;
    if (dabbaFeeApplied) {
      recurringAmount = Math.max(0, amount - 12.0);
    }
    const unitAmount = Math.round(recurringAmount * 100);
    const interval = 'week';
    const interval_count = frequency.toLowerCase().includes('2 week') ? 2 : 1;

    const price = await stripe.prices.create({
      product_data: {
        name: `DoMeal Subscription - ${frequency}`,
      },
      unit_amount: unitAmount,
      currency: 'gbp',
      recurring: {
        interval,
        interval_count,
      },
    });

    const lineItems: any[] = [
      {
        price: price.id,
        quantity: 1,
      },
    ];

    if (dabbaFeeApplied) {
      const dabbaPrice = await stripe.prices.create({
        product_data: {
          name: 'Reusable Dabba Deposit Fee',
        },
        unit_amount: 1200, // £12.00
        currency: 'gbp',
      });
      lineItems.push({
        price: dabbaPrice.id,
        quantity: 1,
      });
    }

    // 4. Calculate Saturday midnight cutoff billing anchor
    // First delivery week is charged immediately at checkout.
    // The next debit will occur on the Saturday midnight (start of Saturday) preceding the second cycle.
    let saturdayAnchor: number | undefined;
    try {
      const isBiweekly = frequency?.toLowerCase().includes('2 week');
      const daysToAdd = isBiweekly ? 14 : 7;

      if (deliveryDates && Array.isArray(deliveryDates) && deliveryDates.length > 0) {
        const sortedDates = [...deliveryDates].sort();
        const firstDelivery = new Date(sortedDates[0]);

        if (!isNaN(firstDelivery.getTime())) {
          const nextCycleStart = new Date(firstDelivery);
          nextCycleStart.setDate(nextCycleStart.getDate() + daysToAdd);

          // Find preceding Saturday 00:00:00 UTC
          // getDay(): 0 = Sun, 1 = Mon, ..., 6 = Sat
          const day = nextCycleStart.getDay();
          const daysBackToSaturday = day === 6 ? 7 : day + 1;

          const satDate = new Date(nextCycleStart);
          satDate.setDate(satDate.getDate() - daysBackToSaturday);
          satDate.setUTCHours(0, 0, 0, 0);

          const now = new Date();
          // Ensure anchor is at least 48 hours in future
          if (satDate.getTime() > now.getTime() + 48 * 3600 * 1000) {
            saturdayAnchor = Math.floor(satDate.getTime() / 1000);
          }
        }
      }

      if (!saturdayAnchor) {
        // Fallback: nearest Saturday at least 5 days away
        const fallback = new Date();
        fallback.setDate(fallback.getDate() + (isBiweekly ? 11 : 5));
        while (fallback.getDay() !== 6) {
          fallback.setDate(fallback.getDate() + 1);
        }
        fallback.setUTCHours(0, 0, 0, 0);
        saturdayAnchor = Math.floor(fallback.getTime() / 1000);
      }
    } catch (calcErr) {
      console.warn('Error calculating Saturday anchor:', calcErr);
    }

    // 5. Create Order document in Firestore with 'Pending Payment'
    const orderPayload = {
      userId,
      customerEmail: email,
      email: email,
      items: items || [],
      total: amount,
      subtotal,
      walletApplied,
      discountApplied,
      studentDiscountApplied,
      studentDiscountPercent,
      address,
      deliveryDates,
      deliverySlot,
      deliverySlotId: deliverySlotId || null,
      notes: notes || '',
      paymentMethod: 'pay-online',
      subscriptionFrequency: frequency,
      stripeSubscriptionId: null,
      subscriptionStatus: 'pending_payment',
      allergiesInfo,
      createdAt: dbAdmin ? AdminFieldValue.serverTimestamp() : serverTimestamp(),
      status: 'Pending Payment',
      dabbaFeeApplied: dabbaFeeApplied || false,
      dabbaFee: dabbaFeeApplied ? 12.0 : 0,
      deliveryFee: deliveryFee !== undefined ? deliveryFee : 5.0,
      confirmationEmailSent: false,
    };

    if (dbAdmin) {
      await dbAdmin.collection('orders').doc(orderId).set(orderPayload);
    } else {
      await setDoc(doc(db, 'orders', orderId), orderPayload);
    }

    // 6. Create Stripe Checkout Session
    const origin = req.headers.get('origin') || 'http://localhost:4028';
    const sessionPayload: Stripe.Checkout.SessionCreateParams = {
      customer: stripeCustomerId,
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'subscription',
      subscription_data: {
        ...(saturdayAnchor ? { billing_cycle_anchor: saturdayAnchor } : {}),
        proration_behavior: 'none',
        metadata: {
          type: 'subscription_order',
          userId,
          orderId,
          customerEmail: email,
        },
      },
      success_url: `${origin}/checkout-order-confirmation-screen?status=success&session_id={CHECKOUT_SESSION_ID}&order_id=${orderId}`,
      cancel_url: `${origin}/checkout-order-confirmation-screen?status=cancel&order_id=${orderId}`,
      metadata: {
        type: 'subscription_order',
        userId,
        orderId,
        customerEmail: email,
      },
    };

    const session = await stripe.checkout.sessions.create(sessionPayload);

    return NextResponse.json({ url: session.url });
  } catch (err: any) {
    console.error('Error creating subscription checkout:', err);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
