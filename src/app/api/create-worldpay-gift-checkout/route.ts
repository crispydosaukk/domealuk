import { NextRequest, NextResponse } from 'next/server';
import { createWorldpayPaymentPage } from '@/lib/worldpay';

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

    if (
      !senderEmail ||
      !senderName ||
      !recipientFirstName ||
      !recipientLastName ||
      !recipientEmail ||
      !giftAmount
    ) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    const origin = req.headers.get('origin') || 'https://domeal.co.uk';
    const transactionReference = `GIFT-${Math.floor(10000 + Math.random() * 90000)}`;

    const successUrl = `${origin}/gift?status=success&session_id=${transactionReference}&email=${encodeURIComponent(
      recipientEmail
    )}&amount=${giftAmount}`;
    const failureUrl = `${origin}/gift?status=failure`;
    const cancelUrl = `${origin}/gift?status=cancelled`;

    const { redirectUrl } = await createWorldpayPaymentPage({
      transactionReference,
      amount: Number(giftAmount),
      currencyCode: 'GBP',
      customerEmail: senderEmail,
      customerName: senderName,
      description: `DoMeal Gift Card for ${recipientEmail}`,
      successUrl,
      failureUrl,
      cancelUrl,
    });

    return NextResponse.json({ url: redirectUrl, sessionId: transactionReference });
  } catch (err: any) {
    console.error('Error creating Worldpay gift checkout:', err);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
