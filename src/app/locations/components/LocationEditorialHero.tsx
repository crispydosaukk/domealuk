'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { LocationData } from '@/lib/locations-data';
import { getZoneFromPostcode } from '@/app/components/PostcodeSearch';
import {
  MapPin,
  Star,
  Clock,
  ShieldCheck,
  ArrowRight,
  ChevronRight,
  Sparkles,
  CheckCircle2,
  XCircle,
  Search,
  Leaf,
  RotateCcw,
  UtensilsCrossed,
} from 'lucide-react';

interface LocationEditorialHeroProps {
  location: LocationData;
}

export default function LocationEditorialHero({ location }: LocationEditorialHeroProps) {
  const [postcode, setPostcode] = useState(location.samplePostcode || '');
  const [checkResult, setCheckResult] = useState<{
    status: 'idle' | 'success' | 'unavailable' | 'unknown';
    areaName?: string;
  }>({ status: 'idle' });

  const handleQuickCheck = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!postcode.trim()) return;

    const zone = getZoneFromPostcode(postcode);
    if (!zone) {
      setCheckResult({ status: 'unknown' });
    } else if (zone.available) {
      setCheckResult({ status: 'success', areaName: zone.area });
    } else {
      setCheckResult({ status: 'unavailable', areaName: zone.area });
    }
  };

  return (
    <section className="relative overflow-hidden bg-[#0C1D13] text-white pt-24 pb-16 lg:pt-32 lg:pb-24">
      {/* Cinematic ambient background glow */}
      <div className="absolute inset-0 pointer-events-none opacity-30">
        <div className="absolute -top-40 left-1/3 w-[600px] h-[600px] bg-[#C39B54] rounded-full blur-[160px] animate-pulse-warm" />
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-[#163824] rounded-full blur-[140px]" />
      </div>

      {/* Subtle spice dot texture */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(circle, #C39B54 1.5px, transparent 1.5px)',
          backgroundSize: '32px 32px',
        }}
      />

      <div className="max-w-screen-2xl mx-auto px-4 lg:px-8 xl:px-12 relative z-10">
        {/* Breadcrumb Navigation */}
        <nav
          aria-label="Breadcrumb"
          className="mb-8 flex flex-wrap items-center gap-2 text-xs text-gray-300 font-medium"
        >
          <Link href="/" className="hover:text-[#C39B54] transition-colors">
            Home
          </Link>
          <ChevronRight size={13} className="text-gray-500" />
          <Link href="/#locations" className="hover:text-[#C39B54] transition-colors">
            London Delivery
          </Link>
          <ChevronRight size={13} className="text-gray-500" />
          <span className="text-[#C39B54] font-bold">{location.name}</span>
        </nav>

        {/* 2-Column Asymmetric Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* Left Column: Editorial Headline & Actions */}
          <div className="lg:col-span-7 space-y-7">
            {/* Sector Route Badge */}
            <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-black text-[#C39B54] uppercase tracking-widest shadow-sm">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>{location.badge}</span>
            </div>

            {/* Main Location Heading (Only H1 on page) */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-5xl xl:text-6xl font-extrabold text-white leading-[1.1] tracking-tight font-sans">
              Handcrafted Indian Curry Feasts, Delivered in{' '}
              <span className="text-[#C39B54] font-black block sm:inline">
                Reusable Dabbas
              </span>{' '}
              Across {location.name}.
            </h1>

            {/* Rich Subheadline */}
            <p className="text-base sm:text-lg text-gray-200 leading-relaxed max-w-2xl font-normal">
              Freshly cooked in small batches by 21-year culinary masters. Cold-packed in authentic 3-tier
              stainless steel containers to lock in nutrition. Delivered directly to your door or concierge
              every Monday &amp; Thursday.
            </p>

            {/* Integrated Postcode Verification Bar */}
            <div className="p-5 sm:p-6 rounded-3xl bg-white/[0.08] backdrop-blur-xl border border-white/20 shadow-2xl max-w-xl">
              <div className="flex items-center justify-between mb-3 text-xs">
                <span className="font-extrabold text-[#C39B54] uppercase tracking-wider flex items-center gap-1.5">
                  <Search size={14} />
                  <span>Check {location.name} Postcode Availability</span>
                </span>
                <span className="text-gray-400 font-mono text-[11px]">
                  {location.supportedPostcodes.length}+ Active Postcodes
                </span>
              </div>

              <form onSubmit={handleQuickCheck} className="flex flex-col sm:flex-row gap-2.5">
                <div className="relative flex-1">
                  <MapPin
                    size={16}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                  />
                  <input
                    type="text"
                    value={postcode}
                    onChange={(e) => {
                      setPostcode(e.target.value);
                      if (checkResult.status !== 'idle') setCheckResult({ status: 'idle' });
                    }}
                    placeholder={`e.g. ${location.samplePostcode}`}
                    className="w-full bg-black/40 border border-white/20 text-white placeholder-gray-400 text-sm font-semibold rounded-2xl pl-9 pr-3 py-3.5 focus:outline-none focus:ring-2 focus:ring-[#C39B54] focus:border-transparent transition-all"
                  />
                </div>
                <button
                  type="submit"
                  className="bg-[#C39B54] hover:bg-yellow-600 text-[#0C1D13] font-black text-sm px-6 py-3.5 rounded-2xl transition-all duration-150 active:scale-95 shadow-md flex items-center justify-center gap-2 shrink-0 cursor-pointer"
                >
                  <span>Check Route</span>
                  <ArrowRight size={15} />
                </button>
              </form>

              {/* Instant Verification Feedback */}
              {checkResult.status === 'success' && (
                <div className="mt-3.5 p-3.5 rounded-xl bg-emerald-950/80 border border-emerald-500/50 text-emerald-200 text-xs flex items-center justify-between">
                  <div className="flex items-center gap-2 font-bold">
                    <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
                    <span>✓ Route Confirmed! We deliver to {checkResult.areaName || location.name} on Mondays &amp; Thursdays.</span>
                  </div>
                  <a
                    href="#menu"
                    className="underline font-black text-white hover:text-emerald-300 ml-2 shrink-0"
                  >
                    View Menu &rarr;
                  </a>
                </div>
              )}

              {checkResult.status === 'unavailable' && (
                <div className="mt-3.5 p-3.5 rounded-xl bg-rose-950/80 border border-rose-500/50 text-rose-200 text-xs flex items-center gap-2 font-semibold">
                  <XCircle size={16} className="text-rose-400 shrink-0" />
                  <span>Sorry, {postcode.toUpperCase()} is currently outside our regular scheduled route.</span>
                </div>
              )}

              {checkResult.status === 'unknown' && (
                <div className="mt-3.5 p-3.5 rounded-xl bg-amber-950/80 border border-amber-500/50 text-amber-200 text-xs flex items-center gap-2 font-semibold">
                  <MapPin size={16} className="text-amber-400 shrink-0" />
                  <span>Please enter a full London postcode (e.g. {location.samplePostcode}).</span>
                </div>
              )}

              {checkResult.status === 'idle' && (
                <p className="text-[11px] text-gray-300 mt-2.5">
                  Verified routes in {location.name}: {location.supportedPostcodes.slice(0, 7).join(', ')}...
                </p>
              )}
            </div>

            {/* Quick Action Buttons */}
            <div className="flex flex-wrap gap-4 pt-1">
              <a
                href="#menu"
                className="inline-flex items-center gap-2.5 bg-[#C39B54] hover:bg-yellow-600 text-[#0C1D13] font-black px-8 py-4 rounded-2xl transition-all duration-200 active:scale-95 shadow-xl shadow-yellow-950/50 text-sm tracking-wide cursor-pointer"
              >
                <span>Order Your {location.shortName} Dabba Feast</span>
                <ArrowRight size={16} />
              </a>
              <a
                href="#how-it-works"
                className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white border border-white/20 font-bold px-6 py-4 rounded-2xl transition-all duration-150 text-sm backdrop-blur-sm"
              >
                <span>How Dabba Swapping Works</span>
              </a>
            </div>

            {/* Trust Capsules */}
            <div className="pt-2 flex flex-wrap items-center gap-6 text-xs text-gray-300">
              <div className="flex items-center gap-2">
                <div className="flex text-amber-400">
                  {'★★★★★'.split('').map((star, i) => (
                    <span key={i} className="text-sm">★</span>
                  ))}
                </div>
                <span className="font-bold text-white">4.9 / 5.0</span>
                <span className="text-gray-400">(1,200+ Londoners Fed)</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck size={16} className="text-[#C39B54]" />
                <span className="text-gray-300 font-semibold">Council 5-Star Food Hygiene</span>
              </div>
            </div>
          </div>

          {/* Right Column: Grand Layered Food Photography Centerpiece */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="relative w-full max-w-lg">
              {/* Outer Golden Aura Glow */}
              <div className="absolute -inset-3 bg-gradient-to-tr from-[#C39B54]/40 via-emerald-600/30 to-[#C39B54]/40 rounded-3xl blur-2xl opacity-70 animate-pulse-warm" />

              {/* Main Photo Frame */}
              <div className="relative rounded-3xl overflow-hidden border-2 border-white/25 bg-[#0E1F15] shadow-2xl group">
                <div className="relative w-full aspect-[4/3] sm:aspect-square">
                  <Image
                    src={location.heroImage}
                    alt={location.heroImageAlt || `${location.name} Indian Tiffin Delivery`}
                    fill
                    priority
                    quality={95}
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 42vw"
                    className="object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
                  />
                  {/* Bottom Vignette */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/25 to-transparent" />
                </div>

                {/* Overlaid Featured Dish Information */}
                <div className="absolute bottom-0 left-0 right-0 p-6 text-white space-y-2.5">
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 rounded-full bg-[#C39B54] text-[#0C1D13] text-[10px] font-black uppercase tracking-wider shadow-sm">
                      Signature Feast in {location.name}
                    </span>
                    <span className="text-xs text-gray-300 font-medium">Freshly Cooked Daily</span>
                  </div>

                  <h3 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight drop-shadow-md font-sans">
                    {location.heroDishName}
                  </h3>

                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {location.heroDishTags.map((tag, i) => (
                      <span
                        key={i}
                        className="px-2.5 py-0.5 rounded-lg bg-white/20 backdrop-blur-md text-[11px] font-bold text-gray-100 border border-white/10"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Floating Badge 1: Fresh Deliveries (Top Right) */}
              <div className="absolute -top-4 -right-3 sm:-top-5 sm:-right-4 bg-[#142A1E]/95 backdrop-blur-md text-white rounded-2xl shadow-2xl p-3.5 border border-white/20 flex items-center gap-3 z-20 animate-float-gentle">
                <div className="w-9 h-9 rounded-xl bg-[#C39B54]/20 flex items-center justify-center text-[#C39B54]">
                  <Clock size={18} />
                </div>
                <div className="leading-tight">
                  <div className="text-xs font-black text-white">Mon &amp; Thu Batches</div>
                  <div className="text-[11px] text-gray-300">Chilled Cold-Pack</div>
                </div>
              </div>

              {/* Floating Badge 2: Reusable Stainless Steel (Bottom Left) */}
              <div className="absolute -bottom-4 -left-3 sm:-bottom-5 sm:-left-4 bg-white text-gray-900 rounded-2xl shadow-2xl p-3.5 border border-gray-100 flex items-center gap-3 z-20">
                <div className="w-9 h-9 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-800">
                  <RotateCcw size={18} />
                </div>
                <div className="leading-tight">
                  <div className="text-xs font-black text-gray-900">Zero Plastic Dabbas</div>
                  <div className="text-[11px] text-emerald-700 font-bold">Free Packaging Swap</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
