'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, Sparkles, CheckCircle2, ShieldCheck, Heart, RotateCcw } from 'lucide-react';

interface LocationFinalCTAProps {
  locationName: string;
}

export default function LocationFinalCTA({ locationName }: LocationFinalCTAProps) {
  return (
    <section className="py-20 lg:py-28 bg-[#0C1D13] relative overflow-hidden text-white border-t border-[#C39B54]/25">
      {/* Decorative ambient glow */}
      <div className="absolute inset-0 pointer-events-none opacity-25">
        <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-[#C39B54] rounded-full blur-[160px] animate-pulse-warm" />
        <div className="absolute bottom-0 left-10 w-[450px] h-[450px] bg-[#142A1E] rounded-full blur-[140px]" />
      </div>

      <div className="max-w-4xl mx-auto px-4 lg:px-8 text-center relative z-10 space-y-7">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-black text-[#C39B54] uppercase tracking-widest shadow-sm">
          <Sparkles size={14} className="text-[#C39B54]" />
          <span>Active Route in {locationName}</span>
        </div>

        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white leading-tight tracking-tight font-sans">
          Ready to Experience Handcrafted Home Food in {locationName}?
        </h2>

        <p className="text-base sm:text-lg text-gray-200 max-w-2xl mx-auto leading-relaxed font-normal">
          No shopping, no cooking, no greasy takeaway boxes, and no pots to scrub. Freshly cooked,
          authentic Indian curries and hand-rolled rotis delivered in reusable stainless dabbas every Monday &amp; Thursday.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-4 pt-3">
          <Link
            href="/menu"
            className="inline-flex items-center gap-2.5 bg-[#C39B54] hover:bg-yellow-600 text-[#0C1D13] font-black px-9 py-4 rounded-2xl transition-all duration-150 active:scale-95 shadow-2xl shadow-yellow-950/60 text-base cursor-pointer"
          >
            <span>Order Your {locationName} Tiffin Feast</span>
            <ArrowRight size={18} />
          </Link>
          <a
            href="#postcode-checker"
            className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white border border-white/25 font-bold px-7 py-4 rounded-2xl transition-all duration-150 text-sm backdrop-blur-md"
          >
            Check Postcode First
          </a>
        </div>

        {/* Trust Guarantees */}
        <div className="pt-10 grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-white/15 max-w-3xl mx-auto text-xs text-gray-300">
          <div className="flex items-center justify-center gap-2">
            <CheckCircle2 size={16} className="text-[#C39B54] shrink-0" />
            <span>Pause or Cancel Anytime</span>
          </div>
          <div className="flex items-center justify-center gap-2">
            <ShieldCheck size={16} className="text-[#C39B54] shrink-0" />
            <span>100% Pure Vegetarian Kitchen</span>
          </div>
          <div className="flex items-center justify-center gap-2">
            <RotateCcw size={16} className="text-[#C39B54] shrink-0" />
            <span>Refundable £12 Dabba Deposit</span>
          </div>
        </div>
      </div>
    </section>
  );
}
