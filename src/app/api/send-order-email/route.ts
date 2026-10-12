import { NextRequest, NextResponse } from 'next/server';
import { sendOrderConfirmationEmails } from '@/lib/emailService';

export async function POST(req: NextRequest) {
  try {
    const { orderId, orderData } = await req.json();

    if (!orderId) {
      return NextResponse.json({ error: 'Missing orderId' }, { status: 400 });
    }

    const result = await sendOrderConfirmationEmails(orderId, orderData);
    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Failed to send order email:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
