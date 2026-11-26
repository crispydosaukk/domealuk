import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { getAllLocations } from '@/lib/locations-data';
import { getDynamicLocations, getDynamicPageSeo } from '@/lib/dynamic-seo';
import UserNavbar from '@/components/UserNavbar';
import UserFooter from '@/components/UserFooter';
import LocationPromoBar from './components/LocationPromoBar';
import LocationHowItWorks from './components/LocationHowItWorks';
import LocationDabbaAnatomy from './components/LocationDabbaAnatomy';
import LocationSignatureDishes from './components/LocationSignatureDishes';
import LocationEcoComparison from './components/LocationEcoComparison';
import LocationBoroughExplorer from './components/LocationBoroughExplorer';
import LocationEditorialReviews from './components/LocationEditorialReviews';
import LocationFAQs from './components/LocationFAQs';
import LocationFinalCTA from './components/LocationFinalCTA';
import PostcodeSearch from '@/app/components/PostcodeSearch';
import {
  MapPin,
  ArrowRight,
  Navigation,
  Clock,
  Sparkles,
  ShieldCheck,
  RotateCcw,
  UtensilsCrossed,
  CheckCircle2,
  Bike,
  Building,
} from 'lucide-react';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://domeal.co.uk';

export async function generateMetadata(): Promise<Metadata> {
  return getDynamicPageSeo('/locations');
}

const MASTER_FAQS = [
  {
    question: 'Which London zones does DoMeal deliver to?',
    answer:
      'We deliver across London Zones 1, 2, and 3, covering West London (W postcodes), East London (E, IG, RM postcodes), North London (N, NW postcodes), South London (SW, SE postcodes), and Central London (EC, WC postcodes). Enter your postcode in our checker to confirm your street.',
  },
  {
    question: 'What days of the week do you deliver?',
    answer:
      'Our chilled transport fleet delivers every Monday and Thursday. Meals are freshly cooked in the morning, blast-chilled, and insulated so they stay bakery-fresh in your refrigerator for up to 48 hours.',
  },
  {
    question: 'How do the reusable stainless steel tiffins work?',
    answer:
      'Your first order includes a one-off £12 refundable dabba deposit. On every subsequent delivery, our courier collects your rinsed empty container and leaves a fresh feast. If you ever cancel, return your dabba and your £12 deposit is refunded in full.',
  },
  {
    question: 'Can I order to my office reception or concierge desk?',
    answer:
      'Yes! Many of our subscribers in The City, Canary Wharf, Mayfair, and Stratford have their tiffins delivered directly to concierge suites or office receptions.',
  },
  {
    question: 'Is there a student discount available across London?',
    answer:
      'Yes! All verified university students in London (Imperial, UCL, KCL, Queen Mary, City, LSE, etc.) receive 30% off subscriptions. Visit our Student Discounts page to verify your student email.',
  },
];

