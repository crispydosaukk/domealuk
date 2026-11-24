'use client';

import React from 'react';
import { LocationData } from '@/lib/locations-data';
import { MapPin, CheckCircle2, Building2, Calendar, Navigation, ShieldCheck } from 'lucide-react';
import Link from 'next/link';

interface LocationAreasProps {
  location: LocationData;
}

export default function LocationAreas({ location }: LocationAreasProps) {
  return (
    <section className="py-16 lg:py-24 bg-white border-y border-gray-200">
      <div className="max-w-screen-2xl mx-auto px-4 lg:px-8 xl:px-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#1E3B2B]/10 text-[#1E3B2B] text-xs font-black uppercase tracking-widest">
            <Navigation size={13} className="text-[#C39B54]" />
            <span>Verified London Route Coverage</span>
          </div>
          <h2 className="text-3xl lg:text-4xl font-extrabold text-[#1E3B2B] tracking-tight">
            {location.name} Delivery Areas &amp; Postcodes
          </h2>
          <p className="text-gray-600 text-base leading-relaxed">
            We deliver fresh, home-cooked Indian tiffins in reusable stainless steel dabbas across all
            active {location.name} postcodes. Every address is served on our scheduled twice-weekly
            routes.
          </p>
        </div>

        {/* Postcodes Container */}
        <div className="bg-[#FBF9F5] p-6 sm:p-8 rounded-3xl border border-gray-200 shadow-sm mb-12 max-w-4xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 border-b border-gray-200 pb-3 gap-2">
            <div>
              <span className="text-xs font-extrabold text-[#1E3B2B] uppercase tracking-wider block">
                Active Outward Postcodes Served in {location.name}
              </span>
              <span className="text-[11px] text-gray-500">
                Validated against DoMeal live delivery routes
              </span>
            </div>
            <span className="self-start sm:self-auto text-xs font-bold text-emerald-800 bg-emerald-100/80 px-3 py-1 rounded-full border border-emerald-300 flex items-center gap-1.5">
              <CheckCircle2 size={13} className="text-emerald-700" />
              <span>Full Route Active</span>
            </span>
          </div>

          <div className="flex flex-wrap gap-2.5 pt-1">
            {location.supportedPostcodes.map((code) => (
              <span
                key={code}
                className="px-3.5 py-1.5 bg-white text-gray-900 font-mono text-xs font-bold rounded-xl border border-gray-200 shadow-2xs hover:border-[#C39B54] hover:text-[#1E3B2B] hover:shadow-xs transition-all"
              >
                {code}
              </span>
            ))}
          </div>

          <div className="mt-4 pt-3 border-t border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between text-xs text-gray-500 gap-2">
            <span className="italic">
              * Includes residential flats, student accommodation, houses, and office suites.
            </span>
            <a
              href="#postcode-checker"
              className="text-[#C39B54] hover:text-yellow-700 font-bold inline-flex items-center gap-1 self-start sm:self-auto"
            >
              <span>Check specific street postcode</span> &rarr;
            </a>
          </div>
        </div>

        {/* Verified Neighbourhood Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {location.neighbourhoods.map((area, idx) => (
            <div
              key={idx}
              className="bg-white p-6 sm:p-7 rounded-3xl border border-gray-200 hover:border-[#C39B54] hover:shadow-xl transition-all duration-300 flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-[#1E3B2B]/5 text-[#1E3B2B] flex items-center justify-center group-hover:bg-[#1E3B2B] group-hover:text-white transition-colors duration-200">
                      <Building2 size={18} />
                    </div>
                    <h3 className="font-extrabold text-gray-900 text-base">{area.name}</h3>
                  </div>
                </div>

                <div className="inline-block px-2.5 py-1 bg-amber-50 text-amber-900 font-mono text-xs font-bold rounded-lg mb-3 border border-amber-200">
                  Postcodes: {area.postcode}
                </div>

                <p className="text-sm text-gray-600 leading-relaxed">{area.description}</p>
              </div>

              <div className="pt-4 mt-5 border-t border-gray-100 flex items-center justify-between text-xs font-bold">
                <span className="flex items-center gap-1.5 text-emerald-700">
                  <CheckCircle2 size={14} className="text-emerald-600" /> Mon &amp; Thu Deliveries
                </span>
                <span className="text-gray-400 font-medium">3 Delivery Windows</span>
              </div>
            </div>
          ))}
        </div>

        {/* Local Logistics & Concierge Support Strip */}
        <div className="mt-14 bg-gradient-to-r from-[#12271C] via-[#1E3B2B] to-[#12271C] text-white p-7 sm:p-9 rounded-3xl shadow-xl flex flex-col md:flex-row items-center justify-between gap-6 border border-white/10">
          <div className="space-y-2 text-center md:text-left">
            <h4 className="text-lg sm:text-xl font-extrabold text-white flex items-center justify-center md:justify-start gap-2">
              <Calendar size={20} className="text-[#C39B54]" />
              <span>Gated Communities &amp; Concierge Desks in {location.name}</span>
            </h4>
            <p className="text-xs sm:text-sm text-gray-300 max-w-2xl leading-relaxed">
              Our drivers regularly deliver to concierge desks, reception staff, and safe-place drop-offs
              across {location.name}. Simply add gate codes or flat instructions at checkout and we’ll handle the rest.
            </p>
          </div>

          <Link
            href="/menu"
            className="bg-[#C39B54] hover:bg-yellow-600 text-white font-extrabold text-sm px-6 py-3.5 rounded-xl transition-all duration-150 active:scale-95 shadow-lg shadow-black/40 shrink-0 flex items-center gap-2 cursor-pointer"
          >
            <ShieldCheck size={16} />
            <span>Schedule Delivery</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
