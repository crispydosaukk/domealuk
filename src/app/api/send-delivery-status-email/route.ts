import { NextRequest, NextResponse } from 'next/server';
import { sendDeliveryStatusEmail } from '@/lib/emailService';

export async function POST(req: NextRequest) {
  try {
    const { orderId, status, orderData } = await req.json();

    if (!orderId || !status) {
      return NextResponse.json({ error: 'Missing orderId or status' }, { status: 400 });
    }

    const result = await sendDeliveryStatusEmail(orderId, status, orderData);
    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Failed to send delivery status email:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
