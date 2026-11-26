'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { getAllLocations } from '@/lib/locations-data';
import { MapPin, ArrowRight, Navigation, Clock, CheckCircle2 } from 'lucide-react';

export default function ExploreLocationsSection() {
  const locations = getAllLocations(); // Returns only active location(s): West London

  return (
    <section id="locations" className="py-16 lg:py-24 bg-gradient-to-b from-white to-[#FBF9F5] border-t border-gray-100 font-sans">
      <div className="max-w-screen-2xl mx-auto px-4 lg:px-8 xl:px-10">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#1E3B2B]/10 text-[#1E3B2B] text-xs font-black uppercase tracking-widest">
              <Navigation size={13} className="text-[#C39B54]" />
              <span>London Zones 1–3 Delivery</span>
            </div>
            <h2 className="text-3xl lg:text-4xl font-extrabold text-[#1E3B2B] tracking-tight">
              London Tiffin Delivery: West London Live
            </h2>
            <p className="text-gray-600 text-base leading-relaxed">
              We deliver fresh, authentic Indian tiffins in zero-waste stainless steel dabbas to homes,
              student flats, and offices across West London every Monday and Thursday.
            </p>
          </div>

          <div className="shrink-0 flex items-center gap-2 text-xs font-extrabold text-emerald-800 bg-emerald-50 px-4 py-2.5 rounded-2xl border border-emerald-200 shadow-2xs">
            <Clock size={16} className="text-emerald-700" />
            <span>Mondays &amp; Thursdays Delivery Routes</span>
          </div>
        </div>

        {/* Active Location Cards Grid - Centered Flex so 1 or 2 cards sit in the center, not left */}
        <div className="flex flex-wrap justify-center gap-8">
          {locations.map((loc) => (
            <Link
              key={loc.slug}
              href="/locations"
              className="w-full sm:w-[calc(50%_-_16px)] lg:w-[calc(33.333%_-_22px)] max-w-md group bg-white rounded-3xl border-2 border-[#1E3B2B]/15 hover:border-[#C39B54] hover:shadow-2xl transition-all duration-300 flex flex-col justify-between overflow-hidden relative"
            >
              <div>
                {/* Image Header with Badge */}
                <div className="relative w-full aspect-[16/10] bg-gray-100 overflow-hidden">
                  <Image
                    src={loc.heroImage}
                    alt={`${loc.name} Indian Tiffin Delivery`}
                    fill
                    quality={95}
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-cover object-center group-hover:scale-105 transition-transform duration-500 ease-out"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                  {/* Live Status Pill on Image */}
                  <div className="absolute top-4 left-4 bg-emerald-600 text-white text-xs font-black px-3 py-1 rounded-full shadow-md flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                    <span>Now Delivering</span>
                  </div>

                  {/* Sector Title over bottom gradient */}
                  <div className="absolute bottom-4 left-4 right-4 text-white">
                    <div className="text-xs font-bold uppercase tracking-wider text-[#C39B54]">
                      {loc.name} Dedicated Route
                    </div>
                    <div className="text-2xl font-extrabold leading-tight drop-shadow-sm">
                      {loc.name} Tiffins
                    </div>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-6 space-y-4">
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {loc.subheadline}
                  </p>

                  {/* Key Areas Served */}
                  <div className="pt-3 border-t border-gray-100 space-y-1.5">
                    <div className="text-[11px] uppercase font-black text-gray-400 tracking-wider">
                      Key Areas Served:
                    </div>
                    <div className="text-xs font-bold text-gray-800">
                      {loc.neighbourhoods.slice(0, 4).map((n) => n.name).join(' · ')}
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Action Footer */}
              <div className="px-6 pb-6 pt-3 border-t border-gray-100 flex items-center justify-between text-sm font-extrabold text-[#1E3B2B] group-hover:text-[#C39B54]">
                <span>Explore London Delivery Locations</span>
                <ArrowRight
                  size={16}
                  className="transition-transform group-hover:translate-x-1.5 text-[#C39B54]"
                />
              </div>
            </Link>
          ))}

          {/* All London Hub Card */}
          <Link
            href="/locations"
            className="w-full sm:w-[calc(50%_-_16px)] lg:w-[calc(33.333%_-_22px)] max-w-md group bg-gradient-to-br from-[#142A1E] to-[#1E3B2B] text-white rounded-3xl p-8 border-2 border-[#C39B54]/40 hover:border-[#C39B54] hover:shadow-2xl transition-all duration-300 flex flex-col justify-between space-y-4"
          >
            <div className="space-y-3">
              <span className="inline-block text-xs font-bold uppercase tracking-wider text-[#C39B54] bg-white/10 px-3 py-1 rounded-full border border-white/15">
                All London Zones 1–3
              </span>
              <h3 className="text-2xl font-extrabold text-white">
                View All Delivery Corridors
              </h3>
              <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">
                Discover full postcode lists, delivery schedules, and zero-waste stainless steel tiffins across all 5 London sectors.
              </p>
            </div>
            <div className="pt-2 text-xs font-bold text-[#C39B54] flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 size={15} className="text-emerald-400" />
                <span>Twice-Weekly Delivery Schedule</span>
              </div>
              <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
            </div>
          </Link>
        </div>
      </div>
    </section>
  );
}
