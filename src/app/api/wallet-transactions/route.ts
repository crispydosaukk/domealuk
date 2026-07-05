import { NextRequest, NextResponse } from 'next/server';
import { dbAdmin } from '@/lib/firebase-admin';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const userId = body.userId;

    if (!userId) {
      return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
    }

    if (!dbAdmin) {
      return NextResponse.json({ error: 'Firestore admin is not initialized' }, { status: 500 });
    }

    const snap = await dbAdmin
      .collection('wallet_transactions')
      .where('userId', '==', userId)
      .get();

    const transactions = snap.docs.map((doc: any) => {
      const data = doc.data();
      return {
        id: doc.id,
        amount: data.amount,
        type: data.type,
        status: data.status,
        description: data.description,
        createdAt: data.createdAt
          ? {
              seconds: data.createdAt.seconds,
              nanoseconds: data.createdAt.nanoseconds,
            }
          : null,
      };
    });

    // Sort descending by date
    transactions.sort((a: any, b: any) => {
      const aTime = a.createdAt ? a.createdAt.seconds * 1000 : 0;
      const bTime = b.createdAt ? b.createdAt.seconds * 1000 : 0;
      return bTime - aTime;
    });

    return NextResponse.json({ success: true, transactions });
  } catch (err: any) {
    console.error('Error fetching wallet transactions:', err);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
