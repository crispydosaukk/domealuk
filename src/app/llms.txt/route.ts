import { NextResponse } from 'next/server';
import { dbAdmin } from '@/lib/firebase-admin';
import { DEFAULT_SEO_SETTINGS } from '@/lib/seo-defaults';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    let content = DEFAULT_SEO_SETTINGS.customLlmsTxt;

    if (dbAdmin) {
      const snap = await dbAdmin.collection('settings').doc('seo').get();
      if (snap.exists && snap.data()?.customLlmsTxt) {
        content = snap.data()?.customLlmsTxt;
      }
    }

    return new NextResponse(content, {
      status: 200,
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400',
      },
    });
  } catch (err: any) {
    return new NextResponse(DEFAULT_SEO_SETTINGS.customLlmsTxt, {
      status: 200,
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'public, max-age=3600',
      },
    });
  }
}
