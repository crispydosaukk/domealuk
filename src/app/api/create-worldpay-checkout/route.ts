import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { dbAdmin } from '@/lib/firebase-admin';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { FieldValue as AdminFieldValue } from 'firebase-admin/firestore';
import { createWorldpayPaymentPage } from '@/lib/worldpay';

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

    if (!orderId || !amount) {
      return NextResponse.json({ error: 'Missing required parameters (orderId, amount)' }, { status: 400 });
    }

    const customerEmail = email || 'customer@domeal.co.uk';

    // 1. Create order in Firestore as 'Pending Payment'
    const orderPayload = {
      userId: userId || 'guest-user',
      customerEmail,
      email: customerEmail,
      items: items || [],
      total: amount,
      subtotal: subtotal || amount,
      walletApplied: walletApplied || 0,
      discountApplied: discountApplied || 0,
      studentDiscountApplied: studentDiscountApplied || 0,
      studentDiscountPercent: studentDiscountPercent || 0,
      address: address || null,
      deliveryDates: deliveryDates || [],
      deliverySlot: deliverySlot || 'Standard Delivery',
      deliverySlotId: deliverySlotId || null,
      notes: notes || '',
      paymentMethod: 'worldpay',
      subscriptionFrequency: frequency || 'Delivery every 1 Week',
      subscriptionStatus: 'pending_payment',
      allergiesInfo: allergiesInfo || '',
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

    // 2. Determine redirect URLs
    const origin = req.headers.get('origin') || 'https://domeal.co.uk';
    const successUrl = `${origin}/checkout-order-confirmation-screen?status=success&order_id=${orderId}`;
    const failureUrl = `${origin}/checkout-order-confirmation-screen?status=failure&order_id=${orderId}`;
    const cancelUrl = `${origin}/checkout-order-confirmation-screen?status=cancel&order_id=${orderId}`;

    // 3. Request Hosted Payment Page from Worldpay
    const { redirectUrl } = await createWorldpayPaymentPage({
      transactionReference: orderId,
      amount: Number(amount),
      currencyCode: 'GBP',
      customerEmail,
      customerName: name,
      description: `DoMeal ${orderId}`,
      isSubscription: true,
      successUrl,
      failureUrl,
      cancelUrl,
    });

    return NextResponse.json({ url: redirectUrl });
  } catch (err: any) {
    console.error('Error creating Worldpay checkout:', err);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
