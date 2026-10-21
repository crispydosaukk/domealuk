import { NextRequest, NextResponse } from 'next/server';
import { dbAdmin } from '@/lib/firebase-admin';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { sendDeliveryMorningEmail } from '@/lib/emailService';

/**
 * Helper to get today's date string in UK timezone (YYYY-MM-DD)
 */
function getUKTodayDateString(): string {
  const now = new Date();
  const ukDateStr = now.toLocaleDateString('en-GB', {
    timeZone: 'Europe/London',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  // ukDateStr is DD/MM/YYYY
  const [day, month, year] = ukDateStr.split('/');
  return `${year}-${month}-${day}`;
}

async function handleMorningDeliveries(targetDate?: string) {
  const deliveryDate = targetDate || getUKTodayDateString();
  console.log(`[delivery-morning-email] Running morning delivery notifications for date: ${deliveryDate}`);

  let eligibleOrders: any[] = [];

  const EXCLUDED_STATUSES = ['Cancelled', 'Delivered', 'Refunded'];

  if (dbAdmin) {
    try {
      // Query orders where deliveryDates array contains deliveryDate
      const snap = await dbAdmin
        .collection('orders')
        .where('deliveryDates', 'array-contains', deliveryDate)
        .get();

      eligibleOrders = snap.docs
        .map((d: any) => ({ id: d.id, ...d.data() }))
        .filter((o: any) => !EXCLUDED_STATUSES.includes(o.status || ''));
    } catch (err) {
      console.error('[delivery-morning-email] Error querying orders via dbAdmin:', err);
    }
  } else {
    try {
      const q = query(
        collection(db, 'orders'),
        where('deliveryDates', 'array-contains', deliveryDate)
      );
      const snap = await getDocs(q);
      eligibleOrders = snap.docs
        .map((d) => ({ id: d.id, ...d.data() }))
        .filter((o: any) => !EXCLUDED_STATUSES.includes(o.status || ''));
    } catch (err) {
      console.error('[delivery-morning-email] Error querying orders via client SDK:', err);
    }
  }

  const results: any[] = [];
  let sentCount = 0;
  let alreadySentCount = 0;
  let failedCount = 0;

  for (const order of eligibleOrders) {
    const sentDates = Array.isArray(order.morningEmailSentForDates)
      ? order.morningEmailSentForDates
      : [];

    if (sentDates.includes(deliveryDate)) {
      alreadySentCount++;
      results.push({ orderId: order.id, status: 'already_sent' });
      continue;
    }

    try {
      const res = await sendDeliveryMorningEmail(order.id, deliveryDate, order);
      if (res.success && res.emailSentToUser) {
        sentCount++;
        results.push({ orderId: order.id, status: 'sent', email: res.customerEmail });
      } else {
        failedCount++;
        results.push({ orderId: order.id, status: 'failed', error: res.error || 'Failed sending' });
      }
    } catch (e: any) {
      failedCount++;
      results.push({ orderId: order.id, status: 'error', error: e.message });
    }
  }

  return {
    deliveryDate,
    totalEligible: eligibleOrders.length,
    sentCount,
    alreadySentCount,
    failedCount,
    results,
  };
}

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const dateParam = url.searchParams.get('date') || undefined;

    const data = await handleMorningDeliveries(dateParam);
    return NextResponse.json({ success: true, ...data });
  } catch (error: any) {
    console.error('[delivery-morning-email] GET error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    let body: any = {};
    try {
      body = await req.json();
    } catch {}

    const targetDate = body?.date || undefined;
    const data = await handleMorningDeliveries(targetDate);
    return NextResponse.json({ success: true, ...data });
  } catch (error: any) {
    console.error('[delivery-morning-email] POST error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
