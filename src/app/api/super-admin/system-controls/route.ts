import { NextResponse } from 'next/server';
import { dbAdmin } from '@/lib/firebase-admin';

export async function GET() {
  try {
    if (dbAdmin) {
      const snap = await dbAdmin.collection('settings').doc('global').get();
      if (snap.exists) {
        return NextResponse.json({ success: true, config: snap.data() });
      }
    }
    return NextResponse.json({ success: true, config: null });
  } catch (error: any) {
    console.error('Error fetching global settings in system-controls:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch settings' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { config, updatedBy } = await req.json();

    if (!config || typeof config !== 'object') {
      return NextResponse.json({ error: 'config object is required' }, { status: 400 });
    }

    if (dbAdmin) {
      const settingsDocRef = dbAdmin.collection('settings').doc('global');
      await settingsDocRef.set(
        {
          ...config,
          updatedAt: new Date(),
          lastUpdatedBy: updatedBy || 'Super Admin',
        },
        { merge: true }
      );
      return NextResponse.json({ success: true, message: 'System controls saved to Firestore' });
    }

    return NextResponse.json({ success: true, message: 'Admin SDK not initialized, fallback to client' });
  } catch (error: any) {
    console.error('Error in /api/super-admin/system-controls:', error);
    return NextResponse.json({ error: error.message || 'Failed to save system controls' }, { status: 500 });
  }
}
