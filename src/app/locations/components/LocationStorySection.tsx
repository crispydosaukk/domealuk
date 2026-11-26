'use client';

import React from 'react';
import { LocationData } from '@/lib/locations-data';
import { Sparkles, Utensils, Heart, ShieldCheck, Leaf, Clock, ArrowRight } from 'lucide-react';

interface LocationStorySectionProps {
  location: LocationData;
}

export default function LocationStorySection({ location }: LocationStorySectionProps) {
  const quote =
    location.storyConfig?.quote ||
    '“Real Indian home cooking that nurtures your health and respects London’s environment.”';
  const quoteSub =
    location.storyConfig?.quoteSub ||
    `Crafted in London by 21-year culinary masters · Delivered fresh across ${location.name}.`;

  const fallbackParagraphs = [
    `For generations, traditional tiffin delivery in Mumbai was built on two sacred principles: hot, nourishing home-cooked food and zero packaging waste. DoMeal brings that timeless tradition straight to your doorstep in ${location.name}.`,
    `Unlike commercial takeaways that rely on heavy restaurant creams, saturated animal fats, and mountains of single-use plastic containers, our kitchen cooks everyday ghar ka khana (homestyle food). We slow-simmer whole yellow and black lentils, press fresh cold-pressed oils, hand-temper whole cumin and mustard seeds, and bake soft, wholesome rotis.`,
    `Whether you are working from a high-rise in ${location.name}, studying at university, or feeding a busy family, DoMeal ensures you never have to choose between convenience and authentic, nutritious food.`,
  ];

  const paragraphs =
    location.storyConfig?.paragraphs && location.storyConfig.paragraphs.length > 0
      ? location.storyConfig.paragraphs
      : location.introParagraphs && location.introParagraphs.length > 0
      ? location.introParagraphs
      : fallbackParagraphs;

  return (
    <section className="py-20 lg:py-28 bg-[#FBF8F3] text-gray-900 border-b border-stone-200">
      <div className="max-w-screen-2xl mx-auto px-4 lg:px-8 xl:px-12">
        {/* Top Tag & Editorial Intro */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          {/* Left Column: Big Pull Quote */}
          <div className="lg:col-span-5 space-y-5">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#1E3B2B]/10 text-[#1E3B2B] text-xs font-black uppercase tracking-widest">
              <Sparkles size={13} className="text-[#C39B54]" />
              <span>{location.storyConfig?.badge || 'Our Food Philosophy'}</span>
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#142A1E] leading-[1.15] tracking-tight font-sans">
              &ldquo;{quote.replace(/^["“]|["”]$/g, '')}&rdquo;
            </h2>

            <div className="h-1 w-20 bg-[#C39B54] rounded-full" />

            <p className="text-sm text-stone-600 font-medium">
              {quoteSub}
            </p>
          </div>

          {/* Right Column: Narrative Story & Heritage */}
          <div className="lg:col-span-7 space-y-6 text-stone-700 text-base sm:text-lg leading-relaxed font-normal">
            {paragraphs.map((p, idx) => (
              <p key={idx} className={idx === 0 ? 'font-medium text-stone-900' : ''}>
                {p}
              </p>
            ))}

            {/* 4 Brand Pillars Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-6">
              <div className="p-5 rounded-2xl bg-white border border-stone-200/80 shadow-xs flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-[#1E3B2B]/10 text-[#1E3B2B] flex items-center justify-center shrink-0">
                  <Utensils size={18} className="text-[#C39B54]" />
                </div>
                <div>
                  <h3 className="font-bold text-stone-900 text-sm">21+ Years Culinary Pedigree</h3>
                  <p className="text-xs text-stone-600 mt-1">Heirloom recipes passed down without artificial colours or MSG.</p>
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-white border border-stone-200/80 shadow-xs flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center shrink-0">
                  <Leaf size={18} className="text-emerald-700" />
                </div>
                <div>
                  <h3 className="font-bold text-stone-900 text-sm">100% Vegetarian &amp; Vegan</h3>
                  <p className="text-xs text-stone-600 mt-1">Dedicated commercial kitchen free from meat or cross-contamination.</p>
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-white border border-stone-200/80 shadow-xs flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-800 flex items-center justify-center shrink-0">
                  <Clock size={18} className="text-amber-700" />
                </div>
                <div>
                  <h3 className="font-bold text-stone-900 text-sm">Chilled Cold-Pack Delivery</h3>
                  <p className="text-xs text-stone-600 mt-1">Insulated carriers maintain freshness in your fridge for 48 hours.</p>
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-white border border-stone-200/80 shadow-xs flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-[#1E3B2B]/10 text-[#1E3B2B] flex items-center justify-center shrink-0">
                  <ShieldCheck size={18} className="text-[#C39B54]" />
                </div>
                <div>
                  <h3 className="font-bold text-stone-900 text-sm">Council 5-Star Hygiene</h3>
                  <p className="text-xs text-stone-600 mt-1">Independently inspected commercial facility meeting highest UK standards.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
