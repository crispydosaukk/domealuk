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
      notes,
      subtotal,
      walletApplied,
      discountApplied,
      studentDiscountApplied,
      studentDiscountPercent,
      allergiesInfo,
      items,
      dabbaFeeApplied
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
      recurringAmount = Math.max(0, amount - 12.00);
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

    const lineItems: any[] = [{
      price: price.id,
      quantity: 1,
    }];

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

    // 4. Create Order document in Firestore with 'Pending Payment'
    const orderPayload = {
      userId,
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
      notes: notes || '',
      paymentMethod: 'pay-online',
      subscriptionFrequency: frequency,
      stripeSubscriptionId: null,
      subscriptionStatus: 'pending_payment',
      allergiesInfo,
      createdAt: dbAdmin ? AdminFieldValue.serverTimestamp() : serverTimestamp(),
      status: 'Pending Payment',
      dabbaFeeApplied: dabbaFeeApplied || false,
      dabbaFee: dabbaFeeApplied ? 12.00 : 0
    };

    if (dbAdmin) {
      await dbAdmin.collection('orders').doc(orderId).set(orderPayload);
    } else {
      await setDoc(doc(db, 'orders', orderId), orderPayload);
    }

    // 5. Create Stripe Checkout Session
    const origin = req.headers.get('origin') || 'http://localhost:4028';
    const session = await stripe.checkout.sessions.create({
      customer: stripeCustomerId,
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'subscription',
      success_url: `${origin}/checkout-order-confirmation-screen?status=success&session_id={CHECKOUT_SESSION_ID}&order_id=${orderId}`,
      cancel_url: `${origin}/checkout-order-confirmation-screen?status=cancel&order_id=${orderId}`,
      metadata: {
        type: 'subscription_order',
        userId,
        orderId,
      }
    });

    return NextResponse.json({ url: session.url });
  } catch (err: any) {
    console.error('Error creating subscription checkout:', err);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
