'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  ExternalLink,
  RotateCcw,
  Sparkles,
  ChevronRight,
  MapPin,
  Lock,
  Layers,
  ArrowRight,
  Eye,
  CheckCircle2,
  Maximize2,
  Minimize2,
} from 'lucide-react';
import { LocationData } from '@/lib/locations-data';

// Import All 11 Production Location Page Modular Components
import LocationPromoBar from '@/app/locations/components/LocationPromoBar';
import LocationEditorialHero from '@/app/locations/components/LocationEditorialHero';
import LocationStorySection from '@/app/locations/components/LocationStorySection';
import LocationHowItWorks from '@/app/locations/components/LocationHowItWorks';
import LocationDabbaAnatomy from '@/app/locations/components/LocationDabbaAnatomy';
import LocationSignatureDishes from '@/app/locations/components/LocationSignatureDishes';
import LocationEcoComparison from '@/app/locations/components/LocationEcoComparison';
import LocationBoroughExplorer from '@/app/locations/components/LocationBoroughExplorer';
import LocationEditorialReviews from '@/app/locations/components/LocationEditorialReviews';
import LocationFAQs from '@/app/locations/components/LocationFAQs';
import LocationFinalCTA from '@/app/locations/components/LocationFinalCTA';
import UserFooter from '@/components/UserFooter';

interface LocationLivePreviewProps {
  location: LocationData;
  allLocations?: LocationData[];
  onSelectLocation?: (slug: string) => void;
  activeSubTab?: string;
}

const PREVIEW_SECTIONS = [
  { id: 'preview-hero', label: 'Hero' },
  { id: 'preview-story', label: 'Story' },
  { id: 'preview-how', label: 'How It Works' },
  { id: 'preview-dabba', label: 'Dabba Anatomy' },
  { id: 'preview-dishes', label: 'Dishes' },
  { id: 'preview-eco', label: 'Eco Compare' },
  { id: 'preview-boroughs', label: 'Zones & Areas' },
  { id: 'preview-reviews', label: 'Reviews' },
  { id: 'preview-faqs', label: 'FAQs' },
  { id: 'preview-cta', label: 'CTA' },
  { id: 'preview-footer', label: 'Footer' },
];

