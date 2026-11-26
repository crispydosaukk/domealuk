import type { Metadata } from 'next';
import { dbAdmin } from '@/lib/firebase-admin';
import {
  DEFAULT_SEO_SETTINGS,
  DEFAULT_PAGE_SEO,
  SeoSettings,
} from '@/lib/seo-defaults';
import { LONDON_LOCATIONS, LocationData, LOCATION_ALIASES } from '@/lib/locations-data';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://domeal.co.uk';

let cachedSeo: { settings: SeoSettings; timestamp: number } | null = null;
const CACHE_TTL_MS = 60000; // 1 minute in-memory cache

const fetchWithTimeout = <T>(promise: Promise<T>, ms = 2000): Promise<T> => {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error('Firestore timeout')), ms)
    ),
  ]);
};

/**
 * Fetch latest dynamic SEO settings from Firestore with fallback to defaults
 */
export async function getDynamicSeoSettings(): Promise<SeoSettings> {
  const now = Date.now();
  if (cachedSeo && now - cachedSeo.timestamp < CACHE_TTL_MS) {
    return cachedSeo.settings;
  }

  try {
    if (dbAdmin) {
      const snap: any = await fetchWithTimeout(
        dbAdmin.collection('settings').doc('seo').get(),
        2000
      );
      if (snap?.exists) {
        const settings = { ...DEFAULT_SEO_SETTINGS, ...snap.data() } as SeoSettings;
        cachedSeo = { settings, timestamp: now };
        return settings;
      }
    }
  } catch (err) {
    console.warn('Note reading dynamic SEO settings:', err);
  }

  return DEFAULT_SEO_SETTINGS;
}

/**
 * Generate Next.js Metadata dynamically for any route
 */
export async function getDynamicPageSeo(path: string): Promise<Metadata> {
  const settings = await getDynamicSeoSettings();
  const allPages = settings.pages || DEFAULT_PAGE_SEO;

  // Find matching page item or fallback to root '/'
  const page =
    allPages.find((p) => p.path === path) ||
    allPages.find((p) => p.path === '/') ||
    DEFAULT_PAGE_SEO[0];

  const pageTitle = page.title || `${page.name} | DoMeal London`;
  const pageDescription = page.description || settings.defaultDescription;
  const canonicalUrl = `${BASE_URL}${path === '/' ? '' : path}`;

  const rawOgImage = page.ogImage || settings.defaultOgImage || '/banner.png';
  const ogImageUrl = rawOgImage.startsWith('http')
    ? rawOgImage
    : `${BASE_URL}${rawOgImage.startsWith('/') ? rawOgImage : `/${rawOgImage}`}`;

  const keywordsArray = page.keywords
    ? page.keywords.split(',').map((k) => k.trim()).filter(Boolean)
    : settings.globalKeywords;

  return {
    metadataBase: new URL(BASE_URL),
    title: pageTitle,
    description: pageDescription,
    keywords: keywordsArray,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: pageTitle,
      description: pageDescription,
      url: canonicalUrl,
      siteName: settings.organizationName || 'DoMeal',
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: `${pageTitle} — DoMeal`,
        },
      ],
      locale: 'en_GB',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: pageTitle,
      description: pageDescription,
      images: [ogImageUrl],
    },
    robots: {
      index: !page.noIndex,
      follow: !page.noIndex,
      googleBot: {
        index: !page.noIndex,
        follow: !page.noIndex,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
  };
}

/**
 * Fetch dynamic locations merged from Firestore settings/locations_cms and hardcoded defaults
 */
let cachedLocations: { data: LocationData[]; timestamp: number } | null = null;

export async function getDynamicLocations(): Promise<LocationData[]> {
  const now = Date.now();
  if (cachedLocations && now - cachedLocations.timestamp < CACHE_TTL_MS) {
    return cachedLocations.data;
  }

  try {
    if (dbAdmin) {
      const snap: any = await fetchWithTimeout(
        dbAdmin.collection('settings').doc('locations_cms').get(),
        2000
      );
      if (snap?.exists && snap.data()?.locations) {
        const savedList = snap.data()?.locations as any[];
        const merged = savedList.map((savedLoc: any) => {
          const fallback = LONDON_LOCATIONS.find((d) => d.slug === savedLoc.slug) || LONDON_LOCATIONS[0];
          return {
            ...fallback,
            ...savedLoc,
          } as LocationData;
        });

        cachedLocations = { data: merged, timestamp: now };
        return merged;
      }
    }
  } catch (err) {
    console.warn('Note reading dynamic locations:', err);
  }

  return LONDON_LOCATIONS;
}

export async function getDynamicLocationBySlug(slug: string): Promise<LocationData | undefined> {
  const locations = await getDynamicLocations();
  const normalized = slug.trim().toLowerCase();
  const direct = locations.find((l) => l.slug.toLowerCase() === normalized);
  if (direct) return direct;
  const targetSlug = LOCATION_ALIASES[normalized];
  if (targetSlug) {
    return locations.find((l) => l.slug.toLowerCase() === targetSlug);
  }
  return undefined;
}
