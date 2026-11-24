'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, CheckCircle2, Sparkles, ShieldCheck, Flame, RotateCcw, PackageCheck } from 'lucide-react';

interface LocationHowItWorksProps {
  locationName: string;
}

export default function LocationHowItWorks({ locationName }: LocationHowItWorksProps) {
  return (
    <section id="how-it-works" className="py-20 lg:py-28 bg-[#FAF7F2] text-stone-900 relative overflow-hidden font-sans">
      {/* Decorative floating crystal-clear food dishes beside header */}
      <div className="absolute top-8 left-4 sm:left-8 lg:left-14 w-20 h-20 sm:w-28 sm:h-28 lg:w-32 lg:h-32 rounded-full overflow-hidden shadow-2xl border-4 border-white pointer-events-none hidden md:block rotate-[-8deg] z-20">
        <Image
          src="/Tomato Cucumber Salad_Soya Chaap subzi_Tofu Jalfrezi_Jasmine Rice.png"
          alt="Fresh authentic homestyle Indian feast"
          fill
          quality={95}
          sizes="(max-width: 1024px) 112px, 128px"
          className="object-cover"
        />
      </div>

      <div className="absolute top-10 right-4 sm:right-8 lg:right-14 w-24 h-24 sm:w-32 sm:h-32 lg:w-36 lg:h-36 rounded-full overflow-hidden shadow-2xl border-4 border-white pointer-events-none hidden md:block rotate-[10deg] z-20">
        <Image
          src="/chilli garlic broccoli_mix bean subji_methi mutter thadka_fox millet rice.png"
          alt="Steaming curry bowl tiffin selection"
          fill
          quality={95}
          sizes="(max-width: 1024px) 128px, 144px"
          className="object-cover"
        />
      </div>

      {/* Subtle Warm Atmospheric Accents */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#C39B54]/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-96 h-96 bg-[#142A1E]/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-20 space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#142A1E]/10 text-[#142A1E] text-xs font-black uppercase tracking-widest border border-[#142A1E]/15">
            <Sparkles size={13} className="text-[#C39B54]" />
            <span>The Zero-Waste Homestyle Ritual</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#142A1E] tracking-tight leading-[1.15] font-sans">
            How DoMeal Works
          </h2>

          <p className="text-stone-700 text-base sm:text-lg font-medium leading-relaxed max-w-2xl mx-auto">
            Authentic homestyle Indian feasting, reusable stainless steel tiffins, and zero single-use plastics.
          </p>
        </div>

        {/* 3 Bespoke Alternating Editorial Steps with Refined Visual Continuity */}
        <div className="space-y-24 lg:space-y-32">
          {/* STEP 01: Image on Left, Editorial Story on Right */}
          <div className="relative grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center">
            {/* Step 01 Image Frame */}
            <div className="lg:col-span-7">
              <div className="relative w-full aspect-[4/3] rounded-[2.5rem] overflow-hidden shadow-2xl border-4 border-white bg-white group">
                <Image
                  src="/banner.png"
                  alt={`DoMeal fresh tiffin feast crafted for ${locationName}`}
                  fill
                  quality={95}
                  sizes="(max-width: 1024px) 100vw, 55vw"
                  className="object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
                />
                {/* Floating pill badge */}
                <div className="absolute bottom-5 left-5 bg-white/95 backdrop-blur-md px-4 py-2 rounded-2xl shadow-lg border border-stone-100 flex items-center gap-2.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-xs font-black text-[#142A1E] uppercase tracking-wider">
                    Morning Cooked &bull; Never Frozen
                  </span>
                </div>
              </div>
            </div>

            {/* Step 01 Story Column */}
            <div className="lg:col-span-5 space-y-5 text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#C39B54]/15 text-[#8C6B28] text-xs font-black uppercase tracking-wider border border-[#C39B54]/30">
                <Flame size={13} className="text-[#C39B54]" />
                <span>Step 01 &bull; Curate Your Feast</span>
              </div>

              <h3 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#142A1E] leading-[1.2] tracking-tight font-sans">
                Crafted from 21-Year Family Recipes
              </h3>

              <p className="text-stone-700 text-base leading-relaxed">
                Select your preferred regional thalis, wholesome dals, artisanal rotis, and ancient millet bowls.
                Our London kitchen cooks in small morning batches with unrefined cold-pressed oils and stone-ground
                masalas—free from artificial preservatives, thickeners, or colorings.
              </p>

              {/* Verified Feature Points (Clear, Bold, Highly Visible) */}
              <ul className="space-y-3 pt-2">
                <li className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center shrink-0 mt-0.5 text-emerald-800">
                    <CheckCircle2 size={15} />
                  </div>
                  <span className="text-[#142A1E] font-bold text-sm sm:text-base leading-snug">
                    Rotating weekly menu with South &amp; North Indian specialties
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center shrink-0 mt-0.5 text-emerald-800">
                    <CheckCircle2 size={15} />
                  </div>
                  <span className="text-[#142A1E] font-bold text-sm sm:text-base leading-snug">
                    Natural protein-dense vegetarian &amp; vegan nutrition profiles
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center shrink-0 mt-0.5 text-emerald-800">
                    <CheckCircle2 size={15} />
                  </div>
                  <span className="text-[#142A1E] font-bold text-sm sm:text-base leading-snug">
                    Pause, skip, or modify your preferences anytime online
                  </span>
                </li>
              </ul>

              <div className="pt-3">
                <a
                  href="#menu"
                  className="inline-flex items-center gap-2 text-base font-extrabold text-[#142A1E] hover:text-[#C39B54] group transition-colors"
                >
                  <span className="underline decoration-2 underline-offset-4">Explore This Week&apos;s Menu</span>
                  <span className="text-lg transition-transform group-hover:translate-x-1.5">&rarr;</span>
                </a>
              </div>
            </div>

            {/* Refined Brass Curved Progression Connector */}
            <div className="hidden lg:block absolute -bottom-20 right-1/4 pointer-events-none z-20 text-[#C39B54]">
              <svg width="120" height="90" viewBox="0 0 120 90" fill="none" className="rotate-[-6deg]">
                <path
                  d="M15 15 C 45 40, 75 25, 95 65"
                  stroke="#C39B54"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeDasharray="6 6"
                />
                <circle cx="95" cy="65" r="4" fill="#C39B54" />
              </svg>
            </div>
          </div>

          {/* STEP 02: Story on Left, Image on Right */}
          <div className="relative grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center">
            {/* Step 02 Story Column (Order 2 on mobile, Order 1 on desktop) */}
            <div className="lg:col-span-5 space-y-5 text-left order-2 lg:order-1">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#142A1E]/10 text-[#142A1E] text-xs font-black uppercase tracking-wider border border-[#142A1E]/20">
                <PackageCheck size={13} className="text-[#C39B54]" />
                <span>Step 02 &bull; Chilled Zero-Plastic Dispatch</span>
              </div>

              <h3 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#142A1E] leading-[1.2] tracking-tight font-sans">
                Chilled in Heritage Stainless Steel Tiffins
              </h3>

              <p className="text-stone-700 text-base leading-relaxed">
                Your meals are portioned hot into durable 3-tier food-grade stainless steel dabbas, rapidly chilled
                to lock in optimal freshness and micronutrients, and dispatched in insulated thermal carriers.
                Delivered across {locationName} every Monday &amp; Thursday.
              </p>

              {/* Verified Feature Points */}
              <ul className="space-y-3 pt-2">
                <li className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center shrink-0 mt-0.5 text-emerald-800">
                    <CheckCircle2 size={15} />
                  </div>
                  <span className="text-[#142A1E] font-bold text-sm sm:text-base leading-snug">
                    100% certified food-grade 304 stainless steel
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center shrink-0 mt-0.5 text-emerald-800">
                    <CheckCircle2 size={15} />
                  </div>
                  <span className="text-[#142A1E] font-bold text-sm sm:text-base leading-snug">
                    Temperature-controlled chilled logistics chain
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center shrink-0 mt-0.5 text-emerald-800">
                    <CheckCircle2 size={15} />
                  </div>
                  <span className="text-[#142A1E] font-bold text-sm sm:text-base leading-snug">
                    Concierge, front-porch, or safe-place contactless drop-off
                  </span>
                </li>
              </ul>

              <div className="pt-3">
                <a
                  href="#neighbourhoods"
                  className="inline-flex items-center gap-2 text-base font-extrabold text-[#142A1E] hover:text-[#C39B54] group transition-colors"
                >
                  <span className="underline decoration-2 underline-offset-4">Verify Your Postcode Delivery</span>
                  <span className="text-lg transition-transform group-hover:translate-x-1.5">&rarr;</span>
                </a>
              </div>
            </div>

            {/* Step 02 Image Frame (Order 1 on mobile, Order 2 on desktop) */}
            <div className="lg:col-span-7 order-1 lg:order-2 relative">
              <div className="relative w-full aspect-[4/3] rounded-[2.5rem] overflow-hidden shadow-2xl border-4 border-white bg-white group">
                <Image
                  src="/Tomato Cucumber Salad_Soya Chaap subzi_Tofu Jalfrezi_Jasmine Rice.png"
                  alt={`DoMeal fresh multi-tier tiffin delivery for ${locationName}`}
                  fill
                  quality={95}
                  sizes="(max-width: 1024px) 100vw, 55vw"
                  className="object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
                />
              </div>
            </div>

            {/* Refined Brass Curved Progression Connector */}
            <div className="hidden lg:block absolute -bottom-20 left-1/4 pointer-events-none z-20 text-[#C39B54]">
              <svg width="120" height="90" viewBox="0 0 120 90" fill="none" className="rotate-[12deg]">
                <path
                  d="M100 15 C 70 45, 45 25, 25 65"
                  stroke="#C39B54"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeDasharray="6 6"
                />
                <circle cx="25" cy="65" r="4" fill="#C39B54" />
              </svg>
            </div>
          </div>

          {/* STEP 03: Image on Left, Editorial Story on Right */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center">
            {/* Step 03 Image Frame */}
            <div className="lg:col-span-7 relative">
              <div className="relative w-full aspect-[4/3] rounded-[2.5rem] overflow-hidden shadow-2xl border-4 border-white bg-white group">
                <Image
                  src="/Chickpea Salad_Aloo Fry_Aloo Gobi Masala_Jeera Rice.png"
                  alt="DoMeal piping hot homestyle feast served in 5 minutes"
                  fill
                  quality={95}
                  sizes="(max-width: 1024px) 100vw, 55vw"
                  className="object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
                />
              </div>

              {/* Floating Zero-Plastic Badge */}
              <div className="absolute -top-6 -right-4 sm:-right-8 bg-white px-4 py-2.5 rounded-2xl shadow-xl border border-stone-100 flex items-center gap-2.5 rotate-[6deg]">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs font-black text-[#142A1E] uppercase tracking-wider">
                  Zero Single-Use Plastic
                </span>
              </div>
            </div>

            {/* Step 03 Story Column */}
            <div className="lg:col-span-5 space-y-5 text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#142A1E]/10 text-[#142A1E] text-xs font-black uppercase tracking-wider border border-[#142A1E]/20">
                <RotateCcw size={13} className="text-[#C39B54]" />
                <span>Step 03 &bull; 5-Min Heat &amp; Seamless Swap</span>
              </div>

              <h3 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#142A1E] leading-[1.2] tracking-tight font-sans">
                Effortless 5-Minute Heat &amp; Doorstep Exchange
              </h3>

              <p className="text-stone-700 text-base leading-relaxed">
                Reheat gently in 5 minutes in your oven, steam over a pan, or plate into your microwave.
                When your next delivery arrives, simply hand your rinsed dabba to our driver or leave it outside.
                We commercially sanitize and inspect every tin.
              </p>

              {/* Verified Feature Points */}
              <ul className="space-y-3 pt-2">
                <li className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center shrink-0 mt-0.5 text-emerald-800">
                    <CheckCircle2 size={15} />
                  </div>
                  <span className="text-[#142A1E] font-bold text-sm sm:text-base leading-snug">
                    Piping hot homestyle feast ready in under 5 minutes
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center shrink-0 mt-0.5 text-emerald-800">
                    <CheckCircle2 size={15} />
                  </div>
                  <span className="text-[#142A1E] font-bold text-sm sm:text-base leading-snug">
                    Free doorstep collection &amp; exchange on your next route
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center shrink-0 mt-0.5 text-emerald-800">
                    <CheckCircle2 size={15} />
                  </div>
                  <span className="text-[#142A1E] font-bold text-sm sm:text-base leading-snug">
                    Zero washing up grease, zero single-use plastic waste
                  </span>
                </li>
              </ul>

              <div className="pt-3">
                <a
                  href="#menu"
                  className="inline-flex items-center gap-2 text-base font-extrabold text-[#142A1E] hover:text-[#C39B54] group transition-colors"
                >
                  <span className="underline decoration-2 underline-offset-4">Start Your Subscription</span>
                  <span className="text-lg transition-transform group-hover:translate-x-1.5">&rarr;</span>
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Reusable Dabba Swap Guarantee Card */}
        <div className="mt-20 p-8 sm:p-10 rounded-[2.5rem] bg-white border-2 border-[#142A1E]/15 shadow-xl flex flex-col md:flex-row items-center justify-between gap-8 max-w-4xl mx-auto">
          <div className="space-y-2 text-center md:text-left">
            <div className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-wider text-[#C39B54]">
              <ShieldCheck size={14} />
              <span>Transparent Deposit Protection</span>
            </div>
            <h4 className="text-xl sm:text-2xl font-extrabold text-[#142A1E] font-sans">
              Standard Refundable £12 Dabba Deposit
            </h4>
            <p className="text-sm text-stone-600 leading-relaxed max-w-xl">
              Your first order includes a standard £12 deposit for your 3-tier stainless steel containers.
              Every delivery day, our driver swaps your clean empty dabba. Cancel anytime for a 100% full refund.
            </p>
          </div>
          <Link
            href="/menu"
            className="bg-[#142A1E] hover:bg-[#1E3B2B] text-white font-black text-sm px-8 py-4 rounded-2xl transition-all duration-150 active:scale-95 shadow-lg shrink-0 flex items-center gap-2.5 cursor-pointer"
          >
            <span>Choose Your Plan</span>
            <ArrowRight size={16} className="text-[#C39B54]" />
          </Link>
        </div>
      </div>
    </section>
  );
}