export default function LocationLivePreview({
  location,
  allLocations = [],
  onSelectLocation,
  activeSubTab,
}: LocationLivePreviewProps) {
  const [activeSection, setActiveSection] = useState('preview-hero');
  const [refreshKey, setRefreshKey] = useState(0);
  const [isFullScreen, setIsFullScreen] = useState(false);

  const viewportRef = useRef<HTMLDivElement>(null);
  const [viewportWidth, setViewportWidth] = useState(600);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Measure container width in real time for responsive auto-scaling
  useEffect(() => {
    if (!viewportRef.current) return;
    const updateSize = () => {
      if (viewportRef.current) {
        setViewportWidth(viewportRef.current.clientWidth);
      }
    };
    updateSize();
    const observer = new ResizeObserver(updateSize);
    observer.observe(viewportRef.current);
    return () => observer.disconnect();
  }, [isFullScreen]);

  // Handle ESC key to exit fullscreen
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFullScreen) {
        setIsFullScreen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFullScreen]);

  const scrollToSection = (sectionId: string) => {
    setActiveSection(sectionId);
    if (!scrollContainerRef.current) return;
    const el = scrollContainerRef.current.querySelector(`#${sectionId}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Automatically scroll preview to matching section when an editor sub-tab is clicked
  useEffect(() => {
    if (!activeSubTab) return;
    const subTabToSectionMap: Record<string, string> = {
      basics: 'preview-hero',
      editorial: 'preview-hero',
      narrative: 'preview-story',
      howItWorks: 'preview-how',
      dabbaTiers: 'preview-dabba',
      dishes: 'preview-dishes',
      ecoCompare: 'preview-eco',
      neighbourhoods: 'preview-boroughs',
      reviews: 'preview-reviews',
      highlights: 'preview-boroughs',
      faqs: 'preview-faqs',
      finalCTA: 'preview-cta',
      footer: 'preview-footer',
      seo: 'preview-hero',
    };
    const targetSectionId = subTabToSectionMap[activeSubTab];
    if (targetSectionId) {
      scrollToSection(targetSectionId);
    }
  }, [activeSubTab]);

  // Standard responsive canvas width (1240px desktop base)
  const targetWidth = 1240;

  // Determine scaling factor so desktop view fits perfectly with ZERO horizontal overflow
  const availableWidth = Math.max(300, viewportWidth - 32);
  const scale = Math.min(1, Math.max(0.25, availableWidth / 1240));
  const scalePercent = Math.round(scale * 100);

  return (
    <div
      className={`flex flex-col bg-[#101914] text-stone-100 shadow-2xl overflow-hidden transition-all duration-200 ${
        isFullScreen
          ? 'fixed inset-0 z-[9999] p-3 sm:p-5 bg-black/90 backdrop-blur-md'
          : 'h-full rounded-3xl border border-stone-800'
      }`}
    >
      {/* 1. Preview Top Controls Header */}
      <div className="bg-[#17231C] border-b border-stone-800 p-2.5 sm:px-4 sm:py-3 flex flex-wrap items-center justify-between gap-2.5 shrink-0">
        {/* Left: Route Title & Live Indicator */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-bold">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="hidden sm:inline">Live Preview</span>
          </div>

          {/* Scale Badge */}
          <span className="text-[11px] font-mono font-bold text-stone-400 bg-stone-900/80 px-2.5 py-1 rounded-lg border border-stone-800">
            {scalePercent}% View
          </span>

          {/* Quick Route Switcher */}
          {allLocations.length > 0 && onSelectLocation && (
            <select
              value={location.slug || ''}
              onChange={(e) => onSelectLocation(e.target.value)}
              className="bg-[#101914] border border-stone-700 text-stone-200 text-xs font-bold rounded-xl px-2.5 py-1 focus:outline-none focus:ring-1 focus:ring-[#C39B54] cursor-pointer"
            >
              {allLocations.map((loc) => (
                <option key={loc.slug} value={loc.slug}>
                  {loc.name} ({loc.regionCode || loc.slug})
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Right: Actions (Fullscreen, Refresh & Open in New Tab) */}
        <div className="flex items-center gap-2">
          {/* Full Screen Toggle Button */}
          <button
            type="button"
            onClick={() => setIsFullScreen(!isFullScreen)}
            title={isFullScreen ? 'Exit Fullscreen (ESC)' : 'Open Full Screen Preview'}
            className="px-3 py-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer border border-stone-700/60"
          >
            {isFullScreen ? (
              <>
                <Minimize2 size={13} className="text-[#C39B54]" />
                <span className="hidden sm:inline">Exit Fullscreen</span>
              </>
            ) : (
              <>
                <Maximize2 size={13} className="text-[#C39B54]" />
                <span className="hidden sm:inline">Full Screen</span>
              </>
            )}
          </button>

          {/* Refresh Button */}
          <button
            type="button"
            onClick={() => setRefreshKey((k) => k + 1)}
            title="Re-render preview"
            className="p-1.5 rounded-xl bg-stone-800/80 hover:bg-stone-700 text-stone-300 hover:text-white transition-colors cursor-pointer border border-stone-700/60"
          >
            <RotateCcw size={14} />
          </button>

          {/* Public Live URL */}
          <Link
            href={`/locations/${location.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            title="Open Live Public URL in New Tab"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#C39B54] hover:bg-[#A98440] text-stone-950 font-bold text-xs transition-all cursor-pointer shadow-xs"
          >
            <span className="hidden sm:inline">Open Live</span>
            <ExternalLink size={13} />
          </Link>
        </div>
      </div>

      {/* 2. Simulated Browser Navigation Bar */}
      <div className="bg-[#121E16] border-b border-stone-800 px-4 py-1.5 flex items-center gap-3 text-xs shrink-0">
        <div className="flex items-center gap-1.5 shrink-0">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
        </div>

        <div className="flex-1 bg-[#0A100C] rounded-xl px-3 py-1 flex items-center justify-between text-stone-400 border border-stone-800 font-mono text-[11px] truncate">
          <div className="flex items-center gap-1.5 truncate">
            <Lock size={11} className="text-emerald-500 shrink-0" />
            <span className="text-stone-500">https://</span>
            <span className="text-stone-200 font-bold">domeal.co.uk</span>
            <span className="text-emerald-400">/locations/{location.slug}</span>
          </div>
          <span className="text-[10px] uppercase font-bold text-[#C39B54] hidden sm:inline ml-2">
            Real-Time Keystroke Sync
          </span>
        </div>
      </div>

      {/* 3. Section Jump Fast-Bar */}
      <div className="bg-[#14231A] border-b border-stone-800 px-4 py-1.5 overflow-x-auto flex items-center gap-1.5 scrollbar-thin shrink-0">
        <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 shrink-0 mr-1 flex items-center gap-1">
          <Layers size={11} className="text-[#C39B54]" /> Jump to:
        </span>
        {PREVIEW_SECTIONS.map((sec) => (
          <button
            key={sec.id}
            type="button"
            onClick={() => scrollToSection(sec.id)}
            className={`px-2.5 py-0.5 rounded-lg text-[11px] font-medium transition-all whitespace-nowrap cursor-pointer ${
              activeSection === sec.id
                ? 'bg-[#C39B54] text-stone-950 font-bold'
                : 'text-stone-300 hover:text-white hover:bg-stone-800/60'
            }`}
          >
            {sec.label}
          </button>
        ))}
      </div>

      {/* 4. Canvas Viewport Container (Auto-Scaled & Zero Horizontal Overflow) */}
      <div
        ref={viewportRef}
        className="flex-1 bg-stone-950/80 p-3 sm:p-5 overflow-auto flex justify-center items-start"
      >
        {/* Outer Scaled Frame Wrapper with explicit pixel bounding box */}
        <div
          key={refreshKey}
          className="transition-all duration-300 bg-white text-stone-900 shadow-2xl relative overflow-hidden flex flex-col rounded-2xl border border-stone-800 shadow-stone-950/50"
          style={{
            width: `${targetWidth * scale}px`,
            maxWidth: '100%',
            height: isFullScreen ? 'calc(100vh - 130px)' : 'calc(100vh - 280px)',
            minHeight: '520px',
          }}
        >
          {/* Inner Scaled Canvas containing authentic full-width layout */}
          <div
            style={{
              width: `${targetWidth}px`,
              transform: `scale(${scale})`,
              transformOrigin: 'top left',
              height: `${100 / scale}%`,
            }}
            className="flex flex-col relative"
          >
            {/* Mock DoMeal Mini Header */}
            <header className="bg-white/95 backdrop-blur-md border-b border-stone-200 sticky top-0 z-40 px-5 py-3 flex items-center justify-between shrink-0 shadow-xs">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full overflow-hidden border border-stone-200 shadow-xs">
                  <Image
                    src="/DOMEAL_Logo.jpg"
                    alt="DoMeal"
                    width={32}
                    height={32}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <span className="font-extrabold text-base text-stone-900 block leading-tight">DoMeal</span>
                  <span className="text-[10px] text-[#C39B54] font-bold tracking-wider uppercase">
                    {location.name} Route Hub
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                  Zones 1–3 Guaranteed
                </span>
                <Link
                  href="/menu"
                  className="bg-[#1E3B2B] text-white text-xs font-bold px-4 py-1.5 rounded-xl hover:bg-[#142A1E] transition-colors shadow-xs"
                >
                  Order Feasts
                </Link>
              </div>
            </header>

            {/* Inner Scrollable Location Page */}
            <div
              ref={scrollContainerRef}
              className="flex-1 overflow-y-auto scrollbar-thin bg-[#FBF8F3]"
            >
              {/* 1. Promo Announcement Bar */}
              <div id="preview-promo">
                <LocationPromoBar
                  locationName={location.name}
                  customItems={location.promoBarItems}
                />
              </div>

              {/* 2. Cinematic Location Hero */}
              <div id="preview-hero">
                <LocationEditorialHero location={location} />
              </div>

              {/* 3. Food and Brand Philosophy Narrative */}
              <div id="preview-story">
                <LocationStorySection location={location} />
              </div>

              {/* 4. Illustrated How DoMeal Works */}
              <div id="preview-how">
                <LocationHowItWorks
                  locationName={location.name}
                  customSteps={location.howItWorksSteps}
                  badge={location.howItWorksBadge}
                  title={location.howItWorksTitle}
                  subtitle={location.howItWorksSubtitle}
                />
              </div>

              {/* 5. Anatomy of a Feast ("What's in your Dabba?") */}
              <div id="preview-dabba">
                <LocationDabbaAnatomy
                  locationName={location.name}
                  customTiers={location.dabbaTiers}
                  badge={location.dabbaBadge}
                  title={location.dabbaTitle}
                />
              </div>

              {/* 6. Signature Feasts on This Week's Menu */}
              <div id="preview-dishes">
                <LocationSignatureDishes location={location} />
              </div>

              {/* 7. Takeaway vs. DoMeal Sustainability Comparison */}
              <div id="preview-eco">
                <LocationEcoComparison
                  locationName={location.name}
                  customConfig={location.ecoComparison}
                />
              </div>

              {/* 8. Local Delivery Areas & Postcodes Explorer */}
              <div id="preview-boroughs">
                <LocationBoroughExplorer location={location} />
              </div>

              {/* 9. Curated Editorial Customer Testimonials */}
              <div id="preview-reviews">
                <LocationEditorialReviews
                  locationName={location.name}
                  customReviews={location.reviews}
                  badge={location.reviewsBadge}
                  title={location.reviewsTitle}
                  subtitle={location.reviewsSubtitle}
                />
              </div>

              {/* 10. Frequently Asked Questions */}
              <div id="preview-faqs">
                <LocationFAQs
                  locationName={location.name}
                  faqs={location.faqs}
                  badge={location.faqsBadge}
                  title={location.faqsTitle}
                  subtitle={location.faqsSubtitle}
                />
              </div>

              {/* 11. Premium Full-Width Final Ordering CTA */}
              <div id="preview-cta">
                <LocationFinalCTA
                  locationName={location.name}
                  customCTA={location.finalCTA}
                />
              </div>

              {/* 12. Full Production Footer */}
              <div id="preview-footer">
                <UserFooter footerConfig={location.footer} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
