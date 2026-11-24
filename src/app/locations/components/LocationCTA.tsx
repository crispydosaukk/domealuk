'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, Sparkles, CheckCircle2, ShieldCheck, Heart } from 'lucide-react';

interface LocationCTAProps {
  locationName: string;
}

export default function LocationCTA({ locationName }: LocationCTAProps) {
  return (
    <section className="py-16 lg:py-24 bg-[#1E3B2B] relative overflow-hidden text-white">
      {/* Decorative background glows */}
      <div className="absolute inset-0 pointer-events-none opacity-20">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#C39B54] rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-10 w-80 h-80 bg-[#C39B54] rounded-full blur-3xl opacity-30" />
      </div>

      <div className="max-w-4xl mx-auto px-4 lg:px-8 text-center relative z-10 space-y-6">
        <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-800 text-[#C39B54] uppercase tracking-widest shadow-sm">
          <Sparkles size={14} className="text-[#C39B54]" />
          Delivering Daily Across {locationName}
        </div>

        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white leading-tight tracking-tight">
          Ready to Experience Authentic Home Food in {locationName}?
        </h2>

        <p className="text-base sm:text-lg text-gray-200 max-w-2xl mx-auto leading-relaxed">
          Say goodbye to meal prep, dirty pots, and greasy takeaways. Join hundreds of happy customers
          across {locationName} enjoying healthy, freshly cooked Indian tiffins delivered right to their
          door.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
          <Link
            href="/menu"
            className="inline-flex items-center gap-2.5 bg-[#C39B54] hover:bg-yellow-700 text-white font-extrabold px-8 py-4 rounded-xl transition-all duration-150 active:scale-95 shadow-xl shadow-yellow-950/50 text-base"
          >
            <span>Order Your {locationName} Tiffin</span>
            <ArrowRight size={18} />
          </Link>
          <a
            href="#postcode-checker"
            className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white border border-white/25 font-700 px-6 py-4 rounded-xl transition-all duration-150 text-sm backdrop-blur-md"
          >
            Check Postcode First
          </a>
        </div>

        {/* Guarantees */}
        <div className="pt-8 grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-white/15 max-w-3xl mx-auto text-xs text-gray-300">
          <div className="flex items-center justify-center gap-2">
            <CheckCircle2 size={16} className="text-[#C39B54] shrink-0" />
            <span>Pause or Cancel Anytime</span>
          </div>
          <div className="flex items-center justify-center gap-2">
            <ShieldCheck size={16} className="text-[#C39B54] shrink-0" />
            <span>100% Pure Vegetarian Kitchen</span>
          </div>
          <div className="flex items-center justify-center gap-2">
            <Heart size={16} className="text-[#C39B54] shrink-0" />
            <span>Zero Plastic Packaging</span>
          </div>
        </div>
      </div>
    </section>
  );
}
