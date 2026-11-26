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
} from 'lucide-react';

interface LocationHeroProps {
  location: LocationData;
}

export default function LocationHero({ location }: LocationHeroProps) {
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
    <section className="relative overflow-hidden bg-gradient-to-b from-[#0F2217] via-[#163323] to-[#1E3B2B] text-white pt-28 pb-16 lg:pt-36 lg:pb-24">
      {/* Ambient background glow & subtle spice radial gradient */}
      <div className="absolute inset-0 pointer-events-none opacity-20">
        <div className="absolute -top-32 left-1/4 w-[500px] h-[500px] bg-[#C39B54] rounded-full blur-[140px]" />
        <div className="absolute bottom-0 right-10 w-[450px] h-[450px] bg-[#1E3B2B] rounded-full blur-[120px]" />
      </div>

      {/* Subtle organic pattern overlay */}
      <div
        className="absolute inset-0 opacity-[0.04] pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(circle, #C39B54 1.5px, transparent 1.5px)',
          backgroundSize: '28px 28px',
        }}
      />

      <div className="max-w-screen-2xl mx-auto px-4 lg:px-8 xl:px-10 relative z-10">
        {/* Breadcrumb Navigation */}
        <nav
          aria-label="Breadcrumb"
          className="mb-6 flex flex-wrap items-center gap-2 text-xs text-gray-300 font-medium"
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

        {/* 2-Column Grid: Text & Checker on Left, Food Photography on Right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          {/* Left Column: Headlines, Trust Signals & Embedded Checker */}
          <div className="lg:col-span-7 space-y-6">
            {/* Sector Route Pill */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-extrabold text-[#C39B54] uppercase tracking-widest shadow-sm">
              <MapPin size={14} className="text-[#C39B54]" />
              <span>{location.badge}</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse ml-1" />
            </div>

            {/* Main SEO H1 */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-5xl xl:text-6xl font-extrabold text-white leading-[1.12] tracking-tight">
              {location.headline}
            </h1>

            {/* Subheadline & Narrative */}
            <p className="text-base sm:text-lg text-gray-200 leading-relaxed max-w-2xl font-normal">
              {location.subheadline}
            </p>

            {/* Quick Hero Postcode Checker Card */}
            <div className="p-5 sm:p-6 rounded-3xl bg-white/10 backdrop-blur-md border border-white/20 shadow-2xl max-w-xl">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-extrabold text-[#C39B54] uppercase tracking-wider flex items-center gap-1.5">
                  <Search size={14} />
                  Check {location.shortName} London Postcode Delivery
                </span>
                <span className="text-[11px] font-mono text-gray-300">
                  {location.supportedPostcodes.length}+ Postcodes Active
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
                    value={postcode || ''}
                    onChange={(e) => {
                      setPostcode(e.target.value);
                      if (checkResult.status !== 'idle') setCheckResult({ status: 'idle' });
                    }}
                    placeholder={`e.g. ${location.samplePostcode}`}
                    className="w-full bg-black/30 border border-white/20 text-white placeholder-gray-400 text-sm font-semibold rounded-xl pl-9 pr-3 py-3 focus:outline-none focus:ring-2 focus:ring-[#C39B54] focus:border-transparent transition-all"
                  />
                </div>
                <button
                  type="submit"
                  className="bg-[#C39B54] hover:bg-yellow-600 text-white font-extrabold text-sm px-5 py-3 rounded-xl transition-all duration-150 active:scale-95 shadow-md flex items-center justify-center gap-2 shrink-0 cursor-pointer"
                >
                  <span>Check Delivery</span>
                  <ArrowRight size={15} />
                </button>
              </form>

              {/* Inline Checker Feedback */}
              {checkResult.status === 'success' && (
                <div className="mt-3.5 p-3 rounded-xl bg-emerald-950/70 border border-emerald-500/40 text-emerald-200 text-xs flex items-center justify-between animate-fadeIn">
                  <div className="flex items-center gap-2 font-bold">
                    <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
                    <span>✓ Good news! We deliver to {checkResult.areaName || location.name} on Mondays &amp; Thursdays.</span>
                  </div>
                  <Link
                    href="/menu"
                    className="underline font-extrabold text-white hover:text-emerald-300 ml-2 shrink-0"
                  >
                    View Menu &rarr;
                  </Link>
                </div>
              )}

              {checkResult.status === 'unavailable' && (
                <div className="mt-3.5 p-3 rounded-xl bg-rose-950/70 border border-rose-500/40 text-rose-200 text-xs flex items-center gap-2 font-semibold animate-fadeIn">
                  <XCircle size={16} className="text-rose-400 shrink-0" />
                  <span>Sorry, {postcode.toUpperCase()} is currently outside our regular scheduled route. Please contact us for custom catering.</span>
                </div>
              )}

              {checkResult.status === 'unknown' && (
                <div className="mt-3.5 p-3 rounded-xl bg-amber-950/70 border border-amber-500/40 text-amber-200 text-xs flex items-center gap-2 font-semibold animate-fadeIn">
                  <MapPin size={16} className="text-amber-400 shrink-0" />
                  <span>Please enter a full London postcode (e.g. {location.samplePostcode}).</span>
                </div>
              )}

              {checkResult.status === 'idle' && (
                <p className="text-[11px] text-gray-300 mt-2.5">
                  Regular routes in {location.name}: {location.supportedPostcodes.slice(0, 8).join(', ')}...
                </p>
              )}
            </div>

            {/* Quick Action Buttons */}
            <div className="flex flex-wrap gap-4 pt-1">
              <Link
                href="/menu"
                className="inline-flex items-center gap-2 bg-[#C39B54] hover:bg-yellow-600 text-white font-extrabold px-7 py-3.5 rounded-xl transition-all duration-200 active:scale-95 shadow-xl shadow-yellow-950/50 text-sm tracking-wide"
              >
                <span>Order Your {location.shortName} London Tiffin</span>
                <ArrowRight size={16} />
              </Link>
              <a
                href="#how-it-works"
                className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white border border-white/20 font-bold px-5 py-3.5 rounded-xl transition-all duration-150 text-sm backdrop-blur-sm"
              >
                <span>How It Works</span>
              </a>
            </div>

            {/* Key Trust Signals */}
            <div className="pt-2 grid grid-cols-2 sm:grid-cols-3 gap-3 max-w-xl">
              <div className="flex items-center gap-2.5 p-3 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
                <div className="w-8 h-8 rounded-lg bg-[#C39B54]/20 flex items-center justify-center shrink-0">
                  <Clock size={16} className="text-[#C39B54]" />
                </div>
                <div className="leading-tight">
                  <div className="text-xs font-extrabold text-white">Mon &amp; Thu</div>
                  <div className="text-[11px] text-gray-300">Fresh Deliveries</div>
                </div>
              </div>

              <div className="flex items-center gap-2.5 p-3 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center shrink-0">
                  <Leaf size={16} className="text-emerald-400" />
                </div>
                <div className="leading-tight">
                  <div className="text-xs font-extrabold text-white">Pure Veg &amp; Vegan</div>
                  <div className="text-[11px] text-gray-300">Zero Animal Fats</div>
                </div>
              </div>

              <div className="flex items-center gap-2.5 p-3 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm col-span-2 sm:col-span-1">
                <div className="w-8 h-8 rounded-lg bg-[#C39B54]/20 flex items-center justify-center shrink-0">
                  <RotateCcw size={16} className="text-[#C39B54]" />
                </div>
                <div className="leading-tight">
                  <div className="text-xs font-extrabold text-white">Zero Plastic</div>
                  <div className="text-[11px] text-gray-300">Stainless Dabbas</div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: High-Res Food Photography Card with Floating Badges */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="relative w-full max-w-lg group">
              {/* Decorative warm aura glow behind image */}
              <div className="absolute -inset-2 bg-gradient-to-r from-[#C39B54]/30 via-emerald-500/20 to-[#C39B54]/30 rounded-3xl blur-2xl opacity-60 group-hover:opacity-90 transition-opacity duration-500" />

              {/* Main Food Photo Frame */}
              <div className="relative rounded-3xl overflow-hidden border-2 border-white/20 bg-[#12271C] shadow-2xl transition-all duration-300 group-hover:border-[#C39B54]/60">
                <div className="relative w-full aspect-[4/3] sm:aspect-square">
                  <Image
                    src={location.heroImage}
                    alt={location.heroImageAlt || `${location.name} Indian Tiffin Delivery`}
                    fill
                    priority
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 40vw"
                    className="object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
                  />
                  {/* Subtle darkening gradient at bottom of image for readability */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />
                </div>

                {/* Overlaid Featured Dish Info */}
                <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-6 text-white space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-[#C39B54] text-[#1E3B2B] text-[10px] font-black uppercase tracking-wider">
                      Featured in {location.name}
                    </span>
                    <span className="text-[11px] text-gray-300 font-medium">Freshly Cooked Daily</span>
                  </div>

                  <h3 className="text-lg sm:text-xl font-extrabold text-white tracking-tight drop-shadow-md">
                    {location.heroDishName}
                  </h3>

                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {location.heroDishTags.map((tag, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 rounded-md bg-white/20 backdrop-blur-md text-[11px] font-bold text-gray-100 border border-white/10"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Floating Social Proof Badge (Top Right) */}
              <div className="absolute -top-4 -right-4 sm:-top-5 sm:-right-5 bg-white text-gray-900 rounded-2xl shadow-2xl p-3 sm:p-3.5 border border-gray-100 flex items-center gap-2.5 z-20">
                <div className="w-9 h-9 rounded-xl bg-amber-50 flex items-center justify-center text-amber-500">
                  <Star size={18} className="fill-amber-400 text-amber-400" />
                </div>
                <div className="leading-tight">
                  <div className="text-xs font-black text-gray-900">4.9 / 5.0 Rating</div>
                  <div className="text-[11px] text-gray-500 font-semibold">1,200+ London Reviews</div>
                </div>
              </div>

              {/* Floating Reusable Dabba Badge (Bottom Left) */}
              <div className="absolute -bottom-4 -left-4 sm:-bottom-5 sm:-left-5 bg-[#1E3B2B] text-white rounded-2xl shadow-2xl p-3 border border-white/20 flex items-center gap-2.5 z-20">
                <div className="w-8 h-8 rounded-xl bg-[#C39B54]/20 flex items-center justify-center">
                  <ShieldCheck size={18} className="text-[#C39B54]" />
                </div>
                <div className="leading-tight">
                  <div className="text-xs font-black text-white">5-Star Food Hygiene</div>
                  <div className="text-[10px] text-emerald-300 font-medium">Council Inspected Kitchen</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
