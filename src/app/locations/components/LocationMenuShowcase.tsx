'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { LocationData } from '@/lib/locations-data';
import { Sparkles, ArrowRight, Utensils, CheckCircle } from 'lucide-react';

interface LocationMenuShowcaseProps {
  location: LocationData;
}

export default function LocationMenuShowcase({ location }: LocationMenuShowcaseProps) {
  return (
    <section className="py-16 lg:py-24 bg-[#FBF9F5] border-b border-gray-200">
      <div className="max-w-screen-2xl mx-auto px-4 lg:px-8 xl:px-10">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#1E3B2B]/10 text-[#1E3B2B] text-xs font-black uppercase tracking-widest">
              <Sparkles size={13} className="text-[#C39B54]" />
              <span>Chef&apos;s Weekly Rotation</span>
            </div>
            <h2 className="text-3xl lg:text-4xl font-extrabold text-[#1E3B2B] tracking-tight">
              Popular Meals Delivered in {location.name}
            </h2>
            <p className="text-gray-600 text-base leading-relaxed">
              Every meal is prepared fresh in our London commercial kitchen using cold-pressed oils,
              heirloom spice blends, and zero artificial preservatives. Delivered in reusable stainless
              steel dabbas.
            </p>
          </div>

          <Link
            href="/menu"
            className="inline-flex items-center gap-2 bg-[#1E3B2B] hover:bg-[#14291E] text-white text-sm font-extrabold px-6 py-3.5 rounded-xl transition-all duration-150 shadow-md shrink-0 cursor-pointer"
          >
            <Utensils size={16} className="text-[#C39B54]" />
            <span>View Full Menu &amp; Meal Plans</span>
            <ArrowRight size={15} />
          </Link>
        </div>

        {/* 3 Featured Dish Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {location.featuredDishes.map((dish, idx) => (
            <div
              key={idx}
              className="group bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-2xl hover:border-[#C39B54]/50 transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                {/* Dish Image Container */}
                <div className="relative w-full aspect-[4/3] overflow-hidden bg-gray-100">
                  <Image
                    src={dish.image}
                    alt={`${dish.title} — DoMeal ${location.name}`}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-cover object-center group-hover:scale-105 transition-transform duration-500 ease-out"
                  />
                  {/* Nutrition & Portion Tag */}
                  <div className="absolute top-3.5 right-3.5 bg-black/75 backdrop-blur-md text-white text-[11px] font-bold px-3 py-1 rounded-full border border-white/15">
                    {dish.nutritionBadge}
                  </div>
                </div>

                {/* Content */}
                <div className="p-6 space-y-3">
                  <div className="flex flex-wrap gap-1.5">
                    {dish.tags.map((tag, tIdx) => (
                      <span
                        key={tIdx}
                        className="px-2.5 py-0.5 rounded-md bg-[#1E3B2B]/5 text-[#1E3B2B] text-[11px] font-bold border border-[#1E3B2B]/10"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  <h3 className="text-xl font-extrabold text-[#1E3B2B] group-hover:text-amber-800 transition-colors leading-snug">
                    {dish.title}
                  </h3>

                  <p className="text-sm text-gray-600 leading-relaxed">
                    {dish.description}
                  </p>
                </div>
              </div>

              {/* Card Footer with Quick CTA */}
              <div className="px-6 pb-6 pt-2 border-t border-gray-100 flex items-center justify-between text-xs">
                <span className="flex items-center gap-1.5 text-emerald-700 font-bold">
                  <CheckCircle size={14} className="text-emerald-600" /> Reusable Dabba Ready
                </span>
                <Link
                  href="/menu"
                  className="font-extrabold text-[#C39B54] group-hover:text-yellow-700 inline-flex items-center gap-1"
                >
                  <span>Select Plan</span>
                  <ArrowRight size={13} className="transition-transform group-hover:translate-x-1" />
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* Heritage Trust Strip */}
        <div className="mt-12 p-6 sm:p-8 rounded-3xl bg-white border border-gray-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-1 text-center md:text-left">
            <h4 className="text-base sm:text-lg font-extrabold text-[#1E3B2B]">
              21+ Years of Authentic Indian Culinary Heritage
            </h4>
            <p className="text-xs sm:text-sm text-gray-600 max-w-2xl leading-relaxed">
              Every recipe is handed down through generations. We source whole spices, cook in small
              batches, and pack into thermal carriers so your meal arrives just like mum made it.
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <span className="text-xs font-bold text-gray-700 bg-gray-100 px-3 py-1.5 rounded-xl border border-gray-200">
              ✓ 100% Vegetarian
            </span>
            <span className="text-xs font-bold text-gray-700 bg-gray-100 px-3 py-1.5 rounded-xl border border-gray-200">
              ✓ Zero Single-Use Plastic
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
