import React from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getAllLocations, getLocationBySlug } from '@/lib/locations-data';
import UserNavbar from '@/components/UserNavbar';
import LocationPromoBar from '../components/LocationPromoBar';
import LocationEditorialHero from '../components/LocationEditorialHero';
import LocationStorySection from '../components/LocationStorySection';
import LocationHowItWorks from '../components/LocationHowItWorks';
import LocationDabbaAnatomy from '../components/LocationDabbaAnatomy';
import LocationSignatureDishes from '../components/LocationSignatureDishes';
import LocationEcoComparison from '../components/LocationEcoComparison';
import LocationBoroughExplorer from '../components/LocationBoroughExplorer';
import LocationEditorialReviews from '../components/LocationEditorialReviews';
import LocationFAQs from '../components/LocationFAQs';
import LocationFinalCTA from '../components/LocationFinalCTA';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://domeal.co.uk';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const locations = getAllLocations();
  return locations.map((loc) => ({
    slug: loc.slug,
  }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const location = getLocationBySlug(slug);

  if (!location || !location.active) {
    return {
      title: 'Location Not Found | DoMeal London',
      description: 'The requested London delivery location could not be found.',
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  const canonicalUrl = `${BASE_URL}/locations/${location.slug}`;
  const rawOgImage = location.ogImage.startsWith('http')
    ? location.ogImage
    : `${BASE_URL}${location.ogImage.startsWith('/') ? location.ogImage : `/${location.ogImage}`}`;
  const ogImageUrl = encodeURI(rawOgImage);

  return {
    title: location.metaTitle,
    description: location.metaDescription,
    keywords: location.keywords,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: location.metaTitle,
      description: location.metaDescription,
      url: canonicalUrl,
      siteName: 'DoMeal London',
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: `${location.name} Indian Tiffin Delivery — DoMeal`,
        },
      ],
      locale: 'en_GB',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: location.metaTitle,
      description: location.metaDescription,
      images: [ogImageUrl],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
  };
}

export default async function LocationPage({ params }: PageProps) {
  const { slug } = await params;
  const location = getLocationBySlug(slug);

  if (!location || !location.active) {
    notFound();
  }

  const canonicalUrl = `${BASE_URL}/locations/${location.slug}`;

  // Structured Data (JSON-LD): BreadcrumbList, FoodEstablishment, FAQPage
  const jsonLdGraph = {
    '@context': 'https://schema.org',
    '@graph': [
      // 1. Breadcrumb Schema
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: 'Home',
            item: BASE_URL,
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: 'Locations',
            item: `${BASE_URL}/#locations`,
          },
          {
            '@type': 'ListItem',
            position: 3,
            name: location.name,
            item: canonicalUrl,
          },
        ],
      },
      // 2. FoodEstablishment / Delivery Service Schema
      {
        '@type': ['FoodEstablishment', 'Restaurant'],
        '@id': `${canonicalUrl}/#restaurant`,
        name: `DoMeal — Indian Tiffin Delivery in ${location.name}`,
        url: canonicalUrl,
        image: encodeURI(`${BASE_URL}${location.ogImage.startsWith('/') ? location.ogImage : `/${location.ogImage}`}`),
        description: location.metaDescription,
        servesCuisine: ['Indian', 'Vegetarian', 'South Indian', 'North Indian', 'Home Style Indian Food'],
        priceRange: '££',
        currenciesAccepted: 'GBP',
        paymentAccepted: 'Credit Card, Debit Card, Apple Pay, Google Pay, Worldpay, Stripe',
        areaServed: location.neighbourhoods.map((n) => ({
          '@type': 'AdministrativeArea',
          name: `${n.name}, London (${n.postcode})`,
        })),
        hasMenu: `${BASE_URL}/menu`,
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
          deliveryMethod: ['http://purl.org/goodrelations/v1#DeliveryModeDirectDownload'],
        },
      },
      // 3. FAQPage Schema
      {
        '@type': 'FAQPage',
        mainEntity: location.faqs.map((faq) => ({
          '@type': 'Question',
          name: faq.question,
          acceptedAnswer: {
            '@type': 'Answer',
            text: faq.answer,
          },
        })),
      },
    ],
  };

  return (
    <div className="min-h-screen bg-[#FBF8F3]">
      {/* Inject High-Density Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdGraph) }}
      />

      <UserNavbar />

      <main className="min-h-screen bg-[#FBF8F3]">
        {/* 1. Promotional Announcement Bar */}
        <LocationPromoBar locationName={location.name} />

        {/* 2. Cinematic Location Hero with Integrated Postcode Checker */}
        <LocationEditorialHero location={location} />

        {/* 3. Food and Brand Philosophy Narrative */}
        <LocationStorySection location={location} />

        {/* 4. Illustrated How DoMeal Works (3 Circular Steps) */}
        <LocationHowItWorks locationName={location.name} />

        {/* 5. Anatomy of a Feast ("What's in your Dabba?") */}
        <LocationDabbaAnatomy locationName={location.name} />

        {/* 6. Signature Feasts on This Week's Menu (Single row of 4 real cards) */}
        <LocationSignatureDishes location={location} />

        {/* 7. Takeaway vs. DoMeal Sustainability Comparison */}
        <LocationEcoComparison locationName={location.name} />

        {/* 8. Local Delivery Areas & Postcodes Explorer */}
        <LocationBoroughExplorer location={location} />

        {/* 9. Curated Editorial Customer Testimonials */}
        <LocationEditorialReviews locationName={location.name} />

        {/* 10. Frequently Asked Questions */}
        <LocationFAQs locationName={location.name} faqs={location.faqs} />

        {/* 11. Premium Full-Width Final Ordering CTA */}
        <LocationFinalCTA locationName={location.name} />
      </main>
    </div>
  );
}
