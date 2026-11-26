'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Sparkles, Utensils, Check, ArrowRight, Layers } from 'lucide-react';
import { LocationDabbaTier } from '@/lib/locations-data';

interface LocationDabbaAnatomyProps {
  locationName: string;
  customTiers?: LocationDabbaTier[];
  title?: string;
  badge?: string;
}

export default function LocationDabbaAnatomy({
  locationName,
  customTiers,
  title,
  badge,
}: LocationDabbaAnatomyProps) {
  const [activeTier, setActiveTier] = useState<number>(0);

  const defaultTiers = [
    {
      tierNumber: 'Tier 01',
      title: 'The Signature Subzi & Curry',
      subtitle: 'Slow-simmered in cold-pressed mustard & sesame oils',
      desc: 'The vibrant heart of your tiffin. Features rotating homestyle curries like Kadai Vegetables, Aloo Gobi Masala, Tofu Jalfrezi, Soya Chettinad, or Baingan Bhartha. Slow-cooked with whole spices and zero artificial food colorings.',
      highlight: 'Vitamins & Antioxidants',
      badge: 'Plant Powered',
    },
    {
      tierNumber: 'Tier 02',
      title: 'The Comforting Dal & Lentil Stew',
      subtitle: 'Simmered for hours with roasted cumin & garlic tadka',
      desc: 'High-protein lentil goodness that warms you from the inside out. Rotating between creamy Dal Palak with fresh baby spinach, traditional Yellow Tadka Dal, aromatic South Indian Sambar, and royal Rajma Masala.',
      highlight: 'High Natural Protein & Iron',
      badge: 'Protein Dense',
    },
    {
      tierNumber: 'Tier 03',
      title: 'Handmade Breads & Heritage Grains',
      subtitle: 'Ancient fox millets, little millets, or fragrant basmati',
      desc: 'Pair your curries with hand-rolled wholewheat rotis (chapatis) or ancient unpolished grains like Fox Millet and Little Millet. Low glycemic index and rich in slow-burning complex carbohydrates.',
      highlight: 'Fibre & Steady Energy',
      badge: 'Low GI Grains',
    },
    {
      tierNumber: 'Tier 04',
      title: 'Fresh Salad, Crunch & Chutneys',
      subtitle: 'Sprouted green gram, roasted peanuts & artisanal relishes',
      desc: 'No Indian thali is complete without texture and digestive harmony. Includes crunchy sprouted green gram with roasted salted peanuts, fresh cucumber kachumber, and tangy homemade chutneys.',
      highlight: 'Enzymes & Gut Health',
      badge: 'Raw Nutrition',
    },
  ];

  const tiers = customTiers && customTiers.length > 0 ? customTiers : defaultTiers;
  const displayTitle = title || `What's Inside Your ${locationName} Dabba?`;
  const displayBadge = badge || 'The Anatomy of a DoMeal Feast';

  return (
    <section className="py-20 lg:py-28 bg-[#F5EFE6] text-stone-900 border-b border-stone-200">
      <div className="max-w-screen-2xl mx-auto px-4 lg:px-8 xl:px-12">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#1E3B2B]/10 text-[#1E3B2B] text-xs font-black uppercase tracking-widest">
            <Layers size={14} className="text-[#C39B54]" />
            <span>{displayBadge}</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#142A1E] tracking-tight leading-tight font-sans">
            {displayTitle}
          </h2>

          <p className="text-base sm:text-lg text-stone-600 leading-relaxed max-w-2xl mx-auto">
            Each multi-tier stainless steel tiffin is an all-inclusive, balanced Indian thali feast designed to
            deliver complete protein, complex carbs, and vibrant flavours in every layer.
          </p>
        </div>

        {/* 4-Tier Interactive Walkthrough Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          {tiers.map((tier, idx) => {
            const isSelected = activeTier === idx;
            return (
              <div
                key={idx}
                onClick={() => setActiveTier(idx)}
                className={`lg:col-span-3 rounded-3xl p-7 transition-all duration-300 cursor-pointer flex flex-col justify-between border ${
                  isSelected
                    ? 'bg-[#142A1E] text-white shadow-2xl border-[#C39B54] scale-[1.02]'
                    : 'bg-white text-stone-800 border-stone-200 hover:border-stone-400 hover:shadow-lg'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span
                      className={`text-xs font-mono font-black tracking-widest uppercase ${
                        isSelected ? 'text-[#C39B54]' : 'text-stone-500'
                      }`}
                    >
                      {tier.tierNumber}
                    </span>
                    <span
                      className={`text-[11px] font-black uppercase px-2.5 py-0.5 rounded-full ${
                        isSelected
                          ? 'bg-[#C39B54] text-[#0C1D13]'
                          : 'bg-stone-100 text-stone-700 border border-stone-200'
                      }`}
                    >
                      {tier.badge}
                    </span>
                  </div>

                  <h3
                    className={`text-xl font-extrabold mb-2 font-sans ${
                      isSelected ? 'text-white' : 'text-stone-900'
                    }`}
                  >
                    {tier.title}
                  </h3>

                  <p
                    className={`text-xs font-medium mb-4 ${
                      isSelected ? 'text-[#E8C482]' : 'text-amber-800'
                    }`}
                  >
                    {tier.subtitle}
                  </p>

                  <p
                    className={`text-sm leading-relaxed ${
                      isSelected ? 'text-gray-200' : 'text-stone-600'
                    }`}
                  >
                    {tier.desc}
                  </p>
                </div>

                <div
                  className={`mt-6 pt-4 border-t text-xs font-bold flex items-center justify-between ${
                    isSelected ? 'border-white/20 text-emerald-400' : 'border-stone-100 text-stone-700'
                  }`}
                >
                  <span className="flex items-center gap-1.5">
                    <Check size={14} className={isSelected ? 'text-emerald-400' : 'text-[#C39B54]'} />
                    {tier.highlight}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom CTA Banner */}
        <div className="mt-12 text-center">
          <Link
            href="/menu"
            className="inline-flex items-center gap-2 bg-[#142A1E] hover:bg-[#1E3B2B] text-white text-sm font-black px-8 py-4 rounded-2xl transition-all duration-150 active:scale-95 shadow-xl shadow-stone-900/10"
          >
            <Utensils size={16} className="text-[#C39B54]" />
            <span>View This Week&apos;s Rotating Dabba Menu</span>
            <ArrowRight size={15} />
          </Link>
        </div>
      </div>
    </section>
  );
}
