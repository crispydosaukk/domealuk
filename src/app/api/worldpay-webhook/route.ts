import { NextRequest, NextResponse } from 'next/server';
import { dbAdmin } from '@/lib/firebase-admin';
import { db } from '@/lib/firebase';
import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { FieldValue as AdminFieldValue } from 'firebase-admin/firestore';
import { sendOrderConfirmationEmails } from '@/lib/emailService';

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    let body: any = {};
    try {
      body = JSON.parse(rawBody);
    } catch {
      // Could be form-urlencoded from classic Worldpay callback
      const params = new URLSearchParams(rawBody);
      body = Object.fromEntries(params.entries());
    }

    // Worldpay event format
    // In Worldpay Access: transactionReference, eventType or eventDetails
    const orderId = body.transactionReference || body.cartId || body.orderCode || body.customOrderId;
    const paymentStatus = body.status || body.eventType || body.transStatus;

    if (!orderId) {
      return NextResponse.json({ received: true, note: 'No transactionReference found' });
    }

    const isSuccess =
      paymentStatus === 'payment.authorized' ||
      paymentStatus === 'payment.captured' ||
      paymentStatus === 'SETTLED' ||
      paymentStatus === 'AUTHORISED' ||
      paymentStatus === 'SUCCESS' ||
      paymentStatus === 'Y';

    if (isSuccess) {
      let orderData: any = null;
      if (dbAdmin) {
        const orderRef = dbAdmin.collection('orders').doc(orderId);
        const snap = await orderRef.get();
        if (snap.exists) {
          orderData = snap.data();
          if (orderData.status === 'Pending Payment') {
            await orderRef.update({
              status: 'Order Received',
              subscriptionStatus: 'active',
              paymentStatus: 'paid',
              paymentMethod: 'worldpay',
              updatedAt: AdminFieldValue.serverTimestamp(),
            });
          }
        }
      } else {
        const orderRef = doc(db, 'orders', orderId);
        const snap = await getDoc(orderRef);
        if (snap.exists()) {
          orderData = snap.data();
          if (orderData.status === 'Pending Payment') {
            await updateDoc(orderRef, {
              status: 'Order Received',
              subscriptionStatus: 'active',
              paymentStatus: 'paid',
              paymentMethod: 'worldpay',
              updatedAt: serverTimestamp(),
            });
          }
        }
      }

      if (orderData && !orderData.confirmationEmailSent) {
        try {
          await sendOrderConfirmationEmails(orderId, orderData);
          if (dbAdmin) {
            await dbAdmin.collection('orders').doc(orderId).update({ confirmationEmailSent: true });
          } else {
            await updateDoc(doc(db, 'orders', orderId), { confirmationEmailSent: true });
          }
        } catch (mErr) {
          console.error('Worldpay webhook email error:', mErr);
        }
      }
    }

    return NextResponse.json({ received: true });
  } catch (err: any) {
    console.error('Worldpay webhook error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
