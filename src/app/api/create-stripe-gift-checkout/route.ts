import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { db } from '@/lib/firebase';
import { dbAdmin } from '@/lib/firebase-admin';
import { doc, getDoc } from 'firebase/firestore';

export async function POST(req: NextRequest) {
  try {
    const {
      senderEmail,
      senderName,
      recipientFirstName,
      recipientLastName,
      recipientEmail,
      message,
      sendOn,
      giftAmount,
      userId,
    } = await req.json();

    if (!senderEmail || !senderName || !recipientFirstName || !recipientLastName || !recipientEmail || !giftAmount) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

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

    const stripe = new Stripe(secretKey, {
      apiVersion: '2022-11-15' as any,
    });

    const origin = req.headers.get('origin') || 'http://localhost:4028';

    // Create a Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      customer_email: senderEmail,
      line_items: [
        {
          price_data: {
            currency: 'gbp',
            product_data: {
              name: 'DoMeal Delivery Gift Card',
              description: `Gift from ${senderName} to ${recipientEmail}`,
            },
            unit_amount: Math.round(Number(giftAmount) * 100),
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${origin}/gift?status=success&session_id={CHECKOUT_SESSION_ID}&email=${encodeURIComponent(recipientEmail)}&amount=${giftAmount}`,
      cancel_url: `${origin}/gift?status=cancelled`,
      metadata: {
        type: 'gift_card',
        senderName,
        senderEmail,
        recipientFirstName,
        recipientLastName,
        recipientEmail: recipientEmail.toLowerCase(),
        message: message || '',
        sendOn,
        giftAmount: giftAmount.toString(),
        userId: userId || '',
      },
    });

    return NextResponse.json({ sessionId: session.id, url: session.url });
  } catch (err: any) {
    console.error('Error creating Stripe gift checkout:', err);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
