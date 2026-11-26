'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  MapPin,
  Save,
  Plus,
  Trash2,
  Edit,
  Eye,
  Check,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  Globe,
  HelpCircle,
  Building2,
  Navigation,
  Clock,
  Leaf,
  ShieldCheck,
  ArrowUpRight,
  ExternalLink,
  ChevronDown,
  ChevronRight,
  Search,
  Upload,
  Layers,
  FileText,
  UtensilsCrossed,
  BookOpen,
  Columns,
  Maximize2,
  X,
  Smartphone,
  Monitor,
  Star,
} from 'lucide-react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import {
  LONDON_LOCATIONS,
  LocationData,
  LocationFAQ,
  LocationDish,
  LocationHowItWorksStep,
  LocationDabbaTier,
  LocationReview,
  LocationEcoComparisonConfig,
  LocationFinalCTAConfig,
  LocationStoryConfig,
  LocationFooterConfig,
} from '@/lib/locations-data';
import LocationLivePreview from './LocationLivePreview';
import LocationImagePicker from './LocationImagePicker';

interface HubConfig {
  headline: string;
  subheadline: string;
  badge: string;
  postcodeSectionTitle: string;
  postcodeSectionSubtitle: string;
}

const DEFAULT_HUB_CONFIG: HubConfig = {
  headline: 'Authentic Indian Tiffin Delivery Across London Zones 1–3',
  subheadline:
    'Fresh, home-cooked vegetarian and vegan meals delivered twice weekly in reusable stainless steel eco-dabbas. Select your London delivery sector to explore local routes, postcodes, and rotating weekly menus.',
  badge: 'Zero-Waste London Delivery Network',
  postcodeSectionTitle: 'Check Your Postcode for Scheduled Delivery',
  postcodeSectionSubtitle:
    'We currently deliver to all London postcodes across Zones 1, 2, and 3 every Monday and Thursday.',
};

const DEFAULT_FOOTER_DELIVERY_AREAS = [
  {
    label: 'West London Tiffins',
    sub: 'W1 to W14 Postcodes · Scheduled Routes',
    href: '/locations/west-london',
  },
  {
    label: 'East London Tiffins',
    sub: 'E1 to E20, IG & RM Postcodes · Scheduled Routes',
    href: '/locations/east-london',
  },
  {
    label: 'North London Tiffins',
    sub: 'N1 to N22, NW1 to NW11 Postcodes · Scheduled Routes',
    href: '/locations/north-london',
  },
  {
    label: 'South London Tiffins',
    sub: 'SE1 to SE28, SW1 to SW20 Postcodes · Scheduled Routes',
    href: '/locations/south-london',
  },
  {
    label: 'Central London Tiffins',
    sub: 'EC1 to EC4, WC1 to WC2, W1 Postcodes · Scheduled Routes',
    href: '/locations/central-london',
  },
];

export type SubTabType =
  | 'basics'
  | 'editorial'
  | 'narrative'
  | 'howItWorks'
  | 'dabbaTiers'
  | 'dishes'
  | 'ecoCompare'
  | 'neighbourhoods'
  | 'reviews'
  | 'highlights'
  | 'faqs'
  | 'finalCTA'
  | 'footer'
  | 'seo';

export type LayoutMode = 'split' | 'editor' | 'preview';
export type SplitRatio = 'editor-focus' | 'balanced' | 'preview-focus';

