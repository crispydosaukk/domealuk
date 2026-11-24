'use client';

import React from 'react';
import Link from 'next/link';
import { X, Check, ArrowRight, Leaf } from 'lucide-react';

interface LocationEcoComparisonProps {
  locationName: string;
}

export default function LocationEcoComparison({ locationName }: LocationEcoComparisonProps) {
  return (
    <section className="py-20 lg:py-28 bg-[#142A1E] text-white relative overflow-hidden border-b border-[#C39B54]/20 font-sans">
      <div className="max-w-screen-2xl mx-auto px-4 lg:px-8 xl:px-12 relative z-10">
        {/* Header (Semantic H2) */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-black uppercase tracking-widest text-[#C39B54]">
            <Leaf size={14} className="text-[#C39B54]" />
            <span>A Better Way to Eat in London</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight font-sans">
            Commercial Takeaway vs. DoMeal Dabba
          </h2>

          <p className="text-base sm:text-lg text-gray-300 leading-relaxed max-w-2xl mx-auto">
            Traditional takeaways flood London with thousands of single-use plastic tubs every night.
            DoMeal replaces waste with a timeless, zero-plastic circular model.
          </p>
        </div>

        {/* Side-by-Side Comparison Grid (5 Points Each Side) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {/* Card 1: Commercial Takeaway (Left - 5 Points) */}
          <div className="rounded-3xl p-8 bg-black/40 border border-white/10 backdrop-blur-md space-y-6">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <span className="text-xs font-bold text-rose-400 uppercase tracking-wider block">
                  The Outdated Way
                </span>
                <h3 className="text-2xl font-extrabold text-white mt-1 font-sans">
                  Typical London Takeaways
                </h3>
              </div>
              <span className="w-10 h-10 rounded-2xl bg-rose-500/20 text-rose-400 flex items-center justify-center font-black">
                ✕
              </span>
            </div>

            <ul className="space-y-4 text-sm text-gray-300">
              <li className="flex items-start gap-3">
                <X size={18} className="text-rose-400 shrink-0 mt-0.5" />
                <span>Single-use black plastic containers and bags destined for landfill.</span>
              </li>
              <li className="flex items-start gap-3">
                <X size={18} className="text-rose-400 shrink-0 mt-0.5" />
                <span>Heavy restaurant cream, artificial food colors, and excessive oil.</span>
              </li>
              <li className="flex items-start gap-3">
                <X size={18} className="text-rose-400 shrink-0 mt-0.5" />
                <span>Causes post-lunch food comas and sluggish digestion.</span>
              </li>
              <li className="flex items-start gap-3">
                <X size={18} className="text-rose-400 shrink-0 mt-0.5" />
                <span>Expensive delivery surcharges and unpredictable arrival times.</span>
              </li>
              <li className="flex items-start gap-3">
                <X size={18} className="text-rose-400 shrink-0 mt-0.5" />
                <span>Frozen and reheated food with lost nutrients and artificial taste.</span>
              </li>
            </ul>
          </div>

          {/* Card 2: DoMeal Circular Tiffin (Right - 5 Points) */}
          <div className="rounded-3xl p-8 bg-gradient-to-b from-white/[0.12] to-white/[0.05] border-2 border-[#C39B54] backdrop-blur-xl space-y-6 shadow-2xl relative">
            <div className="absolute -top-3.5 right-6 bg-[#C39B54] text-[#0C1D13] text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full shadow-md">
              The Sustainable Choice
            </div>

            <div className="flex items-center justify-between border-b border-white/15 pb-4">
              <div>
                <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider block">
                  The DoMeal Way
                </span>
                <h3 className="text-2xl font-extrabold text-white mt-1 font-sans">
                  Reusable Stainless Steel Dabbas
                </h3>
              </div>
              <span className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-black">
                ✓
              </span>
            </div>

            <ul className="space-y-4 text-sm text-gray-200">
              <li className="flex items-start gap-3">
                <Check size={18} className="text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>100% Zero Single-Use Plastic</strong> — Reusable 3-tier stainless steel containers.</span>
              </li>
              <li className="flex items-start gap-3">
                <Check size={18} className="text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>Pure Vegetarian &amp; Vegan</strong> — Cold-pressed oils, hand-tempered spices, zero preservatives.</span>
              </li>
              <li className="flex items-start gap-3">
                <Check size={18} className="text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>Nourishing &amp; Digestible</strong> — Ancient millets, fresh salads, and slow-simmered dals.</span>
              </li>
              <li className="flex items-start gap-3">
                <Check size={18} className="text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>Free Dabba Swap</strong> — Our driver collects your clean container on each delivery.</span>
              </li>
              <li className="flex items-start gap-3">
                <Check size={18} className="text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>Freshly Cooked Morning Batches</strong> — Delivered chilled in 100% food-grade stainless steel dabbas, preserving aroma, nutrition, and home taste.</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom CTA Banner */}
        <div className="mt-14 text-center">
          <Link
            href="/menu"
            className="inline-flex items-center gap-2 bg-[#C39B54] hover:bg-yellow-600 text-[#0C1D13] font-black text-sm px-8 py-4 rounded-2xl transition-all duration-150 active:scale-95 shadow-xl shadow-black/40 cursor-pointer"
          >
            <span>Start Your Zero-Plastic {locationName} Feast</span>
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </section>
  );
}
