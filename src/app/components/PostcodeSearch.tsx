'use client';
import React, { useState } from 'react';
import { MapPin, CheckCircle, XCircle, Search } from 'lucide-react';

const deliveryZones: Record<string, { area: string; available: boolean }> = {
  E: { area: 'East London', available: true },
  N: { area: 'North London', available: true },
  SE: { area: 'South East London', available: true },
  SW: { area: 'South West London', available: true },
  W: { area: 'West London', available: true },
  WC: { area: 'Central London', available: true },
  EC: { area: 'City of London', available: true },
  IG: { area: 'Ilford', available: true },
  RM: { area: 'Romford', available: true },
  EN: { area: 'Enfield', available: false },
  DA: { area: 'Dartford', available: false },
};

function getZoneFromPostcode(postcode: string): { area: string; available: boolean } | null {
  const clean = postcode.trim().toUpperCase().replace(/\s+/g, '');
  const twoChar = clean.slice(0, 2).replace(/[0-9]/g, '');
  const oneChar = clean.slice(0, 1);
  if (deliveryZones[twoChar]) return deliveryZones[twoChar];
  if (deliveryZones[oneChar]) return deliveryZones[oneChar];
  return null;
}

export default function PostcodeSearch() {
  const [postcode, setPostcode] = useState('');
  const [result, setResult] = useState<{ area: string; available: boolean } | null | 'unknown'>(null);

  const handleCheck = () => {
    if (!postcode.trim()) return;
    const zone = getZoneFromPostcode(postcode);
    setResult(zone ?? 'unknown');
  };

  return (
    <section className="py-10" style={{ background: 'linear-gradient(135deg, #1A2B5E 0%, #0F1A3E 50%, #1A2B5E 100%)' }}>
      <div className="max-w-screen-2xl mx-auto px-4 lg:px-8 xl:px-10">
        <div className="flex flex-col lg:flex-row items-center gap-6 lg:gap-10">
          <div className="text-white text-center lg:text-left">
            <div className="flex items-center gap-2 justify-center lg:justify-start mb-1">
              <MapPin size={18} className="text-[#CC1B1B]" />
              <span className="text-sm font-700 uppercase tracking-widest text-[#CC1B1B]">Delivery Checker</span>
            </div>
            <h3 className="text-xl font-extrabold">Do we deliver to you?</h3>
            <p className="text-blue-200 text-sm mt-1">Enter your London postcode to find out</p>
          </div>

          <div className="flex-1 w-full max-w-md">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <MapPin size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-300" />
                <input
                  value={postcode}
                  onChange={e => setPostcode(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleCheck()}
                  placeholder="e.g. E1 6RF, N1 9GU..."
                  className="w-full pl-9 pr-4 py-3 rounded-xl border border-white/20 bg-white/10 text-white placeholder-blue-300 focus:outline-none focus:ring-2 focus:ring-[#CC1B1B] focus:bg-white/20 text-sm"
                />
              </div>
              <button
                onClick={handleCheck}
                className="flex items-center gap-2 bg-[#CC1B1B] text-white font-700 px-5 py-3 rounded-xl hover:bg-red-700 transition-all active:scale-95 text-sm whitespace-nowrap"
              >
                <Search size={16} />
                Check
              </button>
            </div>

            {result && result !== 'unknown' && (
              <div className={`mt-3 flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-600 ${result.available ? 'bg-green-500/20 text-green-200' : 'bg-red-500/20 text-red-200'}`}>
                {result.available ? <CheckCircle size={16} /> : <XCircle size={16} />}
                {result.available
                  ? `✓ Great news! We deliver to ${result.area}.`
                  : `Sorry, we don't currently deliver to ${result.area}.`}
              </div>
            )}
            {result === 'unknown' && (
              <div className="mt-3 flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-600 bg-yellow-500/20 text-yellow-200">
                <MapPin size={16} />
                Postcode not recognised. Please contact us to check availability.
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