export default function AdminLocationsClient() {
  const { user } = useAuth();
  const [locations, setLocations] = useState<LocationData[]>(LONDON_LOCATIONS);
  const [selectedSlug, setSelectedSlug] = useState<string>('west-london');
  const [activeSubTab, setActiveSubTab] = useState<SubTabType>('basics');
  const [layoutMode, setLayoutMode] = useState<LayoutMode>('split');
  const [splitRatio, setSplitRatio] = useState<SplitRatio>('balanced');
  const [hubConfig, setHubConfig] = useState<HubConfig>(DEFAULT_HUB_CONFIG);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // New Location Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [newLocName, setNewLocName] = useState('');
  const [newLocSlug, setNewLocSlug] = useState('');
  const [newLocRegionCode, setNewLocRegionCode] = useState('NW');
  const [newLocSamplePostcode, setNewLocSamplePostcode] = useState('NW1 4NP');

  // New Postcode Input State
  const [newPostcodeInput, setNewPostcodeInput] = useState('');

  // Load locations from Firestore with safe default merging
  useEffect(() => {
    const fetchLocationsCMS = async () => {
      try {
        const snap = await getDoc(doc(db, 'settings', 'locations_cms'));
        if (snap.exists()) {
          const data = snap.data();
          if (Array.isArray(data.locations) && data.locations.length > 0) {
            const merged = data.locations.map((savedLoc: any) => {
              const fallback =
                LONDON_LOCATIONS.find((d) => d.slug === savedLoc.slug) || LONDON_LOCATIONS[0];
              return {
                ...fallback,
                ...savedLoc,
                name: savedLoc.name || fallback.name || '',
                slug: savedLoc.slug || fallback.slug || '',
                shortName: savedLoc.shortName || fallback.shortName || '',
                regionCode: savedLoc.regionCode || fallback.regionCode || '',
                samplePostcode: savedLoc.samplePostcode || fallback.samplePostcode || '',
                badge: savedLoc.badge || fallback.badge || '',
                headline: savedLoc.headline || fallback.headline || '',
                subheadline: savedLoc.subheadline || fallback.subheadline || '',
                heroImage: savedLoc.heroImage || fallback.heroImage || '/banner.png',
                heroImageAlt: savedLoc.heroImageAlt || fallback.heroImageAlt || '',
                heroDishName: savedLoc.heroDishName || fallback.heroDishName || '',
                metaTitle: savedLoc.metaTitle || fallback.metaTitle || '',
                metaDescription: savedLoc.metaDescription || fallback.metaDescription || '',
                canonicalPath: savedLoc.canonicalPath || fallback.canonicalPath || `/locations/${savedLoc.slug}`,
                ogImage: savedLoc.ogImage || fallback.ogImage || '/banner.png',
                active: savedLoc.active !== undefined ? savedLoc.active : true,
                heroDishTags: Array.isArray(savedLoc.heroDishTags) ? savedLoc.heroDishTags : fallback.heroDishTags || [],
                introParagraphs: Array.isArray(savedLoc.introParagraphs) ? savedLoc.introParagraphs : fallback.introParagraphs || [],
                supportedPostcodes: Array.isArray(savedLoc.supportedPostcodes) ? savedLoc.supportedPostcodes : fallback.supportedPostcodes || [],
                neighbourhoods: Array.isArray(savedLoc.neighbourhoods) ? savedLoc.neighbourhoods : fallback.neighbourhoods || [],
                localHighlights: Array.isArray(savedLoc.localHighlights) ? savedLoc.localHighlights : fallback.localHighlights || [],
                featuredDishes: Array.isArray(savedLoc.featuredDishes) ? savedLoc.featuredDishes : fallback.featuredDishes || [],
                faqs: Array.isArray(savedLoc.faqs) ? savedLoc.faqs : fallback.faqs || [],
                keywords: Array.isArray(savedLoc.keywords) ? savedLoc.keywords : fallback.keywords || [],
                promoBarItems: Array.isArray(savedLoc.promoBarItems) ? savedLoc.promoBarItems : fallback.promoBarItems || [],
                storyConfig: savedLoc.storyConfig || fallback.storyConfig || undefined,
                howItWorksSteps: Array.isArray(savedLoc.howItWorksSteps) ? savedLoc.howItWorksSteps : fallback.howItWorksSteps || [],
                dabbaTiers: Array.isArray(savedLoc.dabbaTiers) ? savedLoc.dabbaTiers : fallback.dabbaTiers || [],
                ecoComparison: savedLoc.ecoComparison || fallback.ecoComparison || undefined,
                reviews: Array.isArray(savedLoc.reviews) ? savedLoc.reviews : fallback.reviews || [],
                finalCTA: savedLoc.finalCTA || fallback.finalCTA || undefined,
                footer: {
                  tagline: savedLoc.footer?.tagline || fallback.footer?.tagline || '“Home Food Away From Home”',
                  aboutText: savedLoc.footer?.aboutText || fallback.footer?.aboutText || 'Authentic home-cooked Indian tiffin delivered fresh to your door across London. Made with love, just like home.',
                  contactAddress: savedLoc.footer?.contactAddress || fallback.footer?.contactAddress || 'No 1 Sedgecombe Avenue\nKenton, HA3 0HW',
                  contactEmail: savedLoc.footer?.contactEmail || fallback.footer?.contactEmail || 'orders@domeal.co.uk',
                  contactPhone: savedLoc.footer?.contactPhone || fallback.footer?.contactPhone || '',
                  deliveryAreasHeading: savedLoc.footer?.deliveryAreasHeading || fallback.footer?.deliveryAreasHeading || 'London Delivery Areas',
                  deliveryAreas: (
                    Array.isArray(savedLoc.footer?.deliveryAreas) && savedLoc.footer.deliveryAreas.length > 0
                      ? savedLoc.footer.deliveryAreas.filter(
                          (a: any) => a.href !== '/locations' && !a.label?.toLowerCase().includes('all london locations')
                        )
                      : DEFAULT_FOOTER_DELIVERY_AREAS
                  ),
                  copyrightText: savedLoc.footer?.copyrightText || fallback.footer?.copyrightText || '© 2026 DoMeal · domeal.co.uk · All rights reserved.',
                  facebookUrl: savedLoc.footer?.facebookUrl || fallback.footer?.facebookUrl || '#',
                  instagramUrl: savedLoc.footer?.instagramUrl || fallback.footer?.instagramUrl || '#',
                  pinterestUrl: savedLoc.footer?.pinterestUrl || fallback.footer?.pinterestUrl || '#',
                  tiktokUrl: savedLoc.footer?.tiktokUrl || fallback.footer?.tiktokUrl || '#',
                },
              };
            });
            setLocations(merged);
          }
          if (data.hubConfig) {
            setHubConfig({
              headline: data.hubConfig.headline || DEFAULT_HUB_CONFIG.headline,
              subheadline: data.hubConfig.subheadline || DEFAULT_HUB_CONFIG.subheadline,
              badge: data.hubConfig.badge || DEFAULT_HUB_CONFIG.badge,
              postcodeSectionTitle: data.hubConfig.postcodeSectionTitle || DEFAULT_HUB_CONFIG.postcodeSectionTitle,
              postcodeSectionSubtitle: data.hubConfig.postcodeSectionSubtitle || DEFAULT_HUB_CONFIG.postcodeSectionSubtitle,
            });
          }
        }
      } catch (err) {
        console.warn('Could not load dynamic locations from Firestore, using defaults:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchLocationsCMS();
  }, []);

  // Current selected location object with safe fallbacks for all inputs
  const rawCurrentLocation = locations.find((l) => l.slug === selectedSlug) || locations[0] || LONDON_LOCATIONS[0];
  const locName = rawCurrentLocation.name || 'London';
  const currentLocation: LocationData = {
    ...rawCurrentLocation,
    name: rawCurrentLocation.name || '',
    slug: rawCurrentLocation.slug || '',
    shortName: rawCurrentLocation.shortName || '',
    regionCode: rawCurrentLocation.regionCode || '',
    samplePostcode: rawCurrentLocation.samplePostcode || '',
    badge: rawCurrentLocation.badge || '',
    headline: rawCurrentLocation.headline || '',
    subheadline: rawCurrentLocation.subheadline || '',
    heroImage: rawCurrentLocation.heroImage || '/banner.png',
    heroImageAlt: rawCurrentLocation.heroImageAlt || '',
    heroDishName: rawCurrentLocation.heroDishName || '',
    metaTitle: rawCurrentLocation.metaTitle || '',
    metaDescription: rawCurrentLocation.metaDescription || '',
    canonicalPath: rawCurrentLocation.canonicalPath || `/locations/${rawCurrentLocation.slug}`,
    ogImage: rawCurrentLocation.ogImage || '/banner.png',
    active: rawCurrentLocation.active !== undefined ? rawCurrentLocation.active : true,
    heroDishTags: rawCurrentLocation.heroDishTags || [],
    introParagraphs: rawCurrentLocation.introParagraphs || [],
    supportedPostcodes: rawCurrentLocation.supportedPostcodes || [],
    neighbourhoods: (rawCurrentLocation.neighbourhoods || []).map((n) => ({
      name: n.name || '',
      postcode: n.postcode || '',
      description: n.description || '',
    })),
    localHighlights: (rawCurrentLocation.localHighlights || []).map((h) => ({
      title: h.title || '',
      desc: h.desc || '',
      icon: h.icon || '',
    })),
    featuredDishes: (rawCurrentLocation.featuredDishes || []).map((d) => ({
      title: d.title || '',
      image: d.image || '',
      nutritionBadge: d.nutritionBadge || '',
      tags: d.tags || [],
      description: d.description || '',
    })),
    faqs: (rawCurrentLocation.faqs || []).map((f) => ({
      question: f.question || '',
      answer: f.answer || '',
    })),
    keywords: rawCurrentLocation.keywords || [],
    promoBarItems:
      Array.isArray(rawCurrentLocation.promoBarItems) && rawCurrentLocation.promoBarItems.length > 0
        ? rawCurrentLocation.promoBarItems
        : [
            `🌿 PURE PLANT-POWERED & VEGETARIAN HOMESTYLE FOOD`,
            `✦ DELIVERED COLD-PACKED TO ${locName.toUpperCase()} EVERY MONDAY & THURSDAY`,
            `♻️ REUSABLE STAINLESS STEEL DABBAS · ZERO SINGLE-USE PLASTIC`,
            `✦ 21+ YEARS AUTHENTIC CULINARY HERITAGE · COUNCIL 5-STAR HYGIENE`,
            `✦ FREE EMPTY DABBA SWAP ON EVERY DELIVERY`,
          ],
    storyConfig: {
      badge: rawCurrentLocation.storyConfig?.badge || 'Our Food Philosophy',
      quote:
        rawCurrentLocation.storyConfig?.quote ||
        '“Real Indian home cooking that nurtures your health and respects London’s environment.”',
      quoteSub:
        rawCurrentLocation.storyConfig?.quoteSub ||
        `Crafted in London by 21-year culinary masters · Delivered fresh across ${locName}.`,
      paragraphs:
        Array.isArray(rawCurrentLocation.storyConfig?.paragraphs) &&
        rawCurrentLocation.storyConfig.paragraphs.length > 0
          ? rawCurrentLocation.storyConfig.paragraphs
          : Array.isArray(rawCurrentLocation.introParagraphs) &&
            rawCurrentLocation.introParagraphs.length > 0
          ? rawCurrentLocation.introParagraphs
          : [
              `For generations, traditional tiffin delivery in Mumbai was built on two sacred principles: hot, nourishing home-cooked food and zero packaging waste. DoMeal brings that timeless tradition straight to your doorstep in ${locName}.`,
              `Unlike commercial takeaways that rely on heavy restaurant creams, saturated animal fats, and mountains of single-use plastic containers, our kitchen cooks everyday ghar ka khana (homestyle food). We slow-simmer whole yellow and black lentils, press fresh cold-pressed oils, hand-temper whole cumin and mustard seeds, and bake soft, wholesome rotis.`,
              `Whether you are working from a high-rise in ${locName}, studying at university, or feeding a busy family, DoMeal ensures you never have to choose between convenience and authentic, nutritious food.`,
            ],
    },
    howItWorksSteps:
      Array.isArray(rawCurrentLocation.howItWorksSteps) &&
      rawCurrentLocation.howItWorksSteps.length > 0
        ? rawCurrentLocation.howItWorksSteps
        : [
            {
              stepNumber: '01',
              badge: 'MONDAY & THURSDAY MORNINGS',
              title: 'Small-Batch Scratch Cooking',
              description:
                'Our chefs slow-simmer heritage dals, roast fresh whole spices, and hand-press wholewheat rotis in small batches in our 5-star commercial kitchen.',
              highlightPill: 'Zero Ultra-Processed Pastes',
              image: '/banner.png',
            },
            {
              stepNumber: '02',
              badge: 'AFTERNOON DELIVERY RUN',
              title: 'Chilled Eco-Dabba Delivery',
              description: `Your multi-course feast arrives cold-packed in sealed, food-grade stainless steel tiffins inside insulated eco-coolers right to your door across ${locName}.`,
              highlightPill: 'Refrigerate Immediately',
              image: '/Tomato Cucumber Salad_Soya Chaap subzi_Tofu Jalfrezi_Jasmine Rice.png',
            },
            {
              stepNumber: '03',
              badge: 'ZERO WASTE CIRCULAR RETURN',
              title: 'Heat, Feast & Container Swap',
              description:
                'Warm your food on the hob or plate, feast authentically, rinse containers, and hand them back to your driver on your next delivery.',
              highlightPill: 'Zero Single-Use Plastic Waste',
              image: '/chilli garlic broccoli_mix bean subji_methi mutter thadka_fox millet rice.png',
            },
          ],
    dabbaTiers:
      Array.isArray(rawCurrentLocation.dabbaTiers) && rawCurrentLocation.dabbaTiers.length > 0
        ? rawCurrentLocation.dabbaTiers
        : [
            {
              tierNumber: 'Tier 01',
              badge: 'Top Tier',
              title: 'Fresh Crisp Salads, Chutneys & Bites',
              subtitle: 'Sprouted mung beans, shredded carrot kachumber, mint-coriander dip & roasted papad.',
              desc: 'Designed to cleanse the palate and awaken appetite before warm curries.',
              highlight: 'High Fibre · Raw Enzymes · Zero Oil Dressing',
            },
            {
              tierNumber: 'Tier 02',
              badge: 'Middle Tier',
              title: 'Slow-Simmered Dals & Regional Curries',
              subtitle: 'Signature yellow tadka, rich Gujarati kadhi, or Punjabi rajma masala made with heritage spices.',
              desc: 'Nutritious homestyle Indian comfort, rich in plant-based proteins.',
              highlight: 'Over 24g Plant Protein Per Feast',
            },
            {
              tierNumber: 'Tier 03',
              badge: 'Base Tier',
              title: 'Handmade Breads & Heritage Grains',
              subtitle: 'Steamed cumin basmati or heritage millets paired with soft phulkas brushed with pure desi ghee.',
              desc: 'Warm staple grains that tie the entire Indian culinary experience together.',
              highlight: '100% Whole Grain · Stone-Ground Atta',
            },
            {
              tierNumber: 'Tier 04',
              badge: 'Bonus Tier',
              title: 'Digestive Harmony & Crunch',
              subtitle: 'Crunchy sprouted green gram with roasted salted peanuts and artisanal relishes.',
              desc: 'No Indian thali is complete without balanced crunch and natural digestive spices.',
              highlight: 'Raw Nutrition · Zero Preservatives',
            },
          ],
    ecoComparison: {
      badge: rawCurrentLocation.ecoComparison?.badge || 'A Better Way to Eat in London',
      title: rawCurrentLocation.ecoComparison?.title || 'Commercial Takeaway vs. DoMeal Dabba',
      subtitle:
        rawCurrentLocation.ecoComparison?.subtitle ||
        'Traditional takeaways flood London with thousands of single-use plastic tubs every night. DoMeal replaces waste with a timeless, zero-plastic circular model.',
      takeawayBadge: rawCurrentLocation.ecoComparison?.takeawayBadge || 'The Outdated Way',
      takeawayTitle: rawCurrentLocation.ecoComparison?.takeawayTitle || 'Commercial Takeaway',
      takeawayPoints:
        Array.isArray(rawCurrentLocation.ecoComparison?.takeawayPoints) &&
        rawCurrentLocation.ecoComparison.takeawayPoints.length > 0
          ? rawCurrentLocation.ecoComparison.takeawayPoints
          : [
              'Single-use black plastic containers and bags destined for landfill.',
              'Heavy restaurant cream, artificial food colors, and excessive oil.',
              'Causes post-lunch food comas and sluggish digestion.',
              'Expensive delivery surcharges and unpredictable arrival times.',
              'Frozen and reheated food with lost nutrients and artificial taste.',
            ],
      domealTopBadge: rawCurrentLocation.ecoComparison?.domealTopBadge || 'The Sustainable Choice',
      domealBadge: rawCurrentLocation.ecoComparison?.domealBadge || 'The DoMeal Way',
      domealTitle: rawCurrentLocation.ecoComparison?.domealTitle || 'DoMeal Reusable Dabba',
      ctaButtonText: rawCurrentLocation.ecoComparison?.ctaButtonText || `Start Your Zero-Plastic ${locName} Feast`,
      domealPoints:
        Array.isArray(rawCurrentLocation.ecoComparison?.domealPoints) &&
        rawCurrentLocation.ecoComparison.domealPoints.length > 0
          ? rawCurrentLocation.ecoComparison.domealPoints
          : [
              '100% Zero Single-Use Plastic — Reusable 3-tier stainless steel containers.',
              'Pure Vegetarian & Vegan — Cold-pressed oils, hand-tempered spices, zero preservatives.',
              'Nourishing & Digestible — Ancient millets, fresh salads, and slow-simmered dals.',
              'Free Dabba Swap — Our driver collects your clean container on each delivery.',
              'Freshly Cooked Morning Batches — Delivered chilled in 100% food-grade stainless steel dabbas.',
            ],
    },
    howItWorksBadge: rawCurrentLocation.howItWorksBadge || 'The Zero-Waste Homestyle Ritual',
    howItWorksTitle: rawCurrentLocation.howItWorksTitle || 'How DoMeal Works',
    howItWorksSubtitle:
      rawCurrentLocation.howItWorksSubtitle ||
      'Authentic homestyle Indian feasting, reusable stainless steel tiffins, and zero single-use plastics.',
    dabbaBadge: rawCurrentLocation.dabbaBadge || 'The Anatomy of a DoMeal Feast',
    dabbaTitle: rawCurrentLocation.dabbaTitle || `What's Inside Your ${locName} Dabba?`,
    dishesBadge: rawCurrentLocation.dishesBadge || "Chef's London Selection",
    dishesTitle: rawCurrentLocation.dishesTitle || `Signature Feasts on This Week's ${locName} Menu`,
    dishesSubtitle:
      rawCurrentLocation.dishesSubtitle ||
      'Every dish is prepared fresh on delivery mornings in our commercial kitchen. No commercial pastes, no artificial thickeners, and no single-use plastic takeaway tubs.',
    neighbourhoodsBadge: rawCurrentLocation.neighbourhoodsBadge || 'Scheduled London Delivery Network',
    neighbourhoodsTitle: rawCurrentLocation.neighbourhoodsTitle || 'We Deliver to All London Zones 1–3',
    neighbourhoodsSubtitle:
      rawCurrentLocation.neighbourhoodsSubtitle ||
      `From ${locName}'s historic mews to high-rise concierge suites across London Zones 1, 2, and 3, our chilled delivery fleet brings authentic home-cooked Indian tiffins directly to your doorstep twice weekly with zero single-use plastic.`,
    reviewsBadge: rawCurrentLocation.reviewsBadge || `Loved Across ${locName}`,
    reviewsTitle: rawCurrentLocation.reviewsTitle || `What ${locName} Is Saying`,
    reviewsSubtitle: rawCurrentLocation.reviewsSubtitle || '4.9 / 5.0 Average · 1,200+ Verified London Orders',
    faqsBadge: rawCurrentLocation.faqsBadge || 'Local Questions & Answers',
    faqsTitle: rawCurrentLocation.faqsTitle || `${locName} Tiffin Delivery FAQs`,
    faqsSubtitle:
      rawCurrentLocation.faqsSubtitle ||
      `Everything you need to know about our home-cooked meal subscriptions, delivery days, and reusable packaging in ${locName}.`,
    reviews:
      Array.isArray(rawCurrentLocation.reviews) && rawCurrentLocation.reviews.length > 0
        ? rawCurrentLocation.reviews
        : [
            {
              author: 'Priya & Rahul S.',
              neighbourhood: `${locName} Residents`,
              plan: '3-Day Family Feast Plan',
              rating: 5,
              quote:
                'The reusable dabba system has completely transformed our evenings. The rotis are soft, the dal is rich and comforting, and there is zero plastic waste going into our recycling bin every week.',
            },
            {
              author: 'Dr. Arjun M.',
              neighbourhood: `${locName}`,
              plan: 'Weekly Lunch & Dinner Plan',
              rating: 5,
              quote:
                'As an NHS doctor working grueling shifts, having fresh, nutritious Indian food ready in the fridge is an absolute lifesaver. It tastes just like my mother cooks at home—light, authentic, and satisfying.',
            },
            {
              author: 'Sarah & Deepak T.',
              neighbourhood: `${locName}`,
              plan: '2-Day Weekly Feast Plan',
              rating: 5,
              quote:
                'So much lighter and fresher than restaurant takeaways! You can taste the quality of the cold-pressed oils and whole spices. We swap our dabbas every Thursday and could not be happier.',
            },
          ],
    finalCTA: {
      badge: rawCurrentLocation.finalCTA?.badge || `Active Route in ${locName}`,
      heading:
        rawCurrentLocation.finalCTA?.heading ||
        `Ready to Experience Handcrafted Home Food in ${locName}?`,
      subheadline:
        rawCurrentLocation.finalCTA?.subheadline ||
        'No shopping, no cooking, no greasy takeaway boxes, and no pots to scrub. Freshly cooked, authentic Indian curries and hand-rolled rotis delivered in reusable stainless dabbas every Monday & Thursday.',
      primaryButtonText:
        rawCurrentLocation.finalCTA?.primaryButtonText || `Order Your ${locName} Tiffin Feast`,
      primaryButtonLink: rawCurrentLocation.finalCTA?.primaryButtonLink || '/menu',
      secondaryButtonText: rawCurrentLocation.finalCTA?.secondaryButtonText || 'Check Postcode First',
      secondaryButtonLink: rawCurrentLocation.finalCTA?.secondaryButtonLink || '#postcode-checker',
      guarantees:
        Array.isArray(rawCurrentLocation.finalCTA?.guarantees) &&
        rawCurrentLocation.finalCTA.guarantees.length > 0
          ? rawCurrentLocation.finalCTA.guarantees
          : [
              'Pause or Cancel Anytime',
              '100% Pure Vegetarian Kitchen',
              'Refundable £12 Dabba Deposit',
            ],
    },
    heroPostcodeTitle: rawCurrentLocation.heroPostcodeTitle || `Check ${locName} Postcode Availability`,
    heroPostcodeBadge: rawCurrentLocation.heroPostcodeBadge || `${(rawCurrentLocation.supportedPostcodes || []).length}+ Active Postcodes`,
    heroPostcodeBtnText: rawCurrentLocation.heroPostcodeBtnText || 'Check Route',
    heroPostcodeNote: rawCurrentLocation.heroPostcodeNote || `Verified routes in ${locName}: ${(rawCurrentLocation.supportedPostcodes || []).slice(0, 7).join(', ')}...`,
    heroPrimaryBtnText: rawCurrentLocation.heroPrimaryBtnText || `Order Your ${rawCurrentLocation.shortName || locName} Dabba Feast`,
    heroPrimaryBtnLink: rawCurrentLocation.heroPrimaryBtnLink || '#menu',
    heroSecondaryBtnText: rawCurrentLocation.heroSecondaryBtnText || 'How Dabba Swapping Works',
    heroSecondaryBtnLink: rawCurrentLocation.heroSecondaryBtnLink || '#how-it-works',
    heroRatingText: rawCurrentLocation.heroRatingText || '1,200+ Londoners Fed',
    heroHygieneText: rawCurrentLocation.heroHygieneText || 'Council 5-Star Food Hygiene',
    heroDishBadge: rawCurrentLocation.heroDishBadge || `Signature Feast in ${locName}`,
    heroDishSubBadge: rawCurrentLocation.heroDishSubBadge || 'Freshly Cooked Daily',
    heroFloat1Title: rawCurrentLocation.heroFloat1Title || 'Mon & Thu Batches',
    heroFloat1Sub: rawCurrentLocation.heroFloat1Sub || 'Chilled Cold-Pack',
    heroFloat2Title: rawCurrentLocation.heroFloat2Title || 'Zero Plastic Dabbas',
    heroFloat2Sub: rawCurrentLocation.heroFloat2Sub || 'Free Packaging Swap',
    footer: {
      tagline: rawCurrentLocation.footer?.tagline || '“Home Food Away From Home”',
      aboutText:
        rawCurrentLocation.footer?.aboutText ||
        'Authentic home-cooked Indian tiffin delivered fresh to your door across London. Made with love, just like home.',
      contactAddress: rawCurrentLocation.footer?.contactAddress || 'No 1 Sedgecombe Avenue\nKenton, HA3 0HW',
      contactEmail: rawCurrentLocation.footer?.contactEmail || 'orders@domeal.co.uk',
      contactPhone: rawCurrentLocation.footer?.contactPhone || '',
      quickLinksHeading: rawCurrentLocation.footer?.quickLinksHeading || 'Quick Links',
      quickLinks:
        Array.isArray(rawCurrentLocation.footer?.quickLinks) && rawCurrentLocation.footer.quickLinks.length > 0
          ? rawCurrentLocation.footer.quickLinks
          : [
              { label: 'Home', href: '/' },
              { label: 'Menu', href: '/menu' },
              { label: 'Refer a Friend', href: '/refer-a-friend' },
              { label: 'How to Heat', href: '/how-to-heat' },
              { label: 'Student Discounts', href: '/student-discounts' },
              { label: 'Gift', href: '/gift' },
              { label: 'Reviews', href: '/#reviews' },
              { label: 'FAQ', href: '/#faq' },
              { label: 'Sign In', href: '/sign-up-login-screen' },
              { label: 'Admin', href: '/admin-dashboard' },
            ],
      deliveryAreasHeading: rawCurrentLocation.footer?.deliveryAreasHeading || 'London Delivery Areas',
      deliveryAreas:
        Array.isArray(rawCurrentLocation.footer?.deliveryAreas) && rawCurrentLocation.footer.deliveryAreas.length > 0
          ? rawCurrentLocation.footer.deliveryAreas
          : [
              {
                label: `${locName} Tiffins`,
                sub: `${rawCurrentLocation.regionCode || 'London'} · Scheduled Routes`,
                href: `/locations/${rawCurrentLocation.slug || 'west-london'}`,
              },
              {
                label: 'All London Locations →',
                sub: 'Zones 1–3 Route Map',
                href: '/locations',
              },
            ],
      contactHeading: rawCurrentLocation.footer?.contactHeading || 'Contact Us',
      copyrightText: rawCurrentLocation.footer?.copyrightText || '© 2026 DoMeal · domeal.co.uk · All rights reserved.',
      privacyPolicyText: rawCurrentLocation.footer?.privacyPolicyText || 'Privacy Policy',
      privacyPolicyUrl: rawCurrentLocation.footer?.privacyPolicyUrl || '/privacy-policy',
      termsOfServiceText: rawCurrentLocation.footer?.termsOfServiceText || 'Terms of Service',
      termsOfServiceUrl: rawCurrentLocation.footer?.termsOfServiceUrl || '/terms-of-service',
      termsOfBusinessText: rawCurrentLocation.footer?.termsOfBusinessText || 'Terms of Business',
      termsOfBusinessUrl: rawCurrentLocation.footer?.termsOfBusinessUrl || '/terms-of-business',
      facebookUrl: rawCurrentLocation.footer?.facebookUrl || '#',
      instagramUrl: rawCurrentLocation.footer?.instagramUrl || '#',
      pinterestUrl: rawCurrentLocation.footer?.pinterestUrl || '#',
      tiktokUrl: rawCurrentLocation.footer?.tiktokUrl || '#',
    },
  };

  // Update current location field
  const updateCurrentLocation = (field: keyof LocationData, value: any) => {
    setLocations((prev) =>
      prev.map((loc) => {
        if (loc.slug === selectedSlug) {
          return { ...loc, [field]: value };
        }
        return loc;
      })
    );
  };

  // Update nested footer field with instant keystroke reactivity
  const updateFooterField = (field: string, value: any) => {
    if (!currentLocation) return;
    const currentFooter = currentLocation.footer || {};
    updateCurrentLocation('footer', {
      ...currentFooter,
      [field]: value,
    });
  };

  // Helper handlers for dynamic footer links
  const handleAddQuickLink = () => {
    const list = [...(currentLocation.footer?.quickLinks || [])];
    list.push({ label: 'New Link', href: '/' });
    updateFooterField('quickLinks', list);
  };

  const handleUpdateQuickLink = (idx: number, field: 'label' | 'href', value: string) => {
    const list = (currentLocation.footer?.quickLinks || []).map((l, i) =>
      i === idx ? { ...l, [field]: value } : l
    );
    updateFooterField('quickLinks', list);
  };

  const handleRemoveQuickLink = (idx: number) => {
    const list = (currentLocation.footer?.quickLinks || []).filter((_, i) => i !== idx);
    updateFooterField('quickLinks', list);
  };

  const handleLoadAllDefaultRoutes = () => {
    updateFooterField('deliveryAreas', DEFAULT_FOOTER_DELIVERY_AREAS);
    toast.success('Loaded all 5 London delivery routes + Hub into footer.');
  };

  const handleAddDeliveryAreaLink = () => {
    const list = [...(currentLocation.footer?.deliveryAreas || [])];
    list.push({ label: 'New London Area', sub: 'Postcodes · Routes', href: '/locations' });
    updateFooterField('deliveryAreas', list);
  };

  const handleUpdateDeliveryAreaLink = (idx: number, field: 'label' | 'sub' | 'href', value: string) => {
    const list = (currentLocation.footer?.deliveryAreas || []).map((l, i) =>
      i === idx ? { ...l, [field]: value } : l
    );
    updateFooterField('deliveryAreas', list);
  };

  const handleRemoveDeliveryAreaLink = (idx: number) => {
    const list = (currentLocation.footer?.deliveryAreas || []).filter((_, i) => i !== idx);
    updateFooterField('deliveryAreas', list);
  };

  // Update nested storyConfig field
  const updateStoryConfig = (field: string, value: any) => {
    if (!currentLocation) return;
    const currentStory = currentLocation.storyConfig || {};
    updateCurrentLocation('storyConfig', {
      ...currentStory,
      [field]: value,
    });
  };

  // Update nested ecoComparison field
  const updateEcoComparison = (field: string, value: any) => {
    if (!currentLocation) return;
    const currentEco = currentLocation.ecoComparison || {};
    updateCurrentLocation('ecoComparison', {
      ...currentEco,
      [field]: value,
    });
  };

  // Update nested finalCTA field
  const updateFinalCTA = (field: string, value: any) => {
    if (!currentLocation) return;
    const currentCTA = currentLocation.finalCTA || {};
    updateCurrentLocation('finalCTA', {
      ...currentCTA,
      [field]: value,
    });
  };

  // Promo Bar Items Handlers
  const handleAddPromoItem = () => {
    if (!currentLocation) return;
    const items = currentLocation.promoBarItems || [];
    updateCurrentLocation('promoBarItems', [...items, '✦ NEW ANNOUNCEMENT ITEM HERE']);
    toast.success('Added new announcement item.');
  };

  const handleUpdatePromoItem = (idx: number, val: string) => {
    if (!currentLocation) return;
    const items = [...(currentLocation.promoBarItems || [])];
    items[idx] = val;
    updateCurrentLocation('promoBarItems', items);
  };

  const handleRemovePromoItem = (idx: number) => {
    if (!currentLocation) return;
    const items = (currentLocation.promoBarItems || []).filter((_, i) => i !== idx);
    updateCurrentLocation('promoBarItems', items);
  };

  // How It Works Steps Handlers
  const handleAddHowItWorksStep = () => {
    if (!currentLocation) return;
    const steps = currentLocation.howItWorksSteps || [];
    const nextNum = String(steps.length + 1).padStart(2, '0');
    const newStep: LocationHowItWorksStep = {
      stepNumber: nextNum,
      badge: 'NEW STEP RITUAL',
      title: 'Fresh Prep & Delivery',
      description: 'Slow-simmered dishes prepared fresh and delivered in reusable dabbas.',
      highlightPill: 'Authentic Experience',
      image: '/banner.png',
    };
    updateCurrentLocation('howItWorksSteps', [...steps, newStep]);
    toast.success(`Added Step ${nextNum}`);
  };

  const handleUpdateHowItWorksStep = (
    idx: number,
    field: keyof LocationHowItWorksStep,
    val: any
  ) => {
    if (!currentLocation) return;
    const steps = [...(currentLocation.howItWorksSteps || [])];
    steps[idx] = { ...steps[idx], [field]: val };
    updateCurrentLocation('howItWorksSteps', steps);
  };

  const handleRemoveHowItWorksStep = (idx: number) => {
    if (!currentLocation) return;
    const steps = (currentLocation.howItWorksSteps || []).filter((_, i) => i !== idx);
    updateCurrentLocation('howItWorksSteps', steps);
  };

  // Dabba Tiers Handlers
  const handleAddDabbaTier = () => {
    if (!currentLocation) return;
    const tiers = currentLocation.dabbaTiers || [];
    const nextNum = `Tier ${String(tiers.length + 1).padStart(2, '0')}`;
    const newTier: LocationDabbaTier = {
      tierNumber: nextNum,
      badge: 'Fresh Layer',
      title: 'Artisanal Selection',
      subtitle: 'Slow cooked homestyle ingredients',
      desc: 'Nutritious homestyle Indian comfort, rich in plant-based proteins.',
      highlight: 'Wholesome Nutrition',
    };
    updateCurrentLocation('dabbaTiers', [...tiers, newTier]);
    toast.success(`Added ${nextNum}`);
  };

  const handleUpdateDabbaTier = (idx: number, field: keyof LocationDabbaTier, val: any) => {
    if (!currentLocation) return;
    const tiers = [...(currentLocation.dabbaTiers || [])];
    tiers[idx] = { ...tiers[idx], [field]: val };
    updateCurrentLocation('dabbaTiers', tiers);
  };

  const handleRemoveDabbaTier = (idx: number) => {
    if (!currentLocation) return;
    const tiers = (currentLocation.dabbaTiers || []).filter((_, i) => i !== idx);
    updateCurrentLocation('dabbaTiers', tiers);
  };

  // Reviews Handlers
  const handleAddReview = () => {
    if (!currentLocation) return;
    const reviews = currentLocation.reviews || [];
    const newRev: LocationReview = {
      author: 'New Customer',
      neighbourhood: `${currentLocation.name} Resident`,
      plan: 'Weekly Feast Plan',
      rating: 5,
      quote:
        'Delicious authentic food, zero single-use plastic, and exceptional service every week!',
    };
    updateCurrentLocation('reviews', [...reviews, newRev]);
    toast.success('Added new customer review.');
  };

  const handleUpdateReview = (idx: number, field: keyof LocationReview, val: any) => {
    if (!currentLocation) return;
    const reviews = [...(currentLocation.reviews || [])];
    reviews[idx] = { ...reviews[idx], [field]: val };
    updateCurrentLocation('reviews', reviews);
  };

  const handleRemoveReview = (idx: number) => {
    if (!currentLocation) return;
    const reviews = (currentLocation.reviews || []).filter((_, i) => i !== idx);
    updateCurrentLocation('reviews', reviews);
  };

  // Eco Comparison Bullet Points Handlers
  const handleAddTakeawayPoint = () => {
    if (!currentLocation) return;
    const current = currentLocation.ecoComparison?.takeawayPoints || [];
    updateEcoComparison('takeawayPoints', [...current, 'Single-use packaging and greasy heavy oils.']);
  };

  const handleUpdateTakeawayPoint = (idx: number, val: string) => {
    if (!currentLocation) return;
    const current = [...(currentLocation.ecoComparison?.takeawayPoints || [])];
    current[idx] = val;
    updateEcoComparison('takeawayPoints', current);
  };

  const handleRemoveTakeawayPoint = (idx: number) => {
    if (!currentLocation) return;
    const current = (currentLocation.ecoComparison?.takeawayPoints || []).filter((_, i) => i !== idx);
    updateEcoComparison('takeawayPoints', current);
  };

  const handleAddDomealPoint = () => {
    if (!currentLocation) return;
    const current = currentLocation.ecoComparison?.domealPoints || [];
    updateEcoComparison('domealPoints', [
      ...current,
      '100% Zero Single-Use Plastic — Reusable stainless steel containers.',
    ]);
  };

  const handleUpdateDomealPoint = (idx: number, val: string) => {
    if (!currentLocation) return;
    const current = [...(currentLocation.ecoComparison?.domealPoints || [])];
    current[idx] = val;
    updateEcoComparison('domealPoints', current);
  };

  const handleRemoveDomealPoint = (idx: number) => {
    if (!currentLocation) return;
    const current = (currentLocation.ecoComparison?.domealPoints || []).filter((_, i) => i !== idx);
    updateEcoComparison('domealPoints', current);
  };

  // Final CTA Guarantees Handlers
  const handleAddCTAGuarantee = () => {
    if (!currentLocation) return;
    const current = currentLocation.finalCTA?.guarantees || [];
    updateFinalCTA('guarantees', [...current, 'Free Reusable Dabba Collection']);
  };

  const handleUpdateCTAGuarantee = (idx: number, val: string) => {
    if (!currentLocation) return;
    const current = [...(currentLocation.finalCTA?.guarantees || [])];
    current[idx] = val;
    updateFinalCTA('guarantees', current);
  };

  const handleRemoveCTAGuarantee = (idx: number) => {
    if (!currentLocation) return;
    const current = (currentLocation.finalCTA?.guarantees || []).filter((_, i) => i !== idx);
    updateFinalCTA('guarantees', current);
  };

  // Save all locations to Firestore
  const handleSaveAll = async () => {
    setSaving(true);
    try {
      await setDoc(
        doc(db, 'settings', 'locations_cms'),
        {
          locations,
          hubConfig,
          updatedAt: new Date(),
          updatedBy: user?.email || 'Super Admin',
        },
        { merge: true }
      );
      toast.success('Locations CMS saved successfully & synchronized!');
    } catch (err: any) {
      console.error('Error saving locations CMS:', err);
      toast.error('Failed to save to database: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  // Reset to Factory Defaults
  const handleResetToDefaults = () => {
    if (
      confirm(
        'Are you sure you want to restore all location configurations to production defaults? Unsaved custom edits will be reverted.'
      )
    ) {
      setLocations(LONDON_LOCATIONS);
      setHubConfig(DEFAULT_HUB_CONFIG);
      toast.success('Restored default location settings.');
    }
  };

  // Add Supported Postcode
  const handleAddPostcode = () => {
    if (!newPostcodeInput.trim() || !currentLocation) return;
    const clean = newPostcodeInput.trim().toUpperCase();
    if (currentLocation.supportedPostcodes.includes(clean)) {
      toast.error('Postcode sector already exists in this location.');
      return;
    }
    const updated = [...currentLocation.supportedPostcodes, clean];
    updateCurrentLocation('supportedPostcodes', updated);
    setNewPostcodeInput('');
    toast.success(`Added postcode sector ${clean}`);
  };

  // Remove Supported Postcode
  const handleRemovePostcode = (code: string) => {
    if (!currentLocation) return;
    const updated = currentLocation.supportedPostcodes.filter((c) => c !== code);
    updateCurrentLocation('supportedPostcodes', updated);
  };

  // Add Paragraph to Narrative
  const handleAddParagraph = () => {
    if (!currentLocation) return;
    const updated = [
      ...currentLocation.introParagraphs,
      'New brand philosophy paragraph describing our healthy, authentic homestyle recipes cooked daily with cold-pressed oils and organic lentils.',
    ];
    updateCurrentLocation('introParagraphs', updated);
    toast.success('Added new narrative paragraph.');
  };

  // Update Paragraph
  const handleUpdateParagraph = (idx: number, val: string) => {
    if (!currentLocation) return;
    const updated = [...currentLocation.introParagraphs];
    updated[idx] = val;
    updateCurrentLocation('introParagraphs', updated);
  };

  // Remove Paragraph
  const handleRemoveParagraph = (idx: number) => {
    if (!currentLocation) return;
    const updated = currentLocation.introParagraphs.filter((_, i) => i !== idx);
    updateCurrentLocation('introParagraphs', updated);
  };

  // Add Signature Dish
  const handleAddDish = () => {
    if (!currentLocation) return;
    const newDish: LocationDish = {
      title: 'Seasonal Ayurvedic Thali',
      image: '/chilli garlic broccoli_mix bean subji_methi mutter thadka_fox millet rice.png',
      description:
        'Freshly prepared slow-simmered regional subji, high-fibre grains, and fragrant tempered dal.',
      tags: ['100% Plant-Based', 'Zero Plastic Dabba', 'High Fibre'],
      nutritionBadge: 'High Protein · Ancient Grains',
    };
    updateCurrentLocation('featuredDishes', [...(currentLocation.featuredDishes || []), newDish]);
    toast.success('Added new signature feast card.');
  };

  // Update Dish
  const handleUpdateDish = (idx: number, field: keyof LocationDish, val: any) => {
    if (!currentLocation || !currentLocation.featuredDishes) return;
    const updated = [...currentLocation.featuredDishes];
    updated[idx] = { ...updated[idx], [field]: val };
    updateCurrentLocation('featuredDishes', updated);
  };

  // Remove Dish
  const handleRemoveDish = (idx: number) => {
    if (!currentLocation || !currentLocation.featuredDishes) return;
    const updated = currentLocation.featuredDishes.filter((_, i) => i !== idx);
    updateCurrentLocation('featuredDishes', updated);
  };

  // Add Neighbourhood
  const handleAddNeighbourhood = () => {
    if (!currentLocation) return;
    const newArea = {
      name: 'New London Quarter',
      postcode: 'W1',
      description:
        'Residential apartments and local homes enjoying fresh twice-weekly Indian tiffin deliveries.',
    };
    updateCurrentLocation('neighbourhoods', [...currentLocation.neighbourhoods, newArea]);
    toast.success('Added new neighbourhood entry. Centered automatically in row.');
  };

  // Update Neighbourhood
  const handleUpdateNeighbourhood = (idx: number, field: string, val: string) => {
    if (!currentLocation) return;
    const updated = [...currentLocation.neighbourhoods];
    updated[idx] = { ...updated[idx], [field]: val };
    updateCurrentLocation('neighbourhoods', updated);
  };

  // Remove Neighbourhood
  const handleRemoveNeighbourhood = (idx: number) => {
    if (!currentLocation) return;
    const updated = currentLocation.neighbourhoods.filter((_, i) => i !== idx);
    updateCurrentLocation('neighbourhoods', updated);
    toast.success('Removed neighbourhood entry.');
  };

  // Add Local Highlight
  const handleAddHighlight = () => {
    if (!currentLocation) return;
    const newHl = {
      title: 'Guaranteed On-Time Delivery',
      desc: 'Punctual drop-offs directly to concierge desks, mews homes, and secure safe places.',
      icon: 'ShieldCheck',
    };
    updateCurrentLocation('localHighlights', [...currentLocation.localHighlights, newHl]);
  };

  // Update Local Highlight
  const handleUpdateHighlight = (idx: number, field: string, val: string) => {
    if (!currentLocation) return;
    const updated = [...currentLocation.localHighlights];
    updated[idx] = { ...updated[idx], [field]: val };
    updateCurrentLocation('localHighlights', updated);
  };

  // Remove Local Highlight
  const handleRemoveHighlight = (idx: number) => {
    if (!currentLocation) return;
    const updated = currentLocation.localHighlights.filter((_, i) => i !== idx);
    updateCurrentLocation('localHighlights', updated);
  };

  // Add FAQ
  const handleAddFAQ = () => {
    if (!currentLocation) return;
    const newFaq: LocationFAQ = {
      question: 'Frequently Asked Question about this London sector?',
      answer: 'Detailed, helpful answer describing our tiffin delivery service in this area.',
    };
    updateCurrentLocation('faqs', [...currentLocation.faqs, newFaq]);
    toast.success('Added new FAQ entry.');
  };

  // Update FAQ
  const handleUpdateFAQ = (idx: number, field: keyof LocationFAQ, val: string) => {
    if (!currentLocation) return;
    const updated = [...currentLocation.faqs];
    updated[idx] = { ...updated[idx], [field]: val };
    updateCurrentLocation('faqs', updated);
  };

  // Remove FAQ
  const handleRemoveFAQ = (idx: number) => {
    if (!currentLocation) return;
    const updated = currentLocation.faqs.filter((_, i) => i !== idx);
    updateCurrentLocation('faqs', updated);
  };

  // Create New Location Route
  const handleCreateNewLocation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLocName.trim() || !newLocSlug.trim()) return;

    const slug = newLocSlug.trim().toLowerCase().replace(/\s+/g, '-');
    if (locations.some((l) => l.slug === slug)) {
      toast.error('A location with this URL slug already exists.');
      return;
    }

    const newLoc: LocationData = {
      slug,
      name: newLocName.trim(),
      shortName: newLocName.trim().split(' ')[0],
      regionCode: newLocRegionCode.trim().toUpperCase(),
      samplePostcode: newLocSamplePostcode.trim().toUpperCase(),
      badge: `${newLocName.trim()} Tiffin Route`,
      headline: `Authentic Indian Tiffin Delivery in ${newLocName.trim()}`,
      subheadline: `Fresh vegetarian & vegan homestyle meals delivered in zero-waste reusable dabbas across ${newLocName.trim()}.`,
      introParagraphs: [
        `Looking for fresh, home-cooked Indian meals delivered directly to your doorstep in ${newLocName.trim()}? DoMeal delivers hot, authentic vegetarian tiffins every Monday and Thursday.`,
        `Enjoy traditional rotating curries, warm rotis, fragrant basmati rice, and protein-packed dals crafted with over 21 years of culinary heritage.`,
      ],
      heroImage: '/banner.png',
      heroImageAlt: `Authentic Indian meals delivered in ${newLocName.trim()}`,
      heroDishName: 'Traditional Heritage Thali',
      heroDishTags: ['100% Vegetarian', 'High Fibre', 'Eco-Dabba'],
      metaTitle: `Indian Tiffin Delivery in ${newLocName.trim()} | DoMeal London`,
      metaDescription: `Authentic Indian tiffin service in ${newLocName.trim()}. Fresh vegetarian & vegan meals delivered to your door every Monday and Thursday.`,
      keywords: [
        `indian food delivery ${slug}`,
        `tiffin service ${slug}`,
        `vegetarian meal plan ${slug}`,
      ],
      canonicalPath: `/locations/${slug}`,
      ogImage: '/banner.png',
      supportedPostcodes: [newLocSamplePostcode.split(' ')[0]],
      neighbourhoods: [
        {
          name: `${newLocName.trim()} Central`,
          postcode: newLocSamplePostcode.split(' ')[0],
          description: `Key residential streets, apartments, and offices in ${newLocName.trim()}.`,
        },
      ],
      localHighlights: [
        {
          title: 'Twice-Weekly Cold Delivery',
          desc: 'Delivered ice-packed on Mondays and Thursdays. Stays fresh in your fridge for up to 48 hours.',
          icon: 'Clock',
        },
        {
          title: 'Zero-Waste Stainless Steel',
          desc: 'Delivered in traditional 3-tier reusable containers with free container swap.',
          icon: 'Leaf',
        },
        {
          title: '5-Star Food Hygiene Certified',
          desc: '100% vegetarian kitchen prepared under strict food safety and hygiene standards.',
          icon: 'ShieldCheck',
        },
      ],
      featuredDishes: [
        {
          title: 'Heritage North Indian Feast',
          image: '/Chickpea Salad_Aloo Fry_Aloo Gobi Masala_Jeera Rice.png',
          description:
            'Aromatic cumin basmati rice, slow-cooked dal tadka, fresh seasonal subji, and wholewheat rotis.',
          tags: ['Pure Veg', 'Freshly Tempered', 'Eco-Dabba'],
          nutritionBadge: 'Wholesome · Balanced',
        },
      ],
      faqs: [
        {
          question: `How does tiffin delivery work in ${newLocName.trim()}?`,
          answer: `We deliver fresh meals twice weekly on Mondays and Thursdays in chilled, insulated dabbas directly to your doorstep.`,
        },
      ],
      active: true,
    };

    setLocations([...locations, newLoc]);
    setSelectedSlug(slug);
    setShowAddModal(false);
    setNewLocName('');
    setNewLocSlug('');
    toast.success(`Created new location route for ${newLoc.name}!`);
  };

  const totalPostcodes = locations.reduce((sum, l) => sum + l.supportedPostcodes.length, 0);
  const totalNeighbourhoods = locations.reduce((sum, l) => sum + l.neighbourhoods.length, 0);
  const activeLocationsCount = locations.filter((l) => l.active).length;

  return (
    <div className="space-y-4">
      {/* Sleek, Compact Unified Locations CMS Header */}
      <div className="bg-white rounded-2xl border border-border shadow-xs p-3 sm:px-5 sm:py-3.5 space-y-3">
        {/* Row 1: Title, Route Status, and Action Buttons */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#1E3B2B]/10 text-[#1E3B2B] flex items-center justify-center shrink-0">
              <MapPin size={18} className="text-[#1E3B2B]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-black text-gray-900 tracking-tight">
                  Locations &amp; SEO Landing Page CMS
                </h1>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 hidden sm:inline">
                  {activeLocationsCount} Routes Active &bull; Real-Time Sync
                </span>
              </div>
              <p className="text-[11px] text-muted-foreground hidden sm:block">
                Edit regional London routes with live synchronized desktop preview on the right.
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 shrink-0">
            {/* View Mode Toggle: Clean Compact Icons */}
            <div className="bg-stone-100 p-0.5 rounded-xl flex items-center border border-stone-200">
              <button
                type="button"
                onClick={() => setLayoutMode('split')}
                className={`p-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  layoutMode === 'split'
                    ? 'bg-white text-stone-900 shadow-xs'
                    : 'text-stone-500 hover:text-stone-900'
                }`}
                title="Split View (Editor Left + Live Preview Right)"
              >
                <Columns size={14} className={layoutMode === 'split' ? 'text-[#C39B54]' : ''} />
              </button>
              <button
                type="button"
                onClick={() => setLayoutMode('editor')}
                className={`p-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  layoutMode === 'editor'
                    ? 'bg-white text-stone-900 shadow-xs'
                    : 'text-stone-500 hover:text-stone-900'
                }`}
                title="Editor Only (Full Width Form)"
              >
                <FileText size={14} />
              </button>
              <button
                type="button"
                onClick={() => setLayoutMode('preview')}
                className={`p-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  layoutMode === 'preview'
                    ? 'bg-white text-stone-900 shadow-xs'
                    : 'text-stone-500 hover:text-stone-900'
                }`}
                title="Preview Only"
              >
                <Eye size={14} className={layoutMode === 'preview' ? 'text-emerald-600' : ''} />
              </button>
            </div>

            <button
              onClick={handleResetToDefaults}
              className="p-2 sm:px-3 sm:py-2 rounded-xl border border-border bg-gray-50 hover:bg-gray-100 text-gray-600 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
              title="Reset to Production Defaults"
            >
              <RotateCcw size={13} />
              <span className="hidden md:inline">Reset</span>
            </button>

            <button
              onClick={() => setShowAddModal(true)}
              className="px-3.5 py-2 rounded-xl bg-amber-50 border border-amber-200 hover:bg-amber-100 text-[#8C6B28] text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Plus size={14} />
              <span>Add Route</span>
            </button>

            <button
              onClick={handleSaveAll}
              disabled={saving}
              className="px-4 py-2 rounded-xl bg-[#1E3B2B] hover:bg-[#284f3a] text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm active:scale-95 cursor-pointer disabled:opacity-50"
            >
              {saving ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save size={14} />
                  <span>Save All Changes</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Row 2: Location Route Switcher Pills */}
        <div className="pt-2 border-t border-border flex items-center gap-2 overflow-x-auto scrollbar-thin">
          <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider shrink-0 mr-1 flex items-center gap-1">
            <MapPin size={12} className="text-[#C39B54]" /> Routes:
          </span>
          {locations.map((loc) => {
            const isSelected = selectedSlug === loc.slug;
            return (
              <button
                key={loc.slug}
                onClick={() => setSelectedSlug(loc.slug)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
                  isSelected
                    ? 'bg-[#1E3B2B] text-white shadow-sm'
                    : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border border-border'
                }`}
              >
                <span>{loc.name}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-md font-mono font-bold ${
                    loc.active
                      ? isSelected
                        ? 'bg-emerald-500/20 text-emerald-300'
                        : 'bg-emerald-100 text-emerald-800'
                      : 'bg-gray-200 text-gray-500'
                  }`}
                >
                  {loc.regionCode}
                </span>
              </button>
            );
          })}

          <button
            onClick={() => setSelectedSlug('hub-page')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
              selectedSlug === 'hub-page'
                ? 'bg-[#C39B54] text-white shadow-sm'
                : 'bg-amber-50 text-amber-900 hover:bg-amber-100 border border-amber-200'
            }`}
          >
            <Globe size={13} />
            <span>Master /locations Hub Page</span>
          </button>
        </div>
      </div>

      {/* 2. Main Workspace: Split-Screen Dual-Pane Layout */}
      {selectedSlug === 'hub-page' ? (
        /* Master Hub Page Editor */
        <div className="bg-white p-6 rounded-3xl border border-border shadow-xs space-y-6">
          <div className="border-b border-border pb-3 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-extrabold text-foreground">
                Master /locations Hub Page Configuration
              </h2>
              <p className="text-xs text-muted-foreground">
                Controls the main portal directory page that lists all London sectors and the postcode search checker.
              </p>
            </div>
            <Link
              href="/locations"
              target="_blank"
              className="text-xs font-bold text-[#1E3B2B] hover:text-[#C39B54] flex items-center gap-1"
            >
              <span>View Live Hub</span>
              <ExternalLink size={13} />
            </Link>
          </div>

          <div className="space-y-4 text-xs">
            <div>
              <label className="block text-gray-700 font-bold mb-1">Badge Tagline</label>
              <input
                type="text"
                value={hubConfig.badge || ''}
                onChange={(e) => setHubConfig({ ...hubConfig, badge: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-gray-300 text-xs focus:ring-2 focus:ring-[#1E3B2B] outline-none"
              />
            </div>

            <div>
              <label className="block text-gray-700 font-bold mb-1">Hub Page Headline</label>
              <input
                type="text"
                value={hubConfig.headline || ''}
                onChange={(e) => setHubConfig({ ...hubConfig, headline: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-gray-300 text-xs font-bold focus:ring-2 focus:ring-[#1E3B2B] outline-none"
              />
            </div>

            <div>
              <label className="block text-gray-700 font-bold mb-1">Hub Page Subheadline</label>
              <textarea
                rows={3}
                value={hubConfig.subheadline || ''}
                onChange={(e) => setHubConfig({ ...hubConfig, subheadline: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-gray-300 text-xs focus:ring-2 focus:ring-[#1E3B2B] outline-none leading-relaxed"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-border">
              <div>
                <label className="block text-gray-700 font-bold mb-1">Postcode Section Title</label>
                <input
                  type="text"
                  value={hubConfig.postcodeSectionTitle || ''}
                  onChange={(e) => setHubConfig({ ...hubConfig, postcodeSectionTitle: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-gray-300 text-xs font-bold"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-bold mb-1">Postcode Section Subtitle</label>
                <input
                  type="text"
                  value={hubConfig.postcodeSectionSubtitle || ''}
                  onChange={(e) => setHubConfig({ ...hubConfig, postcodeSectionSubtitle: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-gray-300 text-xs"
                />
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Regional Location Workspace (Dual Pane) */
        currentLocation && (
          <div
            className={`grid gap-6 items-start ${
              layoutMode === 'split'
                ? 'grid-cols-1 xl:grid-cols-12'
                : 'grid-cols-1'
            }`}
          >
            {/* LEFT COLUMN: Comprehensive CMS Editor Form */}
            {(layoutMode === 'split' || layoutMode === 'editor') && (
              <div
                className={`space-y-6 ${
                  layoutMode === 'split'
                    ? splitRatio === 'editor-focus'
                      ? 'xl:col-span-7 2xl:col-span-8'
                      : splitRatio === 'balanced'
                      ? 'xl:col-span-6 2xl:col-span-6'
                      : 'xl:col-span-5 2xl:col-span-5'
                    : 'w-full'
                }`}
              >
                {/* Sub-Tab Navigation Bar */}
                <div className="bg-white p-2 rounded-2xl border border-border shadow-xs flex items-center gap-1.5 overflow-x-auto scrollbar-thin">
                  {[
                    { id: 'basics', label: '1. Basics', icon: Navigation },
                    { id: 'editorial', label: '2. Hero & Promo', icon: FileText },
                    { id: 'narrative', label: '3. Story', icon: BookOpen },
                    { id: 'howItWorks', label: '4. How It Works', icon: Sparkles },
                    { id: 'dabbaTiers', label: '5. Dabba Anatomy', icon: Layers },
                    { id: 'dishes', label: '6. Dishes', icon: UtensilsCrossed },
                    { id: 'ecoCompare', label: '7. Eco Compare', icon: Leaf },
                    { id: 'neighbourhoods', label: '8. Areas', icon: Building2 },
                    { id: 'reviews', label: '9. Reviews', icon: Star },
                    { id: 'highlights', label: '10. Highlights', icon: ShieldCheck },
                    { id: 'faqs', label: '11. FAQs', icon: HelpCircle },
                    { id: 'finalCTA', label: '12. Final CTA', icon: ArrowUpRight },
                    { id: 'footer', label: '13. Footer', icon: Layers },
                    { id: 'seo', label: '14. SEO', icon: Globe },
                  ].map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeSubTab === tab.id;
                    return (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => setActiveSubTab(tab.id as SubTabType)}
                        className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
                          isActive
                            ? 'bg-[#1E3B2B] text-white shadow-xs'
                            : 'bg-stone-50 text-stone-600 hover:bg-stone-100 hover:text-stone-900 border border-stone-200'
                        }`}
                      >
                        <Icon size={13} className={isActive ? 'text-[#C39B54]' : 'text-stone-400'} />
                        <span>{tab.label}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Sub-Tab 1: Basics & Route Coverage */}
                {activeSubTab === 'basics' && (
                  <div className="bg-white p-5 sm:p-6 rounded-3xl border border-border shadow-xs space-y-5">
                    <div className="flex items-center justify-between border-b border-border pb-3">
                      <div>
                        <h2 className="text-base font-extrabold text-foreground">
                          Route Identity &amp; Active Postcodes ({currentLocation.name})
                        </h2>
                        <p className="text-xs text-muted-foreground">
                          Configure outward postcodes and core delivery routing for this London sector.
                        </p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer shrink-0">
                        <input
                          type="checkbox"
                          checked={Boolean(currentLocation.active)}
                          onChange={(e) => updateCurrentLocation('active', e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#1E3B2B]"></div>
                        <span className="ml-2 text-xs font-bold text-gray-700">
                          {currentLocation.active ? 'Live' : 'Hidden'}
                        </span>
                      </label>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div>
                        <label className="block text-gray-700 font-bold mb-1">Region Display Name</label>
                        <input
                          type="text"
                          value={currentLocation.name || ''}
                          onChange={(e) => updateCurrentLocation('name', e.target.value)}
                          className="w-full p-2.5 rounded-xl border border-gray-300 font-bold"
                        />
                      </div>

                      <div>
                        <label className="block text-gray-700 font-bold mb-1">URL Slug</label>
                        <input
                          type="text"
                          value={currentLocation.slug || ''}
                          onChange={(e) => updateCurrentLocation('slug', e.target.value)}
                          className="w-full p-2.5 rounded-xl border border-gray-300 font-mono"
                        />
                      </div>

                      <div>
                        <label className="block text-gray-700 font-bold mb-1">Region Code</label>
                        <input
                          type="text"
                          value={currentLocation.regionCode || ''}
                          onChange={(e) => updateCurrentLocation('regionCode', e.target.value)}
                          className="w-full p-2.5 rounded-xl border border-gray-300 font-mono font-bold"
                        />
                      </div>

                      <div>
                        <label className="block text-gray-700 font-bold mb-1">Sample Postcode</label>
                        <input
                          type="text"
                          value={currentLocation.samplePostcode || ''}
                          onChange={(e) => updateCurrentLocation('samplePostcode', e.target.value)}
                          className="w-full p-2.5 rounded-xl border border-gray-300 font-mono"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">Route Badge Pill</label>
                      <input
                        type="text"
                        value={currentLocation.badge || ''}
                        onChange={(e) => updateCurrentLocation('badge', e.target.value)}
                        className="w-full p-2.5 rounded-xl border border-gray-300 text-xs"
                        placeholder="e.g. West London Tiffin Route"
                      />
                    </div>

                    {/* Supported Postcode Sectors */}
                    <div className="pt-2 border-t border-border space-y-3">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div>
                          <h3 className="text-sm font-bold text-gray-900">Supported Outward Postcodes</h3>
                          <p className="text-xs text-muted-foreground">
                            {currentLocation.supportedPostcodes.length} outward codes served
                          </p>
                        </div>

                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={newPostcodeInput || ''}
                            onChange={(e) => setNewPostcodeInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddPostcode())}
                            placeholder="e.g. W14"
                            className="p-2 rounded-xl border border-gray-300 text-xs uppercase font-mono w-24"
                          />
                          <button
                            type="button"
                            onClick={handleAddPostcode}
                            className="px-3 py-2 rounded-xl bg-[#1E3B2B] text-white text-xs font-bold hover:bg-[#284f3a] cursor-pointer"
                          >
                            + Add
                          </button>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2 p-3 rounded-2xl bg-gray-50 border border-border max-h-48 overflow-y-auto">
                        {currentLocation.supportedPostcodes.map((code) => (
                          <span
                            key={code}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-white border border-gray-300 shadow-2xs text-xs font-mono font-bold text-gray-800"
                          >
                            <span>{code}</span>
                            <button
                              type="button"
                              onClick={() => handleRemovePostcode(code)}
                              className="text-gray-400 hover:text-red-600 transition-colors cursor-pointer"
                              title="Remove postcode"
                            >
                              <X size={12} />
                            </button>
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Sub-Tab 2: Hero & Visuals */}
                {activeSubTab === 'editorial' && (
                  <div className="bg-white p-5 sm:p-6 rounded-3xl border border-border shadow-xs space-y-5">
                    <div>
                      <h2 className="text-base font-extrabold text-foreground">
                        Hero Visuals &amp; Banner Content ({currentLocation.name})
                      </h2>
                      <p className="text-xs text-muted-foreground">
                        Main hero headline, subheadline, marquee announcements, featured dish card, and visual banner imagery.
                      </p>
                    </div>

                    <div className="space-y-4 text-xs">
                      {/* Marquee Promo Announcements */}
                      <div className="p-4 bg-gray-50 rounded-2xl border border-border space-y-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="font-bold text-gray-900 block text-xs">
                              Marquee Announcement Bar ({(currentLocation.promoBarItems || []).length} Items)
                            </span>
                            <p className="text-[11px] text-muted-foreground">
                              Live scrolling banner announcements above the header.
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={handleAddPromoItem}
                            className="px-2.5 py-1.5 rounded-xl bg-[#1E3B2B] text-white text-[11px] font-bold hover:bg-[#284f3a] transition-all flex items-center gap-1 cursor-pointer"
                          >
                            <Plus size={12} />
                            <span>Add Item</span>
                          </button>
                        </div>
                        <div className="space-y-2">
                          {(currentLocation.promoBarItems || []).map((item, pIdx) => (
                            <div key={pIdx} className="flex items-center gap-2">
                              <input
                                type="text"
                                value={item || ''}
                                onChange={(e) => handleUpdatePromoItem(pIdx, e.target.value)}
                                className="flex-1 p-2 rounded-lg border border-gray-300 bg-white text-xs font-semibold"
                              />
                              <button
                                type="button"
                                onClick={() => handleRemovePromoItem(pIdx)}
                                className="p-2 rounded-lg text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
                                title="Delete announcement"
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div className="sm:col-span-1">
                          <label className="block text-gray-700 font-bold mb-1">Route Badge Pill</label>
                          <input
                            type="text"
                            value={currentLocation.badge || ''}
                            onChange={(e) => updateCurrentLocation('badge', e.target.value)}
                            placeholder="West London Tiffin Route"
                            className="w-full p-2.5 rounded-xl border border-gray-300 text-xs font-bold focus:ring-2 focus:ring-[#1E3B2B] outline-none"
                          />
                        </div>
                        <div className="sm:col-span-2">
                          <label className="block text-gray-700 font-bold mb-1">Headline (H1)</label>
                          <input
                            type="text"
                            value={currentLocation.headline || ''}
                            onChange={(e) => updateCurrentLocation('headline', e.target.value)}
                            className="w-full p-2.5 rounded-xl border border-gray-300 text-xs font-bold focus:ring-2 focus:ring-[#1E3B2B] outline-none"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-gray-700 font-bold mb-1">Subheadline</label>
                        <textarea
                          rows={2}
                          value={currentLocation.subheadline || ''}
                          onChange={(e) => updateCurrentLocation('subheadline', e.target.value)}
                          className="w-full p-2.5 rounded-xl border border-gray-300 text-xs focus:ring-2 focus:ring-[#1E3B2B] outline-none leading-relaxed"
                        />
                      </div>

                      {/* Featured Hero Dish Card Configuration */}
                      <div className="p-4 bg-gray-50 rounded-2xl border border-border space-y-3">
                        <span className="font-bold text-gray-900 block text-xs">
                          Featured Hero Dish Showcase
                        </span>
                        <div className="space-y-3">
                          <div>
                            <label className="block text-gray-500 text-[10px] uppercase font-bold mb-0.5">
                              Hero Dish Name
                            </label>
                            <input
                              type="text"
                              value={currentLocation.heroDishName || ''}
                              onChange={(e) => updateCurrentLocation('heroDishName', e.target.value)}
                              className="w-full p-2 rounded-lg border border-gray-300 bg-white text-xs font-bold"
                            />
                          </div>

                          <div>
                            <LocationImagePicker
                              label="Hero Centerpiece Photography"
                              value={currentLocation.heroImage || ''}
                              onChange={(newPath) => updateCurrentLocation('heroImage', newPath)}
                              helperText="High-res centerpiece dish photo displayed in the hero section"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-gray-500 text-[10px] uppercase font-bold mb-0.5">
                            Hero Image Alt Text
                          </label>
                          <input
                            type="text"
                            value={currentLocation.heroImageAlt || ''}
                            onChange={(e) => updateCurrentLocation('heroImageAlt', e.target.value)}
                            className="w-full p-2 rounded-lg border border-gray-300 bg-white text-xs"
                          />
                        </div>

                        <div>
                          <label className="block text-gray-500 text-[10px] uppercase font-bold mb-0.5">
                            Hero Dish Tags (comma-separated)
                          </label>
                          <input
                            type="text"
                            value={(currentLocation.heroDishTags || []).join(', ')}
                            onChange={(e) =>
                              updateCurrentLocation(
                                'heroDishTags',
                                e.target.value.split(',').map((t) => t.trim()).filter(Boolean)
                              )
                            }
                            className="w-full p-2 rounded-lg border border-gray-300 bg-white text-xs font-mono"
                          />
                        </div>

                        {/* Dish Card Overlays & Floating Badges */}
                        <div className="pt-2 border-t border-border space-y-3">
                          <span className="font-bold text-gray-900 block text-xs">
                            Dish Image Overlays &amp; Floating Badges
                          </span>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                            <div>
                              <label className="block text-gray-600 font-bold mb-1">Overlaid Dish Badge</label>
                              <input
                                type="text"
                                value={currentLocation.heroDishBadge || ''}
                                onChange={(e) => updateCurrentLocation('heroDishBadge', e.target.value)}
                                placeholder={`Signature Feast in ${currentLocation.name}`}
                                className="w-full p-2 rounded-lg border border-gray-300 bg-white text-xs font-bold"
                              />
                            </div>
                            <div>
                              <label className="block text-gray-600 font-bold mb-1">Overlaid Dish Sub-Badge</label>
                              <input
                                type="text"
                                value={currentLocation.heroDishSubBadge || ''}
                                onChange={(e) => updateCurrentLocation('heroDishSubBadge', e.target.value)}
                                placeholder="Freshly Cooked Daily"
                                className="w-full p-2 rounded-lg border border-gray-300 bg-white text-xs"
                              />
                            </div>

                            <div className="p-3 bg-white rounded-xl border border-gray-200 space-y-2">
                              <span className="text-[10px] font-bold text-[#C39B54] uppercase tracking-wider block">Floating Badge 1 (Top Right)</span>
                              <div>
                                <label className="block text-gray-500 text-[10px] font-bold mb-0.5">Title</label>
                                <input
                                  type="text"
                                  value={currentLocation.heroFloat1Title || ''}
                                  onChange={(e) => updateCurrentLocation('heroFloat1Title', e.target.value)}
                                  placeholder="Mon &amp; Thu Batches"
                                  className="w-full p-1.5 rounded-lg border border-gray-300 text-xs font-bold"
                                />
                              </div>
                              <div>
                                <label className="block text-gray-500 text-[10px] font-bold mb-0.5">Subtitle</label>
                                <input
                                  type="text"
                                  value={currentLocation.heroFloat1Sub || ''}
                                  onChange={(e) => updateCurrentLocation('heroFloat1Sub', e.target.value)}
                                  placeholder="Chilled Cold-Pack"
                                  className="w-full p-1.5 rounded-lg border border-gray-300 text-xs"
                                />
                              </div>
                            </div>

                            <div className="p-3 bg-white rounded-xl border border-gray-200 space-y-2">
                              <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider block">Floating Badge 2 (Bottom Left)</span>
                              <div>
                                <label className="block text-gray-500 text-[10px] font-bold mb-0.5">Title</label>
                                <input
                                  type="text"
                                  value={currentLocation.heroFloat2Title || ''}
                                  onChange={(e) => updateCurrentLocation('heroFloat2Title', e.target.value)}
                                  placeholder="Zero Plastic Dabbas"
                                  className="w-full p-1.5 rounded-lg border border-gray-300 text-xs font-bold"
                                />
                              </div>
                              <div>
                                <label className="block text-gray-500 text-[10px] font-bold mb-0.5">Subtitle</label>
                                <input
                                  type="text"
                                  value={currentLocation.heroFloat2Sub || ''}
                                  onChange={(e) => updateCurrentLocation('heroFloat2Sub', e.target.value)}
                                  placeholder="Free Packaging Swap"
                                  className="w-full p-1.5 rounded-lg border border-gray-300 text-xs"
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Postcode Box, CTAs & Trust Badges Configuration */}
                      <div className="p-4 bg-gray-50 rounded-2xl border border-border space-y-3">
                        <span className="font-bold text-gray-900 block text-xs">
                          Postcode Availability Bar &amp; Hero Action Buttons
                        </span>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                          <div>
                            <label className="block text-gray-600 font-bold mb-1">Postcode Box Heading</label>
                            <input
                              type="text"
                              value={currentLocation.heroPostcodeTitle || ''}
                              onChange={(e) => updateCurrentLocation('heroPostcodeTitle', e.target.value)}
                              placeholder={`Check ${currentLocation.name} Postcode Availability`}
                              className="w-full p-2.5 rounded-xl border border-gray-300 bg-white font-bold"
                            />
                          </div>
                          <div>
                            <label className="block text-gray-600 font-bold mb-1">Active Postcodes Badge Pill</label>
                            <input
                              type="text"
                              value={currentLocation.heroPostcodeBadge || ''}
                              onChange={(e) => updateCurrentLocation('heroPostcodeBadge', e.target.value)}
                              placeholder={`${currentLocation.supportedPostcodes.length}+ Active Postcodes`}
                              className="w-full p-2.5 rounded-xl border border-gray-300 bg-white text-xs"
                            />
                          </div>

                          <div>
                            <label className="block text-gray-600 font-bold mb-1">Check Button Text</label>
                            <input
                              type="text"
                              value={currentLocation.heroPostcodeBtnText || ''}
                              onChange={(e) => updateCurrentLocation('heroPostcodeBtnText', e.target.value)}
                              placeholder="Check Route"
                              className="w-full p-2.5 rounded-xl border border-gray-300 bg-white font-bold"
                            />
                          </div>
                          <div>
                            <label className="block text-gray-600 font-bold mb-1">Verified Routes Footnote</label>
                            <input
                              type="text"
                              value={currentLocation.heroPostcodeNote || ''}
                              onChange={(e) => updateCurrentLocation('heroPostcodeNote', e.target.value)}
                              placeholder={`Verified routes in ${currentLocation.name}: ${currentLocation.supportedPostcodes.slice(0, 7).join(', ')}...`}
                              className="w-full p-2.5 rounded-xl border border-gray-300 bg-white text-xs"
                            />
                          </div>
                        </div>

                        {/* Hero Primary and Secondary Buttons */}
                        <div className="pt-2 border-t border-border grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                          <div className="space-y-2 p-3 bg-white rounded-xl border border-gray-200">
                            <span className="text-[10px] font-bold text-[#C39B54] uppercase tracking-wider block">Primary CTA Button</span>
                            <div>
                              <label className="block text-gray-500 text-[10px] font-bold mb-0.5">Button Label</label>
                              <input
                                type="text"
                                value={currentLocation.heroPrimaryBtnText || ''}
                                onChange={(e) => updateCurrentLocation('heroPrimaryBtnText', e.target.value)}
                                placeholder={`Order Your ${currentLocation.shortName || currentLocation.name} Dabba Feast`}
                                className="w-full p-2 rounded-lg border border-gray-300 text-xs font-bold"
                              />
                            </div>
                            <div>
                              <label className="block text-gray-500 text-[10px] font-bold mb-0.5">Button Target Link</label>
                              <input
                                type="text"
                                value={currentLocation.heroPrimaryBtnLink || ''}
                                onChange={(e) => updateCurrentLocation('heroPrimaryBtnLink', e.target.value)}
                                placeholder="#menu"
                                className="w-full p-2 rounded-lg border border-gray-300 text-xs font-mono"
                              />
                            </div>
                          </div>

                          <div className="space-y-2 p-3 bg-white rounded-xl border border-gray-200">
                            <span className="text-[10px] font-bold text-gray-600 uppercase tracking-wider block">Secondary CTA Button</span>
                            <div>
                              <label className="block text-gray-500 text-[10px] font-bold mb-0.5">Button Label</label>
                              <input
                                type="text"
                                value={currentLocation.heroSecondaryBtnText || ''}
                                onChange={(e) => updateCurrentLocation('heroSecondaryBtnText', e.target.value)}
                                placeholder="How Dabba Swapping Works"
                                className="w-full p-2 rounded-lg border border-gray-300 text-xs font-bold"
                              />
                            </div>
                            <div>
                              <label className="block text-gray-500 text-[10px] font-bold mb-0.5">Button Target Link</label>
                              <input
                                type="text"
                                value={currentLocation.heroSecondaryBtnLink || ''}
                                onChange={(e) => updateCurrentLocation('heroSecondaryBtnLink', e.target.value)}
                                placeholder="#how-it-works"
                                className="w-full p-2 rounded-lg border border-gray-300 text-xs font-mono"
                              />
                            </div>
                          </div>
                        </div>

                        {/* Trust Badges */}
                        <div className="pt-2 border-t border-border grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                          <div>
                            <label className="block text-gray-600 font-bold mb-1">Rating Trust Badge Text</label>
                            <input
                              type="text"
                              value={currentLocation.heroRatingText || ''}
                              onChange={(e) => updateCurrentLocation('heroRatingText', e.target.value)}
                              placeholder="1,200+ Londoners Fed"
                              className="w-full p-2 rounded-lg border border-gray-300 bg-white text-xs"
                            />
                          </div>
                          <div>
                            <label className="block text-gray-600 font-bold mb-1">Hygiene Trust Badge Text</label>
                            <input
                              type="text"
                              value={currentLocation.heroHygieneText || ''}
                              onChange={(e) => updateCurrentLocation('heroHygieneText', e.target.value)}
                              placeholder="Council 5-Star Food Hygiene"
                              className="w-full p-2 rounded-lg border border-gray-300 bg-white text-xs"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Sub-Tab 3: Brand Philosophy & Narrative */}
                {activeSubTab === 'narrative' && (
                  <div className="bg-white p-5 sm:p-6 rounded-3xl border border-border shadow-xs space-y-4">
                    <div className="flex items-center justify-between border-b border-border pb-3">
                      <div>
                        <h2 className="text-base font-extrabold text-foreground">
                          Brand Story &amp; Food Philosophy ({currentLocation.introParagraphs.length} Paragraphs)
                        </h2>
                        <p className="text-xs text-muted-foreground">
                          Rendered in the editorial story section with artisanal serif typography.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={handleAddParagraph}
                        className="px-3.5 py-2 rounded-xl bg-[#1E3B2B] text-white text-xs font-bold hover:bg-[#284f3a] transition-all flex items-center gap-1.5 cursor-pointer"
                      >
                        <Plus size={14} />
                        <span>Add Paragraph</span>
                      </button>
                    </div>

                    {/* Big Editorial Pull Quote, Subtitle & Badge */}
                    <div className="p-4 bg-gray-50 rounded-2xl border border-border space-y-3">
                      <span className="font-bold text-gray-900 block text-xs">
                        Editorial Badge, Pull Quote &amp; Subtitle
                      </span>
                      <div>
                        <label className="block text-gray-600 text-xs font-bold mb-1">
                          Story Section Badge
                        </label>
                        <input
                          type="text"
                          value={currentLocation.storyConfig?.badge || ''}
                          onChange={(e) => updateStoryConfig('badge', e.target.value)}
                          placeholder="Our Food Philosophy"
                          className="w-full p-2.5 rounded-xl border border-gray-300 bg-white text-xs font-bold"
                        />
                      </div>
                      <div>
                        <label className="block text-gray-600 text-xs font-bold mb-1">
                          Prominent Pull Quote
                        </label>
                        <input
                          type="text"
                          value={currentLocation.storyConfig?.quote || ''}
                          onChange={(e) => updateStoryConfig('quote', e.target.value)}
                          placeholder="e.g. “Real Indian home cooking that nurtures your health and respects London’s environment.”"
                          className="w-full p-2.5 rounded-xl border border-gray-300 bg-white text-xs font-semibold"
                        />
                      </div>
                      <div>
                        <label className="block text-gray-600 text-xs font-bold mb-1">
                          Quote Sub-headline / Credit
                        </label>
                        <input
                          type="text"
                          value={currentLocation.storyConfig?.quoteSub || ''}
                          onChange={(e) => updateStoryConfig('quoteSub', e.target.value)}
                          placeholder={`Crafted in London by 21-year culinary masters · Delivered fresh across ${currentLocation.name}.`}
                          className="w-full p-2.5 rounded-xl border border-gray-300 bg-white text-xs"
                        />
                      </div>
                    </div>

                    <div className="space-y-3">
                      {currentLocation.introParagraphs.map((para, pIdx) => (
                        <div key={pIdx} className="p-4 rounded-2xl bg-gray-50 border border-border space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold text-gray-400 font-mono">
                              PARAGRAPH #{pIdx + 1}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleRemoveParagraph(pIdx)}
                              className="p-1 rounded-lg text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
                              title="Delete Paragraph"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                          <textarea
                            rows={3}
                            value={para || ''}
                            onChange={(e) => handleUpdateParagraph(pIdx, e.target.value)}
                            className="w-full p-2.5 rounded-xl border border-gray-300 bg-white text-xs leading-relaxed"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Sub-Tab 4: How It Works Ritual Steps */}
                {activeSubTab === 'howItWorks' && (
                  <div className="bg-white p-5 sm:p-6 rounded-3xl border border-border shadow-xs space-y-5">
                    <div className="flex items-center justify-between border-b border-border pb-3">
                      <div>
                        <h2 className="text-base font-extrabold text-foreground">
                          How DoMeal Works Ritual ({(currentLocation.howItWorksSteps || []).length} Steps)
                        </h2>
                        <p className="text-xs text-muted-foreground">
                          Illustrated step-by-step cooking, chilled delivery, and circular dabba return ritual.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={handleAddHowItWorksStep}
                        className="px-3.5 py-2 rounded-xl bg-[#1E3B2B] text-white text-xs font-bold hover:bg-[#284f3a] transition-all flex items-center gap-1.5 cursor-pointer"
                      >
                        <Plus size={14} />
                        <span>Add Step</span>
                      </button>
                    </div>

                    {/* Section Header Controls */}
                    <div className="p-4 bg-gray-50 rounded-2xl border border-border space-y-3">
                      <span className="font-bold text-gray-900 block text-xs">
                        Section Header, Badge &amp; Subtitle
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                        <div>
                          <label className="block text-gray-600 font-bold mb-1">Section Badge</label>
                          <input
                            type="text"
                            value={currentLocation.howItWorksBadge || ''}
                            onChange={(e) => updateCurrentLocation('howItWorksBadge', e.target.value)}
                            placeholder="The Zero-Waste Homestyle Ritual"
                            className="w-full p-2.5 rounded-xl border border-gray-300 bg-white font-bold"
                          />
                        </div>
                        <div>
                          <label className="block text-gray-600 font-bold mb-1">Section Title</label>
                          <input
                            type="text"
                            value={currentLocation.howItWorksTitle || ''}
                            onChange={(e) => updateCurrentLocation('howItWorksTitle', e.target.value)}
                            placeholder="How DoMeal Works"
                            className="w-full p-2.5 rounded-xl border border-gray-300 bg-white font-bold"
                          />
                        </div>
                        <div className="sm:col-span-2">
                          <label className="block text-gray-600 font-bold mb-1">Section Subtitle</label>
                          <textarea
                            rows={2}
                            value={currentLocation.howItWorksSubtitle || ''}
                            onChange={(e) => updateCurrentLocation('howItWorksSubtitle', e.target.value)}
                            placeholder="Authentic homestyle Indian feasting, reusable stainless steel tiffins, and zero single-use plastics."
                            className="w-full p-2.5 rounded-xl border border-gray-300 bg-white text-xs"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      {(currentLocation.howItWorksSteps || []).map((step, sIdx) => (
                        <div key={sIdx} className="p-4 rounded-2xl bg-gray-50 border border-border space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold text-gray-500 font-mono">
                              STEP #{sIdx + 1} &bull; {step.stepNumber}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleRemoveHowItWorksStep(sIdx)}
                              className="p-1 rounded-lg text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
                              title="Delete Step"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                            <div>
                              <label className="block text-gray-600 font-bold mb-1">Step Number</label>
                              <input
                                type="text"
                                value={step.stepNumber || ''}
                                onChange={(e) => handleUpdateHowItWorksStep(sIdx, 'stepNumber', e.target.value)}
                                placeholder="01"
                                className="w-full p-2 rounded-lg border border-gray-300 bg-white font-mono font-bold"
                              />
                            </div>
                            <div>
                              <label className="block text-gray-600 font-bold mb-1">Time / Schedule Badge</label>
                              <input
                                type="text"
                                value={step.badge || ''}
                                onChange={(e) => handleUpdateHowItWorksStep(sIdx, 'badge', e.target.value)}
                                placeholder="MONDAY & THURSDAY MORNINGS"
                                className="w-full p-2 rounded-lg border border-gray-300 bg-white font-bold"
                              />
                            </div>
                            <div>
                              <label className="block text-gray-600 font-bold mb-1">Step Title</label>
                              <input
                                type="text"
                                value={step.title || ''}
                                onChange={(e) => handleUpdateHowItWorksStep(sIdx, 'title', e.target.value)}
                                placeholder="Small-Batch Scratch Cooking"
                                className="w-full p-2 rounded-lg border border-gray-300 bg-white font-bold"
                              />
                            </div>
                            <div>
                              <label className="block text-gray-600 font-bold mb-1">Highlight Pill Badge</label>
                              <input
                                type="text"
                                value={step.highlightPill || ''}
                                onChange={(e) => handleUpdateHowItWorksStep(sIdx, 'highlightPill', e.target.value)}
                                placeholder="Zero Ultra-Processed Pastes"
                                className="w-full p-2 rounded-lg border border-gray-300 bg-white"
                              />
                            </div>
                            <div className="sm:col-span-2">
                              <LocationImagePicker
                                label="Step Ritual Photography"
                                value={step.image || ''}
                                onChange={(newPath) => handleUpdateHowItWorksStep(sIdx, 'image', newPath)}
                                helperText="Visual photo for this ritual step"
                              />
                            </div>
                            <div className="sm:col-span-2">
                              <label className="block text-gray-600 font-bold mb-1">Step Description</label>
                              <textarea
                                rows={2}
                                value={step.description || ''}
                                onChange={(e) => handleUpdateHowItWorksStep(sIdx, 'description', e.target.value)}
                                className="w-full p-2 rounded-lg border border-gray-300 bg-white text-xs leading-relaxed"
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Sub-Tab 5: Dabba Feast Anatomy Layers */}
                {activeSubTab === 'dabbaTiers' && (
                  <div className="bg-white p-5 sm:p-6 rounded-3xl border border-border shadow-xs space-y-5">
                    <div className="flex items-center justify-between border-b border-border pb-3">
                      <div>
                        <h2 className="text-base font-extrabold text-foreground">
                          What&apos;s Inside Your Dabba ({(currentLocation.dabbaTiers || []).length} Tiers)
                        </h2>
                        <p className="text-xs text-muted-foreground">
                          Anatomy of a Feast: Base, middle, and top tier meal breakdown.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={handleAddDabbaTier}
                        className="px-3.5 py-2 rounded-xl bg-[#1E3B2B] text-white text-xs font-bold hover:bg-[#284f3a] transition-all flex items-center gap-1.5 cursor-pointer"
                      >
                        <Plus size={14} />
                        <span>Add Tier</span>
                      </button>
                    </div>

                    {/* Section Header Controls */}
                    <div className="p-4 bg-gray-50 rounded-2xl border border-border space-y-3">
                      <span className="font-bold text-gray-900 block text-xs">
                        Section Header &amp; Badge
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                        <div>
                          <label className="block text-gray-600 font-bold mb-1">Section Badge</label>
                          <input
                            type="text"
                            value={currentLocation.dabbaBadge || ''}
                            onChange={(e) => updateCurrentLocation('dabbaBadge', e.target.value)}
                            placeholder="The Anatomy of a DoMeal Feast"
                            className="w-full p-2.5 rounded-xl border border-gray-300 bg-white font-bold"
                          />
                        </div>
                        <div>
                          <label className="block text-gray-600 font-bold mb-1">Section Title</label>
                          <input
                            type="text"
                            value={currentLocation.dabbaTitle || ''}
                            onChange={(e) => updateCurrentLocation('dabbaTitle', e.target.value)}
                            placeholder={`What's Inside Your ${currentLocation.name} Dabba?`}
                            className="w-full p-2.5 rounded-xl border border-gray-300 bg-white font-bold"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      {(currentLocation.dabbaTiers || []).map((tier, tIdx) => (
                        <div key={tIdx} className="p-4 rounded-2xl bg-gray-50 border border-border space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold text-gray-500 font-mono">
                              TIER LAYER #{tIdx + 1} &bull; {tier.tierNumber}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleRemoveDabbaTier(tIdx)}
                              className="p-1 rounded-lg text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
                              title="Delete Tier"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                            <div>
                              <label className="block text-gray-600 font-bold mb-1">Tier Number Label</label>
                              <input
                                type="text"
                                value={tier.tierNumber || ''}
                                onChange={(e) => handleUpdateDabbaTier(tIdx, 'tierNumber', e.target.value)}
                                placeholder="Tier 01"
                                className="w-full p-2 rounded-lg border border-gray-300 bg-white font-mono font-bold"
                              />
                            </div>
                            <div>
                              <label className="block text-gray-600 font-bold mb-1">Layer Badge</label>
                              <input
                                type="text"
                                value={tier.badge || ''}
                                onChange={(e) => handleUpdateDabbaTier(tIdx, 'badge', e.target.value)}
                                placeholder="Top Tier"
                                className="w-full p-2 rounded-lg border border-gray-300 bg-white font-bold"
                              />
                            </div>
                            <div className="sm:col-span-2">
                              <label className="block text-gray-600 font-bold mb-1">Tier Title</label>
                              <input
                                type="text"
                                value={tier.title || ''}
                                onChange={(e) => handleUpdateDabbaTier(tIdx, 'title', e.target.value)}
                                placeholder="Fresh Crisp Salads, Chutneys & Bites"
                                className="w-full p-2 rounded-lg border border-gray-300 bg-white font-bold"
                              />
                            </div>
                            <div className="sm:col-span-2">
                              <label className="block text-gray-600 font-bold mb-1">Subtitle / Dish Summary</label>
                              <input
                                type="text"
                                value={tier.subtitle || ''}
                                onChange={(e) => handleUpdateDabbaTier(tIdx, 'subtitle', e.target.value)}
                                placeholder="Sprouted mung beans, shredded carrot kachumber..."
                                className="w-full p-2 rounded-lg border border-gray-300 bg-white"
                              />
                            </div>
                            <div className="sm:col-span-2">
                              <label className="block text-gray-600 font-bold mb-1">Nutrition &amp; Digestive Highlight</label>
                              <input
                                type="text"
                                value={tier.highlight || ''}
                                onChange={(e) => handleUpdateDabbaTier(tIdx, 'highlight', e.target.value)}
                                placeholder="High Fibre · Raw Enzymes · Zero Oil Dressing"
                                className="w-full p-2 rounded-lg border border-gray-300 bg-white"
                              />
                            </div>
                            <div className="sm:col-span-2">
                              <label className="block text-gray-600 font-bold mb-1">Culinary Description</label>
                              <textarea
                                rows={2}
                                value={tier.desc || ''}
                                onChange={(e) => handleUpdateDabbaTier(tIdx, 'desc', e.target.value)}
                                className="w-full p-2 rounded-lg border border-gray-300 bg-white text-xs leading-relaxed"
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Sub-Tab 6: Signature Dishes & Menu Showcase */}
                {activeSubTab === 'dishes' && (
                  <div className="bg-white p-5 sm:p-6 rounded-3xl border border-border shadow-xs space-y-4">
                    <div className="flex items-center justify-between border-b border-border pb-3">
                      <div>
                        <h2 className="text-base font-extrabold text-foreground">
                          Signature Feasts Showcase ({(currentLocation.featuredDishes || []).length} Cards)
                        </h2>
                        <p className="text-xs text-muted-foreground">
                          Real dishes rendered in the 4-card signature dishes carousel for this corridor.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={handleAddDish}
                        className="px-3.5 py-2 rounded-xl bg-[#1E3B2B] text-white text-xs font-bold hover:bg-[#284f3a] transition-all flex items-center gap-1.5 cursor-pointer"
                      >
                        <Plus size={14} />
                        <span>Add Feast Card</span>
                      </button>
                    </div>

                    {/* Section Header Controls */}
                    <div className="p-4 bg-gray-50 rounded-2xl border border-border space-y-3">
                      <span className="font-bold text-gray-900 block text-xs">
                        Section Header, Badge &amp; Subtitle
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                        <div>
                          <label className="block text-gray-600 font-bold mb-1">Section Badge</label>
                          <input
                            type="text"
                            value={currentLocation.dishesBadge || ''}
                            onChange={(e) => updateCurrentLocation('dishesBadge', e.target.value)}
                            placeholder="Chef's London Selection"
                            className="w-full p-2.5 rounded-xl border border-gray-300 bg-white font-bold"
                          />
                        </div>
                        <div>
                          <label className="block text-gray-600 font-bold mb-1">Section Title</label>
                          <input
                            type="text"
                            value={currentLocation.dishesTitle || ''}
                            onChange={(e) => updateCurrentLocation('dishesTitle', e.target.value)}
                            placeholder={`Signature Feasts on This Week's ${currentLocation.name} Menu`}
                            className="w-full p-2.5 rounded-xl border border-gray-300 bg-white font-bold"
                          />
                        </div>
                        <div className="sm:col-span-2">
                          <label className="block text-gray-600 font-bold mb-1">Section Subtitle</label>
                          <textarea
                            rows={2}
                            value={currentLocation.dishesSubtitle || ''}
                            onChange={(e) => updateCurrentLocation('dishesSubtitle', e.target.value)}
                            placeholder="Every dish is prepared fresh on delivery mornings in our commercial kitchen. No commercial pastes, no artificial thickeners, and no single-use plastic takeaway tubs."
                            className="w-full p-2.5 rounded-xl border border-gray-300 bg-white text-xs"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      {(currentLocation.featuredDishes || []).map((dish, dIdx) => (
                        <div
                          key={dIdx}
                          className="p-4 rounded-2xl bg-gray-50 border border-border space-y-3"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold text-gray-400 font-mono">
                              FEAST #{dIdx + 1}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleRemoveDish(dIdx)}
                              className="p-1 rounded-lg text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
                              title="Delete Feast"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                            <div>
                              <label className="block text-gray-600 font-bold mb-1">Dish Title</label>
                              <input
                                type="text"
                                value={dish.title || ''}
                                onChange={(e) => handleUpdateDish(dIdx, 'title', e.target.value)}
                                className="w-full p-2 rounded-lg border border-gray-300 bg-white font-bold"
                              />
                            </div>

                            <div className="sm:col-span-2">
                              <LocationImagePicker
                                label="Feast Dish Photography"
                                value={dish.image || ''}
                                onChange={(newPath) => handleUpdateDish(dIdx, 'image', newPath)}
                                helperText="Photograph rendered on this signature feast card"
                              />
                            </div>

                            <div>
                              <label className="block text-gray-600 font-bold mb-1">Nutrition Badge</label>
                              <input
                                type="text"
                                value={dish.nutritionBadge || ''}
                                onChange={(e) => handleUpdateDish(dIdx, 'nutritionBadge', e.target.value)}
                                className="w-full p-2 rounded-lg border border-gray-300 bg-white text-xs"
                                placeholder="High Protein · Ancient Millets"
                              />
                            </div>

                            <div>
                              <label className="block text-gray-600 font-bold mb-1">Tags (comma-separated)</label>
                              <input
                                type="text"
                                value={(dish.tags || []).join(', ')}
                                onChange={(e) =>
                                  handleUpdateDish(
                                    dIdx,
                                    'tags',
                                    e.target.value.split(',').map((t) => t.trim()).filter(Boolean)
                                  )
                                }
                                className="w-full p-2 rounded-lg border border-gray-300 bg-white text-xs font-mono"
                                placeholder="Vegan, High Fibre, Millets"
                              />
                            </div>

                            <div className="sm:col-span-2">
                              <label className="block text-gray-600 font-bold mb-1">Description</label>
                              <textarea
                                rows={2}
                                value={dish.description || ''}
                                onChange={(e) => handleUpdateDish(dIdx, 'description', e.target.value)}
                                className="w-full p-2 rounded-lg border border-gray-300 bg-white text-xs"
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Sub-Tab 7: Commercial Takeaway vs. DoMeal Eco Comparison */}
                {activeSubTab === 'ecoCompare' && (
                  <div className="bg-white p-5 sm:p-6 rounded-3xl border border-border shadow-xs space-y-5">
                    <div className="border-b border-border pb-3">
                      <h2 className="text-base font-extrabold text-foreground">
                        Sustainability &amp; Health Comparison (Takeaway vs. DoMeal)
                      </h2>
                      <p className="text-xs text-muted-foreground">
                        Direct side-by-side comparison matrix highlighting zero plastic waste and home cooking.
                      </p>
                    </div>

                    <div className="space-y-4 text-xs">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-gray-700 font-bold mb-1">Section Badge</label>
                          <input
                            type="text"
                            value={currentLocation.ecoComparison?.badge || ''}
                            onChange={(e) => updateEcoComparison('badge', e.target.value)}
                            placeholder="A Better Way to Eat in London"
                            className="w-full p-2.5 rounded-xl border border-gray-300 font-bold"
                          />
                        </div>
                        <div>
                          <label className="block text-gray-700 font-bold mb-1">Section Title</label>
                          <input
                            type="text"
                            value={currentLocation.ecoComparison?.title || ''}
                            onChange={(e) => updateEcoComparison('title', e.target.value)}
                            placeholder="Commercial Takeaway vs. DoMeal Dabba"
                            className="w-full p-2.5 rounded-xl border border-gray-300 font-bold"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-gray-700 font-bold mb-1">Section Subtitle</label>
                        <textarea
                          rows={2}
                          value={currentLocation.ecoComparison?.subtitle || ''}
                          onChange={(e) => updateEcoComparison('subtitle', e.target.value)}
                          className="w-full p-2.5 rounded-xl border border-gray-300 text-xs leading-relaxed"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                        {/* Takeaway Column */}
                        <div className="p-4 rounded-2xl bg-red-50/50 border border-red-200/60 space-y-3">
                          <div className="flex items-center justify-between">
                            <div>
                              <span className="font-bold text-red-900 block text-xs">Commercial Takeaway</span>
                              <span className="text-[10px] text-red-600">
                                {(currentLocation.ecoComparison?.takeawayPoints || []).length} negative points
                              </span>
                            </div>
                            <button
                              type="button"
                              onClick={handleAddTakeawayPoint}
                              className="px-2 py-1 rounded-lg bg-red-800 text-white text-[11px] font-bold hover:bg-red-900 cursor-pointer"
                            >
                              + Add
                            </button>
                          </div>

                          {/* Takeaway Card Headings */}
                          <div className="space-y-2 pt-1 border-t border-red-200/60">
                            <div>
                              <label className="block text-red-900/80 font-bold text-[11px] mb-0.5">Card Badge</label>
                              <input
                                type="text"
                                value={currentLocation.ecoComparison?.takeawayBadge || ''}
                                onChange={(e) => updateEcoComparison('takeawayBadge', e.target.value)}
                                placeholder="The Outdated Way"
                                className="w-full p-2 rounded-lg border border-red-300 bg-white text-xs font-bold"
                              />
                            </div>
                            <div>
                              <label className="block text-red-900/80 font-bold text-[11px] mb-0.5">Card Title</label>
                              <input
                                type="text"
                                value={currentLocation.ecoComparison?.takeawayTitle || ''}
                                onChange={(e) => updateEcoComparison('takeawayTitle', e.target.value)}
                                placeholder="Commercial Takeaway"
                                className="w-full p-2 rounded-lg border border-red-300 bg-white text-xs font-bold"
                              />
                            </div>
                          </div>

                          <div className="space-y-2 pt-1">
                            <span className="text-[10px] font-bold text-red-900/70 uppercase tracking-wider block">Negative Points</span>
                            {(currentLocation.ecoComparison?.takeawayPoints || []).map((point, ptIdx) => (
                              <div key={ptIdx} className="flex items-start gap-1.5">
                                <input
                                  type="text"
                                  value={point || ''}
                                  onChange={(e) => handleUpdateTakeawayPoint(ptIdx, e.target.value)}
                                  className="flex-1 p-2 rounded-lg border border-red-300 bg-white text-xs"
                                />
                                <button
                                  type="button"
                                  onClick={() => handleRemoveTakeawayPoint(ptIdx)}
                                  className="p-1.5 rounded-lg text-red-500 hover:bg-red-100 cursor-pointer"
                                  title="Delete point"
                                >
                                  <Trash2 size={13} />
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* DoMeal Column */}
                        <div className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-200/60 space-y-3">
                          <div className="flex items-center justify-between">
                            <div>
                              <span className="font-bold text-emerald-950 block text-xs">DoMeal Reusable Dabba</span>
                              <span className="text-[10px] text-emerald-700">
                                {(currentLocation.ecoComparison?.domealPoints || []).length} positive benefits
                              </span>
                            </div>
                            <button
                              type="button"
                              onClick={handleAddDomealPoint}
                              className="px-2 py-1 rounded-lg bg-[#1E3B2B] text-white text-[11px] font-bold hover:bg-[#284f3a] cursor-pointer"
                            >
                              + Add
                            </button>
                          </div>

                          {/* DoMeal Card Headings */}
                          <div className="space-y-2 pt-1 border-t border-emerald-200/60">
                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <label className="block text-emerald-950 font-bold text-[11px] mb-0.5">Top Choice Pill</label>
                                <input
                                  type="text"
                                  value={currentLocation.ecoComparison?.domealTopBadge || ''}
                                  onChange={(e) => updateEcoComparison('domealTopBadge', e.target.value)}
                                  placeholder="The Sustainable Choice"
                                  className="w-full p-2 rounded-lg border border-emerald-300 bg-white text-xs font-bold"
                                />
                              </div>
                              <div>
                                <label className="block text-emerald-950 font-bold text-[11px] mb-0.5">Card Sub-Badge</label>
                                <input
                                  type="text"
                                  value={currentLocation.ecoComparison?.domealBadge || ''}
                                  onChange={(e) => updateEcoComparison('domealBadge', e.target.value)}
                                  placeholder="The DoMeal Way"
                                  className="w-full p-2 rounded-lg border border-emerald-300 bg-white text-xs font-bold"
                                />
                              </div>
                            </div>
                            <div>
                              <label className="block text-emerald-950 font-bold text-[11px] mb-0.5">Card Title</label>
                              <input
                                type="text"
                                value={currentLocation.ecoComparison?.domealTitle || ''}
                                onChange={(e) => updateEcoComparison('domealTitle', e.target.value)}
                                placeholder="DoMeal Reusable Dabba"
                                className="w-full p-2 rounded-lg border border-emerald-300 bg-white text-xs font-bold"
                              />
                            </div>
                          </div>

                          <div className="space-y-2 pt-1">
                            <span className="text-[10px] font-bold text-emerald-900/70 uppercase tracking-wider block">Positive Points</span>
                            {(currentLocation.ecoComparison?.domealPoints || []).map((point, ptIdx) => (
                              <div key={ptIdx} className="flex items-start gap-1.5">
                                <input
                                  type="text"
                                  value={point || ''}
                                  onChange={(e) => handleUpdateDomealPoint(ptIdx, e.target.value)}
                                  className="flex-1 p-2 rounded-lg border border-emerald-300 bg-white text-xs"
                                />
                                <button
                                  type="button"
                                  onClick={() => handleRemoveDomealPoint(ptIdx)}
                                  className="p-1.5 rounded-lg text-red-500 hover:bg-emerald-100 cursor-pointer"
                                  title="Delete point"
                                >
                                  <Trash2 size={13} />
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Eco Section Bottom Action Button Text */}
                      <div className="pt-2">
                        <label className="block text-gray-700 font-bold mb-1">Bottom Action Button Text</label>
                        <input
                          type="text"
                          value={currentLocation.ecoComparison?.ctaButtonText || ''}
                          onChange={(e) => updateEcoComparison('ctaButtonText', e.target.value)}
                          placeholder={`Start Your Zero-Plastic ${currentLocation.name} Feast`}
                          className="w-full p-2.5 rounded-xl border border-gray-300 text-xs font-bold"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Sub-Tab 8: Covered Neighbourhoods Roster */}
                {activeSubTab === 'neighbourhoods' && (
                  <div className="bg-white p-5 sm:p-6 rounded-3xl border border-border shadow-xs space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-border pb-3 gap-2">
                      <div>
                        <h2 className="text-base font-extrabold text-foreground">
                          Covered Neighbourhoods Roster ({currentLocation.neighbourhoods.length} Areas)
                        </h2>
                        <p className="text-xs text-muted-foreground">
                          Rendered in the key neighbourhoods section. Automatically centered when 1 or 2 cards exist.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={handleAddNeighbourhood}
                        className="px-3.5 py-2 rounded-xl bg-[#1E3B2B] text-white text-xs font-bold hover:bg-[#284f3a] transition-all flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
                      >
                        <Plus size={14} />
                        <span>Add Area</span>
                      </button>
                    </div>

                    {/* Section Header Controls */}
                    <div className="p-4 bg-gray-50 rounded-2xl border border-border space-y-3">
                      <span className="font-bold text-gray-900 block text-xs">
                        Section Header, Badge &amp; Subtitle
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                        <div>
                          <label className="block text-gray-600 font-bold mb-1">Section Badge</label>
                          <input
                            type="text"
                            value={currentLocation.neighbourhoodsBadge || ''}
                            onChange={(e) => updateCurrentLocation('neighbourhoodsBadge', e.target.value)}
                            placeholder="Scheduled London Delivery Network"
                            className="w-full p-2.5 rounded-xl border border-gray-300 bg-white font-bold"
                          />
                        </div>
                        <div>
                          <label className="block text-gray-600 font-bold mb-1">Section Title</label>
                          <input
                            type="text"
                            value={currentLocation.neighbourhoodsTitle || ''}
                            onChange={(e) => updateCurrentLocation('neighbourhoodsTitle', e.target.value)}
                            placeholder="We Deliver to All London Zones 1–3"
                            className="w-full p-2.5 rounded-xl border border-gray-300 bg-white font-bold"
                          />
                        </div>
                        <div className="sm:col-span-2">
                          <label className="block text-gray-600 font-bold mb-1">Section Subtitle</label>
                          <textarea
                            rows={2}
                            value={currentLocation.neighbourhoodsSubtitle || ''}
                            onChange={(e) => updateCurrentLocation('neighbourhoodsSubtitle', e.target.value)}
                            placeholder={`From ${currentLocation.name}'s historic mews to high-rise concierge suites across London Zones 1, 2, and 3, our chilled delivery fleet brings authentic home-cooked Indian tiffins directly to your doorstep twice weekly with zero single-use plastic.`}
                            className="w-full p-2.5 rounded-xl border border-gray-300 bg-white text-xs"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      {currentLocation.neighbourhoods.map((area, aIdx) => (
                        <div
                          key={aIdx}
                          className="p-4 rounded-2xl bg-gray-50 border border-border hover:border-gray-400 transition-colors space-y-3"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-[10px] font-bold text-gray-400 font-mono">
                              AREA #{aIdx + 1}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleRemoveNeighbourhood(aIdx)}
                              className="p-1 rounded-lg text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
                              title="Delete Neighbourhood"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                            <div>
                              <label className="block text-gray-600 font-bold mb-1">Area Name</label>
                              <input
                                type="text"
                                value={area.name || ''}
                                onChange={(e) => handleUpdateNeighbourhood(aIdx, 'name', e.target.value)}
                                className="w-full p-2 rounded-lg border border-gray-300 bg-white font-bold"
                              />
                            </div>

                            <div>
                              <label className="block text-gray-600 font-bold mb-1">Postcodes Served</label>
                              <input
                                type="text"
                                value={area.postcode || ''}
                                onChange={(e) => handleUpdateNeighbourhood(aIdx, 'postcode', e.target.value)}
                                className="w-full p-2 rounded-lg border border-gray-300 bg-white font-mono font-bold"
                                placeholder="e.g. W11, W2"
                              />
                            </div>

                            <div className="sm:col-span-2">
                              <label className="block text-gray-600 font-bold mb-1">Editorial Description</label>
                              <textarea
                                rows={2}
                                value={area.description || ''}
                                onChange={(e) => handleUpdateNeighbourhood(aIdx, 'description', e.target.value)}
                                className="w-full p-2 rounded-lg border border-gray-300 bg-white text-xs leading-relaxed"
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Sub-Tab 9: Editorial Customer Reviews */}
                {activeSubTab === 'reviews' && (
                  <div className="bg-white p-5 sm:p-6 rounded-3xl border border-border shadow-xs space-y-5">
                    <div className="flex items-center justify-between border-b border-border pb-3">
                      <div>
                        <h2 className="text-base font-extrabold text-foreground">
                          Curated Customer Reviews ({(currentLocation.reviews || []).length} Testimonials)
                        </h2>
                        <p className="text-xs text-muted-foreground">
                          Real customer stories rendered in the testimonials section for {currentLocation.name}.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={handleAddReview}
                        className="px-3.5 py-2 rounded-xl bg-[#1E3B2B] text-white text-xs font-bold hover:bg-[#284f3a] transition-all flex items-center gap-1.5 cursor-pointer"
                      >
                        <Plus size={14} />
                        <span>Add Review</span>
                      </button>
                    </div>

                    {/* Section Header Controls */}
                    <div className="p-4 bg-gray-50 rounded-2xl border border-border space-y-3">
                      <span className="font-bold text-gray-900 block text-xs">
                        Section Header, Badge &amp; Rating Subtitle
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                        <div>
                          <label className="block text-gray-600 font-bold mb-1">Section Badge</label>
                          <input
                            type="text"
                            value={currentLocation.reviewsBadge || ''}
                            onChange={(e) => updateCurrentLocation('reviewsBadge', e.target.value)}
                            placeholder={`Loved Across ${currentLocation.name}`}
                            className="w-full p-2.5 rounded-xl border border-gray-300 bg-white font-bold"
                          />
                        </div>
                        <div>
                          <label className="block text-gray-600 font-bold mb-1">Section Title</label>
                          <input
                            type="text"
                            value={currentLocation.reviewsTitle || ''}
                            onChange={(e) => updateCurrentLocation('reviewsTitle', e.target.value)}
                            placeholder={`What ${currentLocation.name} Is Saying`}
                            className="w-full p-2.5 rounded-xl border border-gray-300 bg-white font-bold"
                          />
                        </div>
                        <div className="sm:col-span-2">
                          <label className="block text-gray-600 font-bold mb-1">Rating Summary Text</label>
                          <input
                            type="text"
                            value={currentLocation.reviewsSubtitle || ''}
                            onChange={(e) => updateCurrentLocation('reviewsSubtitle', e.target.value)}
                            placeholder="4.9 / 5.0 Average · 1,200+ Verified London Orders"
                            className="w-full p-2.5 rounded-xl border border-gray-300 bg-white text-xs"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      {(currentLocation.reviews || []).map((rev, rIdx) => (
                        <div key={rIdx} className="p-4 rounded-2xl bg-gray-50 border border-border space-y-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1">
                              {[...Array(5)].map((_, s) => (
                                <Star
                                  key={s}
                                  size={12}
                                  className={s < (rev.rating || 5) ? 'text-amber-400 fill-amber-400' : 'text-gray-300'}
                                />
                              ))}
                              <span className="text-[10px] font-bold text-gray-500 ml-1.5">
                                REVIEW #{rIdx + 1}
                              </span>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleRemoveReview(rIdx)}
                              className="p-1 rounded-lg text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
                              title="Delete Review"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                            <div>
                              <label className="block text-gray-600 font-bold mb-1">Author Name</label>
                              <input
                                type="text"
                                value={rev.author || ''}
                                onChange={(e) => handleUpdateReview(rIdx, 'author', e.target.value)}
                                placeholder="Priya & Rahul S."
                                className="w-full p-2 rounded-lg border border-gray-300 bg-white font-bold"
                              />
                            </div>
                            <div>
                              <label className="block text-gray-600 font-bold mb-1">Neighbourhood / Tag</label>
                              <input
                                type="text"
                                value={rev.neighbourhood || ''}
                                onChange={(e) => handleUpdateReview(rIdx, 'neighbourhood', e.target.value)}
                                placeholder="Canary Wharf / Isle of Dogs"
                                className="w-full p-2 rounded-lg border border-gray-300 bg-white"
                              />
                            </div>
                            <div>
                              <label className="block text-gray-600 font-bold mb-1">Meal Plan Subscribed</label>
                              <input
                                type="text"
                                value={rev.plan || ''}
                                onChange={(e) => handleUpdateReview(rIdx, 'plan', e.target.value)}
                                placeholder="3-Day Family Feast Plan"
                                className="w-full p-2 rounded-lg border border-gray-300 bg-white"
                              />
                            </div>
                            <div className="sm:col-span-3">
                              <label className="block text-gray-600 font-bold mb-1">Customer Quote / Story</label>
                              <textarea
                                rows={3}
                                value={rev.quote || ''}
                                onChange={(e) => handleUpdateReview(rIdx, 'quote', e.target.value)}
                                className="w-full p-2 rounded-lg border border-gray-300 bg-white text-xs leading-relaxed"
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Sub-Tab 6: Highlights & Guarantees */}
                {activeSubTab === 'highlights' && (
                  <div className="bg-white p-5 sm:p-6 rounded-3xl border border-border shadow-xs space-y-4">
                    <div className="flex items-center justify-between border-b border-border pb-3">
                      <div>
                        <h2 className="text-base font-extrabold text-foreground">
                          Service Highlights &amp; Guarantees ({currentLocation.localHighlights.length})
                        </h2>
                        <p className="text-xs text-muted-foreground">
                          Core feature guarantee pills displayed in the delivery section.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={handleAddHighlight}
                        className="px-3.5 py-2 rounded-xl bg-[#1E3B2B] text-white text-xs font-bold hover:bg-[#284f3a] transition-all flex items-center gap-1.5 cursor-pointer"
                      >
                        <Plus size={14} />
                        <span>Add Highlight</span>
                      </button>
                    </div>

                    <div className="space-y-3">
                      {currentLocation.localHighlights.map((hl, hIdx) => (
                        <div key={hIdx} className="p-4 rounded-2xl bg-gray-50 border border-border space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold text-gray-400 font-mono">
                              HIGHLIGHT #{hIdx + 1}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleRemoveHighlight(hIdx)}
                              className="p-1 rounded-lg text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                            <div>
                              <label className="block text-gray-600 font-bold mb-1">Highlight Title</label>
                              <input
                                type="text"
                                value={hl.title || ''}
                                onChange={(e) => handleUpdateHighlight(hIdx, 'title', e.target.value)}
                                className="w-full p-2 rounded-lg border border-gray-300 bg-white font-bold"
                              />
                            </div>

                            <div>
                              <label className="block text-gray-600 font-bold mb-1">Icon (Lucide)</label>
                              <input
                                type="text"
                                value={hl.icon || ''}
                                onChange={(e) => handleUpdateHighlight(hIdx, 'icon', e.target.value)}
                                className="w-full p-2 rounded-lg border border-gray-300 bg-white font-mono"
                                placeholder="Clock, Leaf, ShieldCheck, MapPin, Bike"
                              />
                            </div>

                            <div className="sm:col-span-2">
                              <label className="block text-gray-600 font-bold mb-1">Description</label>
                              <textarea
                                rows={2}
                                value={hl.desc || ''}
                                onChange={(e) => handleUpdateHighlight(hIdx, 'desc', e.target.value)}
                                className="w-full p-2 rounded-lg border border-gray-300 bg-white text-xs"
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Sub-Tab 7: Local FAQs */}
                {activeSubTab === 'faqs' && (
                  <div className="bg-white p-5 sm:p-6 rounded-3xl border border-border shadow-xs space-y-4">
                    <div className="flex items-center justify-between border-b border-border pb-3">
                      <div>
                        <h2 className="text-base font-extrabold text-foreground">
                          Route-Specific FAQs ({currentLocation.faqs.length} Questions)
                        </h2>
                        <p className="text-xs text-muted-foreground">
                          Accordion answers for local customer queries in this sector.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={handleAddFAQ}
                        className="px-3.5 py-2 rounded-xl bg-[#1E3B2B] text-white text-xs font-bold hover:bg-[#284f3a] transition-all flex items-center gap-1.5 cursor-pointer"
                      >
                        <Plus size={14} />
                        <span>Add Question</span>
                      </button>
                    </div>

                    {/* Section Header Controls */}
                    <div className="p-4 bg-gray-50 rounded-2xl border border-border space-y-3">
                      <span className="font-bold text-gray-900 block text-xs">
                        Section Header, Badge &amp; Subtitle
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                        <div>
                          <label className="block text-gray-600 font-bold mb-1">Section Badge</label>
                          <input
                            type="text"
                            value={currentLocation.faqsBadge || ''}
                            onChange={(e) => updateCurrentLocation('faqsBadge', e.target.value)}
                            placeholder="Local Questions &amp; Answers"
                            className="w-full p-2.5 rounded-xl border border-gray-300 bg-white font-bold"
                          />
                        </div>
                        <div>
                          <label className="block text-gray-600 font-bold mb-1">Section Title</label>
                          <input
                            type="text"
                            value={currentLocation.faqsTitle || ''}
                            onChange={(e) => updateCurrentLocation('faqsTitle', e.target.value)}
                            placeholder={`${currentLocation.name} Tiffin Delivery FAQs`}
                            className="w-full p-2.5 rounded-xl border border-gray-300 bg-white font-bold"
                          />
                        </div>
                        <div className="sm:col-span-2">
                          <label className="block text-gray-600 font-bold mb-1">Section Subtitle</label>
                          <textarea
                            rows={2}
                            value={currentLocation.faqsSubtitle || ''}
                            onChange={(e) => updateCurrentLocation('faqsSubtitle', e.target.value)}
                            placeholder={`Everything you need to know about our home-cooked meal subscriptions, delivery days, and reusable packaging in ${currentLocation.name}.`}
                            className="w-full p-2.5 rounded-xl border border-gray-300 bg-white text-xs"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      {currentLocation.faqs.map((faq, fIdx) => (
                        <div key={fIdx} className="p-4 rounded-2xl bg-gray-50 border border-border space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold text-gray-400 font-mono">
                              QUESTION #{fIdx + 1}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleRemoveFAQ(fIdx)}
                              className="p-1 rounded-lg text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>

                          <div className="space-y-2 text-xs">
                            <div>
                              <label className="block text-gray-600 font-bold mb-1">Question</label>
                              <input
                                type="text"
                                value={faq.question || ''}
                                onChange={(e) => handleUpdateFAQ(fIdx, 'question', e.target.value)}
                                className="w-full p-2 rounded-lg border border-gray-300 bg-white font-bold"
                              />
                            </div>

                            <div>
                              <label className="block text-gray-600 font-bold mb-1">Answer</label>
                              <textarea
                                rows={3}
                                value={faq.answer || ''}
                                onChange={(e) => handleUpdateFAQ(fIdx, 'answer', e.target.value)}
                                className="w-full p-2 rounded-lg border border-gray-300 bg-white text-xs leading-relaxed"
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Sub-Tab 12: Final Ordering Call-to-Action */}
                {activeSubTab === 'finalCTA' && (
                  <div className="bg-white p-5 sm:p-6 rounded-3xl border border-border shadow-xs space-y-5">
                    <div className="border-b border-border pb-3">
                      <h2 className="text-base font-extrabold text-foreground">
                        Final Ordering Call-to-Action Section
                      </h2>
                      <p className="text-xs text-muted-foreground">
                        High-converting closing banner with trust guarantees and order buttons.
                      </p>
                    </div>

                    <div className="space-y-4 text-xs">
                      <div>
                        <label className="block text-gray-700 font-bold mb-1">Pill Badge</label>
                        <input
                          type="text"
                          value={currentLocation.finalCTA?.badge || ''}
                          onChange={(e) => updateFinalCTA('badge', e.target.value)}
                          placeholder={`Active Route in ${currentLocation.name}`}
                          className="w-full p-2.5 rounded-xl border border-gray-300 text-xs font-semibold"
                        />
                      </div>

                      <div>
                        <label className="block text-gray-700 font-bold mb-1">Closing Heading (H2)</label>
                        <input
                          type="text"
                          value={currentLocation.finalCTA?.heading || ''}
                          onChange={(e) => updateFinalCTA('heading', e.target.value)}
                          placeholder={`Ready to Experience Handcrafted Home Food in ${currentLocation.name}?`}
                          className="w-full p-2.5 rounded-xl border border-gray-300 text-xs font-bold"
                        />
                      </div>

                      <div>
                        <label className="block text-gray-700 font-bold mb-1">Subheadline</label>
                        <textarea
                          rows={3}
                          value={currentLocation.finalCTA?.subheadline || ''}
                          onChange={(e) => updateFinalCTA('subheadline', e.target.value)}
                          className="w-full p-2.5 rounded-xl border border-gray-300 text-xs leading-relaxed"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 bg-gray-50 rounded-2xl border border-border">
                        <div>
                          <label className="block text-gray-600 font-bold mb-1">Primary Button Text</label>
                          <input
                            type="text"
                            value={currentLocation.finalCTA?.primaryButtonText || ''}
                            onChange={(e) => updateFinalCTA('primaryButtonText', e.target.value)}
                            className="w-full p-2 rounded-lg border border-gray-300 bg-white font-bold"
                          />
                        </div>
                        <div>
                          <label className="block text-gray-600 font-bold mb-1">Primary Button Link</label>
                          <input
                            type="text"
                            value={currentLocation.finalCTA?.primaryButtonLink || ''}
                            onChange={(e) => updateFinalCTA('primaryButtonLink', e.target.value)}
                            className="w-full p-2 rounded-lg border border-gray-300 bg-white font-mono"
                          />
                        </div>
                        <div>
                          <label className="block text-gray-600 font-bold mb-1">Secondary Button Text</label>
                          <input
                            type="text"
                            value={currentLocation.finalCTA?.secondaryButtonText || ''}
                            onChange={(e) => updateFinalCTA('secondaryButtonText', e.target.value)}
                            className="w-full p-2 rounded-lg border border-gray-300 bg-white"
                          />
                        </div>
                        <div>
                          <label className="block text-gray-600 font-bold mb-1">Secondary Button Link</label>
                          <input
                            type="text"
                            value={currentLocation.finalCTA?.secondaryButtonLink || ''}
                            onChange={(e) => updateFinalCTA('secondaryButtonLink', e.target.value)}
                            className="w-full p-2 rounded-lg border border-gray-300 bg-white font-mono"
                          />
                        </div>
                      </div>

                      {/* Trust Guarantees */}
                      <div className="p-4 bg-gray-50 rounded-2xl border border-border space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-gray-900 block text-xs">
                            Service Guarantee Badges ({(currentLocation.finalCTA?.guarantees || []).length})
                          </span>
                          <button
                            type="button"
                            onClick={handleAddCTAGuarantee}
                            className="px-2 py-1 rounded-lg bg-[#1E3B2B] text-white text-[11px] font-bold hover:bg-[#284f3a] cursor-pointer"
                          >
                            + Add Guarantee
                          </button>
                        </div>
                        <div className="space-y-2">
                          {(currentLocation.finalCTA?.guarantees || []).map((guar, gIdx) => (
                            <div key={gIdx} className="flex items-center gap-2">
                              <input
                                type="text"
                                value={guar || ''}
                                onChange={(e) => handleUpdateCTAGuarantee(gIdx, e.target.value)}
                                className="flex-1 p-2 rounded-lg border border-gray-300 bg-white text-xs font-semibold"
                              />
                              <button
                                type="button"
                                onClick={() => handleRemoveCTAGuarantee(gIdx)}
                                className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 cursor-pointer"
                                title="Delete guarantee"
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Sub-Tab 14: Local SEO & Metadata */}
                {activeSubTab === 'seo' && (
                  <div className="bg-white p-5 sm:p-6 rounded-3xl border border-border shadow-xs space-y-5">
                    <div>
                      <h2 className="text-base font-extrabold text-foreground">
                        Search Engine Optimization &amp; Metadata ({currentLocation.name})
                      </h2>
                      <p className="text-xs text-muted-foreground">
                        Google search result snippet preview, meta title, description, and OpenGraph tags.
                      </p>
                    </div>

                    {/* Google SERP Preview Box */}
                    <div className="p-4 rounded-2xl bg-gray-50 border border-border space-y-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block mb-1">
                        Google Search Result Snippet Preview
                      </span>
                      <div className="font-mono text-[11px] text-emerald-800 truncate">
                        https://domeal.co.uk/locations/{currentLocation.slug}
                      </div>
                      <div className="text-blue-700 text-sm font-semibold hover:underline cursor-pointer truncate">
                        {currentLocation.metaTitle}
                      </div>
                      <div className="text-xs text-gray-600 line-clamp-2 leading-relaxed">
                        {currentLocation.metaDescription}
                      </div>
                    </div>

                    <div className="space-y-4 text-xs">
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="block text-gray-700 font-bold">Meta Title Tag</label>
                          <span className="text-[10px] text-gray-400">
                            {currentLocation.metaTitle.length} chars (Optimal: 50–60)
                          </span>
                        </div>
                        <input
                          type="text"
                          value={currentLocation.metaTitle || ''}
                          onChange={(e) => updateCurrentLocation('metaTitle', e.target.value)}
                          className="w-full p-2.5 rounded-xl border border-gray-300 font-semibold"
                        />
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="block text-gray-700 font-bold">Meta Description</label>
                          <span className="text-[10px] text-gray-400">
                            {(currentLocation.metaDescription || '').length} chars (Optimal: 140–160)
                          </span>
                        </div>
                        <textarea
                          rows={3}
                          value={currentLocation.metaDescription || ''}
                          onChange={(e) => updateCurrentLocation('metaDescription', e.target.value)}
                          className="w-full p-2.5 rounded-xl border border-gray-300 text-xs leading-relaxed"
                        />
                      </div>

                      <div>
                        <label className="block text-gray-700 font-bold mb-1">
                          Target Keywords (comma-separated)
                        </label>
                        <input
                          type="text"
                          value={(currentLocation.keywords || []).join(', ')}
                          onChange={(e) =>
                            updateCurrentLocation(
                              'keywords',
                              e.target.value.split(',').map((k) => k.trim()).filter(Boolean)
                            )
                          }
                          className="w-full p-2.5 rounded-xl border border-gray-300 text-xs font-mono"
                          placeholder="indian food delivery, tiffin service..."
                        />
                      </div>

                      <div>
                        <label className="block text-gray-700 font-bold mb-1">
                          OpenGraph Social Share Image Path
                        </label>
                        <input
                          type="text"
                          value={currentLocation.ogImage || ''}
                          onChange={(e) => updateCurrentLocation('ogImage', e.target.value)}
                          className="w-full p-2.5 rounded-xl border border-gray-300 text-xs font-mono"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* 9. Full Footer Customization Sub-Tab */}
                {activeSubTab === 'footer' && (
                  <div className="bg-white p-6 rounded-3xl border border-border shadow-xs space-y-6">
                    <div className="border-b border-border pb-3 flex items-center justify-between">
                      <div>
                        <h3 className="font-extrabold text-base text-gray-900">
                          Complete Location Page Footer CMS
                        </h3>
                        <p className="text-xs text-muted-foreground">
                          Customize brand slogans, contact details, social links, and London delivery area headers. Changes sync live to the preview on the right.
                        </p>
                      </div>
                      <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                        Live Sync
                      </span>
                    </div>

                    {/* Brand Slogan & About */}
                    <div className="space-y-4">
                      <div>
                        <label className="block text-gray-700 font-bold mb-1">
                          Brand Slogan / Tagline
                        </label>
                        <input
                          type="text"
                          value={currentLocation.footer?.tagline || ''}
                          onChange={(e) => updateFooterField('tagline', e.target.value)}
                          placeholder="e.g. “Home Food Away From Home”"
                          className="w-full p-2.5 rounded-xl border border-gray-300 text-xs font-semibold"
                        />
                        <span className="text-[10px] text-gray-400">
                          Appears in italic styling beneath the DoMeal brand logo in the footer.
                        </span>
                      </div>

                      <div>
                        <label className="block text-gray-700 font-bold mb-1">
                          Brand About Paragraph
                        </label>
                        <textarea
                          rows={3}
                          value={currentLocation.footer?.aboutText || ''}
                          onChange={(e) => updateFooterField('aboutText', e.target.value)}
                          placeholder="Authentic home-cooked Indian tiffin delivered fresh to your door across London. Made with love, just like home."
                          className="w-full p-2.5 rounded-xl border border-gray-300 text-xs leading-relaxed"
                        />
                      </div>
                    </div>

                    {/* Contact Information */}
                    <div className="p-4 bg-gray-50 rounded-2xl border border-border space-y-4">
                      <span className="font-bold text-gray-900 block text-xs uppercase tracking-wider">
                        Contact Details
                      </span>

                      <div>
                        <label className="block text-gray-600 text-xs font-bold mb-1">
                          Kitchen / Registered Address
                        </label>
                        <textarea
                          rows={2}
                          value={currentLocation.footer?.contactAddress || ''}
                          onChange={(e) => updateFooterField('contactAddress', e.target.value)}
                          placeholder="No 1 Sedgecombe Avenue&#10;Kenton, HA3 0HW"
                          className="w-full p-2.5 rounded-xl border border-gray-300 text-xs bg-white"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-gray-600 text-xs font-bold mb-1">
                            Support Email
                          </label>
                          <input
                            type="email"
                            value={currentLocation.footer?.contactEmail || ''}
                            onChange={(e) => updateFooterField('contactEmail', e.target.value)}
                            placeholder="orders@domeal.co.uk"
                            className="w-full p-2.5 rounded-xl border border-gray-300 text-xs bg-white"
                          />
                        </div>

                        <div>
                          <label className="block text-gray-600 text-xs font-bold mb-1">
                            Support Phone (Optional)
                          </label>
                          <input
                            type="text"
                            value={currentLocation.footer?.contactPhone || ''}
                            onChange={(e) => updateFooterField('contactPhone', e.target.value)}
                            placeholder="e.g. +44 7123 456789"
                            className="w-full p-2.5 rounded-xl border border-gray-300 text-xs bg-white"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Column 2: Quick Links Manager */}
                    <div className="p-4 bg-gray-50 rounded-2xl border border-border space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="font-bold text-gray-900 block text-xs uppercase tracking-wider">
                            Column 2: Quick Links ({currentLocation.footer?.quickLinks?.length || 0} Links)
                          </span>
                          <span className="text-[10px] text-gray-500">
                            Customizable navigational links rendered in footer column 2.
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={handleAddQuickLink}
                          className="px-3 py-1.5 rounded-xl bg-[#1E3B2B] text-white text-xs font-bold hover:bg-[#284f3a] cursor-pointer"
                        >
                          + Add Quick Link
                        </button>
                      </div>

                      <div>
                        <label className="block text-gray-600 text-xs font-bold mb-1">
                          Column Heading
                        </label>
                        <input
                          type="text"
                          value={currentLocation.footer?.quickLinksHeading || ''}
                          onChange={(e) => updateFooterField('quickLinksHeading', e.target.value)}
                          placeholder="Quick Links"
                          className="w-full p-2.5 rounded-xl border border-gray-300 text-xs font-bold bg-white"
                        />
                      </div>

                      <div className="space-y-2">
                        {(currentLocation.footer?.quickLinks || []).map((link, qIdx) => (
                          <div key={qIdx} className="flex items-center gap-2 p-2 bg-white rounded-xl border border-gray-200">
                            <input
                              type="text"
                              value={link.label || ''}
                              onChange={(e) => handleUpdateQuickLink(qIdx, 'label', e.target.value)}
                              placeholder="Link Label (e.g. Menu)"
                              className="w-1/3 p-2 rounded-lg border border-gray-300 text-xs font-semibold"
                            />
                            <input
                              type="text"
                              value={link.href || ''}
                              onChange={(e) => handleUpdateQuickLink(qIdx, 'href', e.target.value)}
                              placeholder="Target URL (e.g. /menu)"
                              className="flex-1 p-2 rounded-lg border border-gray-300 text-xs font-mono text-gray-700"
                            />
                            <button
                              type="button"
                              onClick={() => handleRemoveQuickLink(qIdx)}
                              className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg cursor-pointer transition-colors"
                              title="Delete Link"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Column 3: London Delivery Areas Manager */}
                    <div className="p-4 bg-gray-50 rounded-2xl border border-border space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-gray-900 block text-xs uppercase tracking-wider">
                              Column 3: Delivery Areas ({currentLocation.footer?.deliveryAreas?.length || 0} Routes)
                            </span>
                            <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-[#C39B54]/20 text-[#C39B54] border border-[#C39B54]/40 uppercase tracking-wider whitespace-nowrap">
                              Zones 1–3
                            </span>
                          </div>
                          <span className="text-[10px] text-gray-500">
                            Custom regional route links with postcode subtitles rendered in footer column 3.
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={handleLoadAllDefaultRoutes}
                            className="px-3 py-1.5 rounded-xl bg-amber-100 text-amber-900 border border-amber-300 text-xs font-bold hover:bg-amber-200 cursor-pointer transition-colors"
                            title="Populate with West, East, North, South, Central London routes"
                          >
                            ⚡ Load All 5 Routes
                          </button>
                          <button
                            type="button"
                            onClick={handleAddDeliveryAreaLink}
                            className="px-3 py-1.5 rounded-xl bg-[#1E3B2B] text-white text-xs font-bold hover:bg-[#284f3a] cursor-pointer"
                          >
                            + Add Area Link
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className="block text-gray-600 text-xs font-bold mb-1">
                          Delivery Column Heading
                        </label>
                        <input
                          type="text"
                          value={currentLocation.footer?.deliveryAreasHeading || ''}
                          onChange={(e) => updateFooterField('deliveryAreasHeading', e.target.value)}
                          placeholder="London Delivery Areas"
                          className="w-full p-2.5 rounded-xl border border-gray-300 text-xs font-bold bg-white"
                        />
                      </div>

                      <div className="space-y-2">
                        {(currentLocation.footer?.deliveryAreas || []).map((areaLink, aIdx) => (
                          <div key={aIdx} className="p-3 bg-white rounded-xl border border-gray-200 space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] font-bold text-gray-400 font-mono">AREA LINK #{aIdx + 1}</span>
                              <button
                                type="button"
                                onClick={() => handleRemoveDeliveryAreaLink(aIdx)}
                                className="p-1 text-red-500 hover:bg-red-50 rounded-lg cursor-pointer transition-colors"
                                title="Delete Area Link"
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                              <input
                                type="text"
                                value={areaLink.label || ''}
                                onChange={(e) => handleUpdateDeliveryAreaLink(aIdx, 'label', e.target.value)}
                                placeholder="Label (e.g. West London Tiffins)"
                                className="p-2 rounded-lg border border-gray-300 text-xs font-bold"
                              />
                              <input
                                type="text"
                                value={areaLink.sub || ''}
                                onChange={(e) => handleUpdateDeliveryAreaLink(aIdx, 'sub', e.target.value)}
                                placeholder="Subtitle (e.g. W1–W14 · Scheduled)"
                                className="p-2 rounded-lg border border-gray-300 text-xs"
                              />
                              <input
                                type="text"
                                value={areaLink.href || ''}
                                onChange={(e) => handleUpdateDeliveryAreaLink(aIdx, 'href', e.target.value)}
                                placeholder="URL (e.g. /locations/west-london)"
                                className="p-2 rounded-lg border border-gray-300 text-xs font-mono"
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Contact Heading & Social Media Channels */}
                    <div className="p-4 bg-gray-50 rounded-2xl border border-border space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-gray-900 block text-xs uppercase tracking-wider">
                          Column 4: Contact Heading &amp; Social Media
                        </span>
                      </div>

                      <div>
                        <label className="block text-gray-600 text-xs font-bold mb-1">
                          Contact Column Heading
                        </label>
                        <input
                          type="text"
                          value={currentLocation.footer?.contactHeading || ''}
                          onChange={(e) => updateFooterField('contactHeading', e.target.value)}
                          placeholder="Contact Us"
                          className="w-full p-2.5 rounded-xl border border-gray-300 text-xs font-bold bg-white"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                        <div>
                          <label className="block text-gray-600 text-[11px] font-bold mb-1">Facebook URL</label>
                          <input
                            type="text"
                            value={currentLocation.footer?.facebookUrl || ''}
                            onChange={(e) => updateFooterField('facebookUrl', e.target.value)}
                            placeholder="https://facebook.com/domeal"
                            className="w-full p-2 rounded-xl border border-gray-300 text-xs bg-white font-mono"
                          />
                        </div>
                        <div>
                          <label className="block text-gray-600 text-[11px] font-bold mb-1">Instagram URL</label>
                          <input
                            type="text"
                            value={currentLocation.footer?.instagramUrl || ''}
                            onChange={(e) => updateFooterField('instagramUrl', e.target.value)}
                            placeholder="https://instagram.com/domeal"
                            className="w-full p-2 rounded-xl border border-gray-300 text-xs bg-white font-mono"
                          />
                        </div>
                        <div>
                          <label className="block text-gray-600 text-[11px] font-bold mb-1">Pinterest URL</label>
                          <input
                            type="text"
                            value={currentLocation.footer?.pinterestUrl || ''}
                            onChange={(e) => updateFooterField('pinterestUrl', e.target.value)}
                            placeholder="https://pinterest.com/domeal"
                            className="w-full p-2 rounded-xl border border-gray-300 text-xs bg-white font-mono"
                          />
                        </div>
                        <div>
                          <label className="block text-gray-600 text-[11px] font-bold mb-1">TikTok URL</label>
                          <input
                            type="text"
                            value={currentLocation.footer?.tiktokUrl || ''}
                            onChange={(e) => updateFooterField('tiktokUrl', e.target.value)}
                            placeholder="https://tiktok.com/@domeal"
                            className="w-full p-2 rounded-xl border border-gray-300 text-xs bg-white font-mono"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Bottom Bar: Copyright & Legal Policy Links */}
                    <div className="p-4 bg-gray-50 rounded-2xl border border-border space-y-4">
                      <span className="font-bold text-gray-900 block text-xs uppercase tracking-wider">
                        Bottom Bar Copyright &amp; Legal Links
                      </span>

                      <div>
                        <label className="block text-gray-700 font-bold mb-1">
                          Copyright Text Notice
                        </label>
                        <input
                          type="text"
                          value={currentLocation.footer?.copyrightText || ''}
                          onChange={(e) => updateFooterField('copyrightText', e.target.value)}
                          placeholder="© 2026 DoMeal · domeal.co.uk · All rights reserved."
                          className="w-full p-2.5 rounded-xl border border-gray-300 text-xs bg-white"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                        <div className="p-3 bg-white rounded-xl border border-gray-200 space-y-2">
                          <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">Legal Link 1</span>
                          <div>
                            <label className="block text-gray-500 text-[10px] font-bold mb-0.5">Label</label>
                            <input
                              type="text"
                              value={currentLocation.footer?.privacyPolicyText || ''}
                              onChange={(e) => updateFooterField('privacyPolicyText', e.target.value)}
                              placeholder="Privacy Policy"
                              className="w-full p-1.5 rounded-lg border border-gray-300 text-xs font-semibold"
                            />
                          </div>
                          <div>
                            <label className="block text-gray-500 text-[10px] font-bold mb-0.5">URL</label>
                            <input
                              type="text"
                              value={currentLocation.footer?.privacyPolicyUrl || ''}
                              onChange={(e) => updateFooterField('privacyPolicyUrl', e.target.value)}
                              placeholder="/privacy-policy"
                              className="w-full p-1.5 rounded-lg border border-gray-300 text-xs font-mono"
                            />
                          </div>
                        </div>

                        <div className="p-3 bg-white rounded-xl border border-gray-200 space-y-2">
                          <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">Legal Link 2</span>
                          <div>
                            <label className="block text-gray-500 text-[10px] font-bold mb-0.5">Label</label>
                            <input
                              type="text"
                              value={currentLocation.footer?.termsOfServiceText || ''}
                              onChange={(e) => updateFooterField('termsOfServiceText', e.target.value)}
                              placeholder="Terms of Service"
                              className="w-full p-1.5 rounded-lg border border-gray-300 text-xs font-semibold"
                            />
                          </div>
                          <div>
                            <label className="block text-gray-500 text-[10px] font-bold mb-0.5">URL</label>
                            <input
                              type="text"
                              value={currentLocation.footer?.termsOfServiceUrl || ''}
                              onChange={(e) => updateFooterField('termsOfServiceUrl', e.target.value)}
                              placeholder="/terms-of-service"
                              className="w-full p-1.5 rounded-lg border border-gray-300 text-xs font-mono"
                            />
                          </div>
                        </div>

                        <div className="p-3 bg-white rounded-xl border border-gray-200 space-y-2">
                          <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">Legal Link 3</span>
                          <div>
                            <label className="block text-gray-500 text-[10px] font-bold mb-0.5">Label</label>
                            <input
                              type="text"
                              value={currentLocation.footer?.termsOfBusinessText || ''}
                              onChange={(e) => updateFooterField('termsOfBusinessText', e.target.value)}
                              placeholder="Terms of Business"
                              className="w-full p-1.5 rounded-lg border border-gray-300 text-xs font-semibold"
                            />
                          </div>
                          <div>
                            <label className="block text-gray-500 text-[10px] font-bold mb-0.5">URL</label>
                            <input
                              type="text"
                              value={currentLocation.footer?.termsOfBusinessUrl || ''}
                              onChange={(e) => updateFooterField('termsOfBusinessUrl', e.target.value)}
                              placeholder="/terms-of-business"
                              className="w-full p-1.5 rounded-lg border border-gray-300 text-xs font-mono"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* RIGHT COLUMN: Real-Time Interactive Live Preview */}
            {(layoutMode === 'split' || layoutMode === 'preview') && (
              <div
                className={`${
                  layoutMode === 'split'
                    ? splitRatio === 'editor-focus'
                      ? 'xl:col-span-5 2xl:col-span-4 xl:sticky xl:top-4 h-[calc(100vh-140px)] min-h-[650px]'
                      : splitRatio === 'balanced'
                      ? 'xl:col-span-6 2xl:col-span-6 xl:sticky xl:top-4 h-[calc(100vh-140px)] min-h-[650px]'
                      : 'xl:col-span-7 2xl:col-span-7 xl:sticky xl:top-4 h-[calc(100vh-140px)] min-h-[650px]'
                    : 'w-full h-[calc(100vh-140px)] min-h-[650px]'
                }`}
              >
                <LocationLivePreview
                  location={currentLocation}
                  allLocations={locations}
                  onSelectLocation={(slug) => setSelectedSlug(slug)}
                  activeSubTab={activeSubTab}
                />
              </div>
            )}
          </div>
        )
      )}

      {/* Add New Location Route Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full space-y-4 shadow-2xl border border-border">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-[#1E3B2B]/10 text-[#1E3B2B] flex items-center justify-center">
                  <Plus size={18} />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-base">Create New London Delivery Route</h3>
                  <p className="text-xs text-muted-foreground">Add a new regional landing page to DoMeal</p>
                </div>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 rounded-lg text-gray-400 hover:text-gray-700"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateNewLocation} className="space-y-4 text-xs">
              <div>
                <label className="block text-gray-700 font-bold mb-1">Region Name</label>
                <input
                  type="text"
                  required
                  value={newLocName || ''}
                  onChange={(e) => {
                    setNewLocName(e.target.value);
                    if (!newLocSlug || newLocSlug === newLocName.toLowerCase().replace(/\s+/g, '-')) {
                      setNewLocSlug(e.target.value.toLowerCase().replace(/\s+/g, '-'));
                    }
                  }}
                  placeholder="e.g. North West London"
                  className="w-full p-2.5 rounded-xl border border-gray-300 text-xs"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-bold mb-1">URL Route Slug</label>
                <input
                  type="text"
                  required
                  value={newLocSlug || ''}
                  onChange={(e) => setNewLocSlug(e.target.value)}
                  placeholder="e.g. north-west-london"
                  className="w-full p-2.5 rounded-xl border border-gray-300 text-xs font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-700 font-bold mb-1">Region Code</label>
                  <input
                    type="text"
                    required
                    value={newLocRegionCode || ''}
                    onChange={(e) => setNewLocRegionCode(e.target.value)}
                    placeholder="e.g. NW"
                    className="w-full p-2.5 rounded-xl border border-gray-300 text-xs font-mono uppercase"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-bold mb-1">Sample Postcode</label>
                  <input
                    type="text"
                    required
                    value={newLocSamplePostcode || ''}
                    onChange={(e) => setNewLocSamplePostcode(e.target.value)}
                    placeholder="e.g. NW1 4NP"
                    className="w-full p-2.5 rounded-xl border border-gray-300 text-xs font-mono uppercase"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-border">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-[#1E3B2B] hover:bg-[#284f3a] text-white text-xs font-extrabold flex items-center gap-1.5 transition-all shadow-md active:scale-95 cursor-pointer"
                >
                  <Plus size={14} />
                  <span>Create Route</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
