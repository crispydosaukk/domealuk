import { NextRequest, NextResponse } from 'next/server';
import { sendCorporateInquiryEmails } from '@/lib/emailService';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const result = await sendCorporateInquiryEmails(body);

    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error }, { status: 500 });
    }

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('❌ Failed sending corporate email:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