export default async function AllLocationsPage() {
  const locations = await getDynamicLocations();
  const primaryLocation = locations[0] || {
    slug: 'west-london',
    name: 'West London',
    shortName: 'West',
    regionCode: 'W',
    samplePostcode: 'W2 1NY',
    badge: 'West London Tiffin Route',
    headline: 'Authentic Indian Tiffin Delivery in West London',
    subheadline: 'Nutritious homestyle Indian meals delivered in reusable eco-dabbas.',
    introParagraphs: [],
    heroImage: '/chilli garlic broccoli_mix bean subji_methi mutter thadka_fox millet rice.png',
    heroImageAlt: 'DoMeal Feast',
    heroDishName: 'Artisanal Thali',
    heroDishTags: ['Vegan', 'Pure Veg'],
    metaTitle: '',
    metaDescription: '',
    keywords: [],
    canonicalPath: '/locations/west-london',
    ogImage: '/banner.png',
    supportedPostcodes: ['W1', 'W2', 'W3', 'W4', 'W5', 'W6', 'W8', 'W11', 'W14'],
    neighbourhoods: [],
    localHighlights: [],
    featuredDishes: [],
    faqs: MASTER_FAQS,
    active: true,
  };

  const jsonLdGraph = {
    '@context': 'https://schema.org',
    '@graph': [
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
            item: `${BASE_URL}/locations`,
          },
        ],
      },
      {
        '@type': ['FoodEstablishment', 'Restaurant'],
        '@id': `${BASE_URL}/locations/#restaurant`,
        name: 'DoMeal — London Indian Tiffin Delivery Network',
        url: `${BASE_URL}/locations`,
        image: `${BASE_URL}/banner.png`,
        description:
          'Home-cooked vegetarian Indian tiffins delivered across London Zones 1–3 in reusable stainless steel containers.',
        servesCuisine: ['Indian', 'Vegetarian', 'Vegan', 'Home Style Indian Food'],
        priceRange: '££',
        currenciesAccepted: 'GBP',
        areaServed: locations.map((loc) => ({
          '@type': 'AdministrativeArea',
          name: `${loc.name}, London`,
        })),
        hasMenu: `${BASE_URL}/menu`,
      },
      {
        '@type': 'FAQPage',
        mainEntity: MASTER_FAQS.map((faq) => ({
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
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdGraph) }}
      />

      <UserNavbar />

      <main className="min-h-screen bg-[#FBF8F3]">
        {/* 1. Promo Announcement Ribbon */}
        <LocationPromoBar locationName="London Zones 1–3" />

        {/* 2. Hero Section: All Locations Master Header */}
        <section className="relative overflow-hidden bg-[#0C1D13] text-white pt-24 pb-20 lg:pt-32 lg:pb-28">
          <div className="absolute inset-0 pointer-events-none opacity-30">
            <div className="absolute -top-40 left-1/3 w-[600px] h-[600px] bg-[#C39B54] rounded-full blur-[160px] animate-pulse-warm" />
            <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-[#163824] rounded-full blur-[140px]" />
          </div>

          <div
            className="absolute inset-0 opacity-[0.03] pointer-events-none"
            style={{
              backgroundImage: 'radial-gradient(circle, #C39B54 1.5px, transparent 1.5px)',
              backgroundSize: '32px 32px',
            }}
          />

          <div className="max-w-screen-2xl mx-auto px-4 lg:px-8 xl:px-12 relative z-10 text-center max-w-4xl space-y-7">
            <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-black text-[#C39B54] uppercase tracking-widest shadow-sm">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>London Zones 1–3 Delivery Network</span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-[1.1] tracking-tight font-sans">
              Authentic Indian Tiffin Delivery Across{' '}
              <span className="text-[#C39B54]">All London Zones 1–3</span>
            </h1>

            <p className="text-base sm:text-lg text-gray-200 max-w-2xl mx-auto leading-relaxed">
              Wholesome vegetarian and vegan feasts prepared daily by 21-year culinary masters, delivered in
              reusable 3-tier stainless steel containers directly to homes, student flats, and offices twice weekly.
            </p>

            {/* Quick Postcode Verification Bar */}
            <div className="max-w-xl mx-auto pt-3">
              <PostcodeSearch />
            </div>

            {/* Quick Sector Nav Pills */}
            <div className="pt-4 flex flex-wrap items-center justify-center gap-2 text-xs">
              <span className="text-gray-400 font-bold uppercase tracking-wider text-[11px] mr-2">
                Browse Sectors:
              </span>
              {locations.map((loc) => (
                <Link
                  key={loc.slug}
                  href="#delivery-zones"
                  className="px-3.5 py-1.5 rounded-full bg-white/10 hover:bg-[#C39B54] hover:text-[#0C1D13] transition-all font-bold text-gray-200 border border-white/15"
                >
                  {loc.name}
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* 3. All London Locations Sector Cards Grid */}
        <section id="delivery-zones" className="py-20 lg:py-28 bg-white border-b border-gray-100 font-sans">
          <div className="max-w-screen-2xl mx-auto px-4 lg:px-8 xl:px-12">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
              <div className="space-y-3 max-w-2xl">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#1E3B2B]/10 text-[#1E3B2B] text-xs font-black uppercase tracking-widest">
                  <Navigation size={13} className="text-[#C39B54]" />
                  <span>5 Dedicated London Corridors</span>
                </div>
                <h2 className="text-3xl lg:text-4xl font-extrabold text-[#1E3B2B] tracking-tight">
                  Choose Your London Delivery Region
                </h2>
                <p className="text-gray-600 text-base leading-relaxed">
                  Select your area below to view local delivery days, active postcode outward codes, sample
                  rotating menus, and neighbourhood coverage.
                </p>
              </div>

              <div className="shrink-0 flex items-center gap-2 text-xs font-extrabold text-emerald-800 bg-emerald-50 px-4 py-2.5 rounded-2xl border border-emerald-200 shadow-2xs">
                <Clock size={16} className="text-emerald-700" />
                <span>Mondays &amp; Thursdays Delivery Routes</span>
              </div>
            </div>

            {/* Grid of All 5 Location Regions */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {locations.map((loc) => (
                <Link
                  key={loc.slug}
                  href="/menu"
                  className="group bg-white rounded-3xl border-2 border-stone-200 hover:border-[#C39B54] hover:shadow-2xl transition-all duration-300 flex flex-col justify-between overflow-hidden relative"
                >
                  <div>
                    {/* Image Header with Badge */}
                    <div className="relative w-full aspect-[16/10] bg-gray-100 overflow-hidden">
                      <Image
                        src={loc.heroImage}
                        alt={`${loc.name} Indian Tiffin Delivery`}
                        fill
                        quality={95}
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        className="object-cover object-center group-hover:scale-105 transition-transform duration-500 ease-out"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />

                      {/* Status Pill */}
                      <div className="absolute top-4 left-4 bg-emerald-600 text-white text-xs font-black px-3 py-1 rounded-full shadow-md flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                        <span>Now Delivering</span>
                      </div>

                      {/* Region Code Tag */}
                      <div className="absolute top-4 right-4 bg-[#142A1E]/80 backdrop-blur-md text-[#C39B54] text-xs font-mono font-bold px-2.5 py-1 rounded-xl border border-[#C39B54]/40">
                        {loc.regionCode} Corridors
                      </div>

                      {/* Sector Title on image */}
                      <div className="absolute bottom-4 left-4 right-4 text-white">
                        <div className="text-xs font-bold uppercase tracking-wider text-[#C39B54]">
                          {loc.badge}
                        </div>
                        <div className="text-2xl font-extrabold leading-tight drop-shadow-sm">
                          {loc.name} Tiffins
                        </div>
                      </div>
                    </div>

                    {/* Card Body */}
                    <div className="p-6 space-y-4">
                      <p className="text-sm text-gray-600 leading-relaxed line-clamp-2">
                        {loc.subheadline}
                      </p>

                      {/* Supported Postcodes */}
                      <div className="pt-3 border-t border-gray-100 space-y-2">
                        <div className="text-[11px] uppercase font-black text-gray-400 tracking-wider">
                          Key Areas &amp; Boroughs:
                        </div>
                        <div className="text-xs font-bold text-gray-800 line-clamp-2">
                          {loc.neighbourhoods.slice(0, 4).map((n) => n.name).join(' · ')}
                        </div>
                        <div className="flex flex-wrap gap-1 pt-1">
                          {loc.supportedPostcodes.slice(0, 7).map((pc) => (
                            <span
                              key={pc}
                              className="px-2 py-0.5 bg-stone-100 text-stone-700 text-[10px] font-mono font-bold rounded-md"
                            >
                              {pc}
                            </span>
                          ))}
                          {loc.supportedPostcodes.length > 7 && (
                            <span className="px-2 py-0.5 text-stone-400 text-[10px] font-bold">
                              +{loc.supportedPostcodes.length - 7} more
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Bottom Action Footer */}
                  <div className="px-6 pb-6 pt-3 border-t border-gray-100 flex items-center justify-between text-sm font-extrabold text-[#1E3B2B] group-hover:text-[#C39B54]">
                    <span>Order Fresh {loc.name} Tiffin Delivery</span>
                    <ArrowRight
                      size={16}
                      className="transition-transform group-hover:translate-x-1.5 text-[#C39B54]"
                    />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* 4. Illustrated How DoMeal Works (3 Circular Steps with Floating Images) */}
        <LocationHowItWorks locationName="London" />

        {/* 5. Anatomy of a Feast ("What's in your Dabba?") */}
        <LocationDabbaAnatomy locationName="London" />

        {/* 6. Signature Feasts on This Week's Menu */}
        <LocationSignatureDishes location={primaryLocation} />

        {/* 7. Takeaway vs. DoMeal Sustainability Comparison */}
        <LocationEcoComparison locationName="London" />

        {/* 8. London Zones 1–3 Vector Map & Interactive Explorer */}
        <LocationBoroughExplorer location={primaryLocation} />

        {/* 9. Curated Customer Testimonials */}
        <LocationEditorialReviews locationName="London" />

        {/* 10. Frequently Asked Questions */}
        <LocationFAQs locationName="London" faqs={MASTER_FAQS} />

        {/* 11. Final Full-Width Call-to-Action */}
        <LocationFinalCTA locationName="London" />
      </main>

      {/* 12. Complete Footer */}
      <UserFooter />
    </div>
  );
}
