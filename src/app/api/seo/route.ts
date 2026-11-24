import { NextRequest, NextResponse } from 'next/server';
import { dbAdmin } from '@/lib/firebase-admin';
import { DEFAULT_SEO_SETTINGS, SeoSettings } from '@/lib/seo-defaults';

export async function GET(req: NextRequest) {
  try {
    let settings: SeoSettings = DEFAULT_SEO_SETTINGS;

    if (dbAdmin) {
      const snap = await dbAdmin.collection('settings').doc('seo').get();
      if (snap.exists) {
        settings = { ...DEFAULT_SEO_SETTINGS, ...snap.data() };
      } else {
        // Fallback: check settings/global.seo
        const globalSnap = await dbAdmin.collection('settings').doc('global').get();
        if (globalSnap.exists && globalSnap.data()?.seo) {
          settings = { ...DEFAULT_SEO_SETTINGS, ...globalSnap.data()?.seo };
        }
      }
    } else {
      const { getDoc, doc } = await import('firebase/firestore');
      const { db } = await import('@/lib/firebase');
      const snap = await getDoc(doc(db, 'settings', 'seo'));
      if (snap.exists()) {
        settings = { ...DEFAULT_SEO_SETTINGS, ...(snap.data() as any) };
      }
    }

    return NextResponse.json({ success: true, settings });
  } catch (err: any) {
    console.error('Error fetching SEO settings:', err);
    return NextResponse.json(
      { success: false, error: err.message, settings: DEFAULT_SEO_SETTINGS },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const newSettings: SeoSettings = {
      ...DEFAULT_SEO_SETTINGS,
      ...body,
    };

    if (dbAdmin) {
      // Save directly to settings/seo
      await dbAdmin.collection('settings').doc('seo').set(newSettings, { merge: true });
      // Also mirror to settings/global for backwards compatibility
      await dbAdmin.collection('settings').doc('global').set({ seo: newSettings }, { merge: true });
    } else {
      const { setDoc, doc } = await import('firebase/firestore');
      const { db } = await import('@/lib/firebase');
      await setDoc(doc(db, 'settings', 'seo'), newSettings, { merge: true });
      await setDoc(doc(db, 'settings', 'global'), { seo: newSettings }, { merge: true });
    }

    return NextResponse.json({ success: true, message: 'SEO settings saved successfully', settings: newSettings });
  } catch (err: any) {
    console.error('Error saving SEO settings:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
