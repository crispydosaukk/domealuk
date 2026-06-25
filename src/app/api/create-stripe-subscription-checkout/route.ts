import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { dbAdmin } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';

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
      items
    } = await req.json();

    if (!email || !amount || !frequency || !userId || !orderId) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    // 1. Initialize Stripe
    let secretKey = process.env.STRIPE_SECRET_KEY || '';
    if (!secretKey && dbAdmin) {
      const globalSnap = await dbAdmin.collection('settings').doc('global').get();
      if (globalSnap.exists) {
        secretKey = globalSnap.data().stripeSecretKey || '';
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
    if (dbAdmin && userId && userId !== 'guest-user') {
      const userSnap = await dbAdmin.collection('users').doc(userId).get();
      if (userSnap.exists) {
        stripeCustomerId = userSnap.data().stripeCustomerId || '';
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

      if (dbAdmin && userId && userId !== 'guest-user') {
        await dbAdmin.collection('users').doc(userId).update({ stripeCustomerId });
      }
    }

    // 3. Create a Price object for Stripe Checkout
    const unitAmount = Math.round(amount * 100);
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

    // 4. Create Order document in Firestore with 'Pending Payment'
    if (dbAdmin) {
      await dbAdmin.collection('orders').doc(orderId).set({
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
        createdAt: FieldValue.serverTimestamp(),
        status: 'Pending Payment'
      });
    }

    // 5. Create Stripe Checkout Session
    const origin = req.headers.get('origin') || 'http://localhost:4028';
    const session = await stripe.checkout.sessions.create({
      customer: stripeCustomerId,
      payment_method_types: ['card'],
      line_items: [{
        price: price.id,
        quantity: 1,
      }],
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
