import React from 'react';
import { DEFAULT_SEO_SETTINGS } from '@/lib/seo-defaults';

interface JsonLdProps {
  customSchema?: Record<string, any>;
}

export default function JsonLd({ customSchema }: JsonLdProps) {
  const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || DEFAULT_SEO_SETTINGS.siteUrl;

  const defaultGraph = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': `${BASE_URL}/#organization`,
        name: DEFAULT_SEO_SETTINGS.organizationName,
        alternateName: [DEFAULT_SEO_SETTINGS.organizationLegalName, 'Veg Sri Lalitha'],
        url: BASE_URL,
        logo: {
          '@type': 'ImageObject',
          url: `${BASE_URL}/DOMEAL_Logo.png`,
          caption: `${DEFAULT_SEO_SETTINGS.organizationName} Logo`,
        },
        image: `${BASE_URL}${DEFAULT_SEO_SETTINGS.defaultOgImage}`,
        description: DEFAULT_SEO_SETTINGS.defaultDescription,
        email: DEFAULT_SEO_SETTINGS.supportEmail,
        contactPoint: {
          '@type': 'ContactPoint',
          contactType: 'customer service',
          email: DEFAULT_SEO_SETTINGS.supportEmail,
          telephone: DEFAULT_SEO_SETTINGS.supportPhone,
          areaServed: 'GB',
          availableLanguage: ['en', 'hi', 'te'],
        },
        address: {
          '@type': 'PostalAddress',
          addressLocality: DEFAULT_SEO_SETTINGS.addressCity,
          addressRegion: DEFAULT_SEO_SETTINGS.addressRegion,
          addressCountry: DEFAULT_SEO_SETTINGS.addressCountry,
        },
        sameAs: Object.values(DEFAULT_SEO_SETTINGS.socialLinks).filter(Boolean),
      },
      {
        '@type': ['FoodEstablishment', 'Restaurant'],
        '@id': `${BASE_URL}/#restaurant`,
        name: `${DEFAULT_SEO_SETTINGS.organizationName} — Indian Tiffin & Meal Delivery London`,
        url: BASE_URL,
        image: `${BASE_URL}${DEFAULT_SEO_SETTINGS.defaultOgImage}`,
        servesCuisine: DEFAULT_SEO_SETTINGS.cuisineTypes,
        priceRange: DEFAULT_SEO_SETTINGS.priceRange,
        currenciesAccepted: DEFAULT_SEO_SETTINGS.currency,
        paymentAccepted: 'Credit Card, Debit Card, Apple Pay, Google Pay, Worldpay, Stripe',
        address: {
          '@type': 'PostalAddress',
          addressLocality: DEFAULT_SEO_SETTINGS.addressCity,
          addressRegion: DEFAULT_SEO_SETTINGS.addressRegion,
          addressCountry: DEFAULT_SEO_SETTINGS.addressCountry,
        },
        geo: {
          '@type': 'GeoCoordinates',
          latitude: '51.5074',
          longitude: '-0.1278',
        },
        areaServed: DEFAULT_SEO_SETTINGS.servicedAreas.map((area) => ({
          '@type': 'AdministrativeArea',
          name: area,
        })),
        hasMenu: `${BASE_URL}/menu`,
        acceptsReservations: 'false',
        potentialAction: {
          '@type': 'OrderAction',
          target: {
            '@type': 'EntryPoint',
            urlTemplate: `${BASE_URL}/menu`,
            inLanguage: 'en-GB',
            actionPlatform: [
              'http://schema.org/DesktopWebPlatform',
              'http://schema.org/MobileWebPlatform',
            ],
          },
          deliveryMethod: [
            'http://purl.org/goodrelations/v1#DeliveryModeDirectDownload',
          ],
        },
      },
      {
        '@type': 'WebSite',
        '@id': `${BASE_URL}/#website`,
        url: BASE_URL,
        name: DEFAULT_SEO_SETTINGS.organizationName,
        description: DEFAULT_SEO_SETTINGS.defaultDescription,
        publisher: {
          '@id': `${BASE_URL}/#organization`,
        },
        inLanguage: 'en-GB',
      },
    ],
  };

  const schemaToRender = customSchema || defaultGraph;

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaToRender) }}
    />
  );
}
