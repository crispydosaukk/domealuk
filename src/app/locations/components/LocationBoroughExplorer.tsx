'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { LocationData } from '@/lib/locations-data';
import { getZoneFromPostcode } from '@/app/components/PostcodeSearch';
import {
  MapPin,
  CheckCircle2,
  Building2,
  Navigation,
  ArrowRight,
  XCircle,
  Truck,
  RotateCcw,
  Clock,
  Bike,
  ShieldCheck,
  Layers,
} from 'lucide-react';

interface LocationBoroughExplorerProps {
  location: LocationData;
}

// Clear London Zones 1 to 3 definitions customizable per location region
interface DeliveryZoneDef {
  id: string;
  number: number;
  name: string;
  shortLabel: string;
  subtitle: string;
  badgeColor: string;
  postcodes: string[];
  keyAreas: string[];
  deliverySlot: string;
  notes: string;
}

function getZonesForLocation(location: LocationData): DeliveryZoneDef[] {
  const code = location.regionCode;

  if (code === 'E') {
    return [
      {
        id: 'zone-1',
        number: 1,
        name: 'Zone 1 · Central & City Fringe',
        shortLabel: 'Zone 1',
        subtitle: 'City Fringe & Historic East',
        badgeColor: 'bg-emerald-700 text-white',
        postcodes: ['E1'],
        keyAreas: ['Whitechapel', 'Aldgate', 'Spitalfields', 'Brick Lane'],
        deliverySlot: 'Mon & Thu (Lunch & Dinner)',
        notes: 'Prompt doorstep deliveries to residences, corporate offices, and tech studios.',
      },
      {
        id: 'zone-2',
        number: 2,
        name: 'Zone 2 · Inner London East',
        shortLabel: 'Zone 2',
        subtitle: 'Canary Wharf, Docklands & Creative East',
        badgeColor: 'bg-[#C39B54] text-white',
        postcodes: ['E2', 'E3', 'E8', 'E9', 'E14'],
        keyAreas: ['Canary Wharf', 'Isle of Dogs', 'Shoreditch', 'Hackney', 'Bow', 'Mile End'],
        deliverySlot: 'Mon & Thu (Lunch & Dinner)',
        notes: 'Doorstep deliveries to residential towers, concierge desks, and loft apartments.',
      },
      {
        id: 'zone-3',
        number: 3,
        name: 'Zone 3 · Greater East London',
        shortLabel: 'Zone 3',
        subtitle: 'Stratford, Olympic Park & East Corridors',
        badgeColor: 'bg-[#142A1E] text-white',
        postcodes: ['E5', 'E15', 'E16', 'E20', 'IG', 'RM'],
        keyAreas: ['Stratford', 'East Village', 'UCL East', 'Canning Town', 'Ilford', 'Romford'],
        deliverySlot: 'Mon & Thu (Lunch & Dinner)',
        notes: 'Full coverage of student accommodations, residential parks, and Greater East family homes.',
      },
    ];
  }

  if (code === 'N') {
    return [
      {
        id: 'zone-1',
        number: 1,
        name: 'Zone 1 · Angel & Kings Cross Edge',
        shortLabel: 'Zone 1',
        subtitle: 'Central Islington & Kings Cross Fringe',
        badgeColor: 'bg-emerald-700 text-white',
        postcodes: ['N1'],
        keyAreas: ['Islington', 'Angel', 'Kings Cross Border', 'Old Street Border'],
        deliverySlot: 'Mon & Thu (Lunch & Dinner)',
        notes: 'Direct delivery to apartments, tech hubs, and residential mews.',
      },
      {
        id: 'zone-2',
        number: 2,
        name: 'Zone 2 · Inner North London',
        shortLabel: 'Zone 2',
        subtitle: 'Camden, Highbury & Leafy Avenues',
        badgeColor: 'bg-[#C39B54] text-white',
        postcodes: ['N4', 'N5', 'N7', 'NW1', 'NW5'],
        keyAreas: ['Camden Town', 'Highbury', 'Holloway', 'Finsbury Park', 'Kentish Town'],
        deliverySlot: 'Mon & Thu (Lunch & Dinner)',
        notes: 'Popular shared flats, creative studios, and family homes with free dabba exchange.',
      },
      {
        id: 'zone-3',
        number: 3,
        name: 'Zone 3 · Suburban North London',
        shortLabel: 'Zone 3',
        subtitle: 'Finchley, Muswell Hill & Heights',
        badgeColor: 'bg-[#142A1E] text-white',
        postcodes: ['N2', 'N3', 'N6', 'N8', 'N10', 'N12', 'N19', 'N22'],
        keyAreas: ['Finchley', 'Muswell Hill', 'Highgate', 'Crouch End', 'East Finchley'],
        deliverySlot: 'Mon & Thu (Lunch & Dinner)',
        notes: 'Quiet residential family avenues and commuter homes enjoying twice-weekly meals.',
      },
    ];
  }

  if (code === 'SW/SE') {
    return [
      {
        id: 'zone-1',
        number: 1,
        name: 'Zone 1 · South Bank & London Bridge',
        shortLabel: 'Zone 1',
        subtitle: 'Central Riverside & Southwark Core',
        badgeColor: 'bg-emerald-700 text-white',
        postcodes: ['SE1', 'SW1'],
        keyAreas: ['London Bridge', 'Southwark', 'Waterloo', 'Borough', 'Westminster Edge'],
        deliverySlot: 'Mon & Thu (Lunch & Dinner)',
        notes: 'Delivered directly to concierge desks, residential towers, and riverside apartments.',
      },
      {
        id: 'zone-2',
        number: 2,
        name: 'Zone 2 · Inner South London',
        shortLabel: 'Zone 2',
        subtitle: 'Clapham, Battersea & Greenwich',
        badgeColor: 'bg-[#C39B54] text-white',
        postcodes: ['SW4', 'SW8', 'SW9', 'SW11', 'SE5', 'SE10', 'SE16'],
        keyAreas: ['Clapham', 'Battersea', 'Greenwich', 'Bermondsey', 'Brixton', 'Vauxhall'],
        deliverySlot: 'Mon & Thu (Lunch & Dinner)',
        notes: 'Fast-paced young professionals, riverside lofts, and busy families.',
      },
      {
        id: 'zone-3',
        number: 3,
        name: 'Zone 3 · South West & South East Parks',
        shortLabel: 'Zone 3',
        subtitle: 'Wimbledon, Wandsworth & Dulwich',
        badgeColor: 'bg-[#142A1E] text-white',
        postcodes: ['SW12', 'SW15', 'SW18', 'SW19', 'SE21', 'SE22'],
        keyAreas: ['Wimbledon', 'Wandsworth', 'Putney', 'Balham', 'Dulwich'],
        deliverySlot: 'Mon & Thu (Lunch & Dinner)',
        notes: 'Family Victorian terraces, residential parks, and leafy suburban communities.',
      },
    ];
  }

  if (code === 'WC/EC') {
    return [
      {
        id: 'zone-1',
        number: 1,
        name: 'Zone 1 · The City & Holborn',
        shortLabel: 'Zone 1',
        subtitle: 'The Square Mile & Legal Quarter',
        badgeColor: 'bg-emerald-700 text-white',
        postcodes: ['EC1', 'EC2', 'EC3', 'EC4', 'WC1', 'WC2'],
        keyAreas: ['Bank', 'Liverpool Street', 'Holborn', 'Chancery Lane', 'Farringdon'],
        deliverySlot: 'Mon & Thu (Lunch & Dinner)',
        notes: 'Punctual desk and reception drop-offs for corporate executives and law firms.',
      },
      {
        id: 'zone-2',
        number: 2,
        name: 'Zone 2 · West End & Westminster',
        shortLabel: 'Zone 2',
        subtitle: 'Soho, Mayfair & Government District',
        badgeColor: 'bg-[#C39B54] text-white',
        postcodes: ['W1', 'SW1A'],
        keyAreas: ['Soho', 'Mayfair', 'Fitzrovia', 'Westminster', 'Victoria', 'Covent Garden'],
        deliverySlot: 'Mon & Thu (Lunch & Dinner)',
        notes: 'Luxury apartments, creative media offices, and central residences.',
      },
      {
        id: 'zone-3',
        number: 3,
        name: 'Zone 3 · Surrounding Central Belt',
        shortLabel: 'Zone 3',
        subtitle: 'Connected Central London Districts',
        badgeColor: 'bg-[#142A1E] text-white',
        postcodes: ['EC1A', 'EC1M', 'WC1N', 'WC2H'],
        keyAreas: ['Clerkenwell', 'Bloomsbury', 'St Giles', 'Aldwych'],
        deliverySlot: 'Mon & Thu (Lunch & Dinner)',
        notes: 'Design agencies, university quarters, and luxury studios with zero-waste tiffins.',
      },
    ];
  }

  // Default: West London
  return [
    {
      id: 'zone-1',
      number: 1,
      name: 'Zone 1 · Central London Core',
      shortLabel: 'Zone 1',
      subtitle: 'Central London Core & Business District',
      badgeColor: 'bg-emerald-700 text-white',
      postcodes: ['W1'],
      keyAreas: ['Mayfair', 'Marylebone', 'Soho', 'Fitzrovia', 'Oxford Circus'],
      deliverySlot: 'Mon & Thu (Lunch & Dinner)',
      notes: 'Direct delivery to residential concierge suites, corporate offices, and central townhouses.',
    },
    {
      id: 'zone-2',
      number: 2,
      name: 'Zone 2 · Inner London West',
      shortLabel: 'Zone 2',
      subtitle: 'Inner London Residential & Heritage Avenues',
      badgeColor: 'bg-[#C39B54] text-white',
      postcodes: ['W2', 'W6', 'W8', 'W9', 'W10', 'W11', 'W14'],
      keyAreas: ['Kensington', 'Notting Hill', 'Bayswater', 'Paddington', 'Hammersmith', 'Maida Vale', 'West Kensington'],
      deliverySlot: 'Mon & Thu (Lunch & Dinner)',
      notes: 'Doorstep deliveries to historic mews, leafy avenues, and student residences with free container swap.',
    },
    {
      id: 'zone-3',
      number: 3,
      name: 'Zone 3 · Outer London West',
      shortLabel: 'Zone 3',
      subtitle: 'Outer London & Family Neighbourhoods',
      badgeColor: 'bg-[#142A1E] text-white',
      postcodes: ['W3', 'W4', 'W5', 'W7', 'W12', 'W13'],
      keyAreas: ['Ealing', 'Acton', 'Chiswick', 'Shepherd’s Bush', 'White City', 'Hanwell', 'West Ealing'],
      deliverySlot: 'Mon & Thu (Lunch & Dinner)',
      notes: 'Full coverage of family homes, BBC Media Village, and suburban tech hubs with chilled insulated bags.',
    },
  ];
}

// Map postcode to Zone Number (1, 2, or 3)
function getZoneNumberForPostcode(pc: string): number | null {
  const clean = pc.trim().toUpperCase().replace(/\s+/g, '');
  if (clean.startsWith('W1') && !clean.startsWith('W10') && !clean.startsWith('W11') && !clean.startsWith('W12') && !clean.startsWith('W13') && !clean.startsWith('W14')) {
    return 1;
  }
  const zone2 = ['W2', 'W6', 'W8', 'W9', 'W10', 'W11', 'W14'];
  const zone3 = ['W3', 'W4', 'W5', 'W7', 'W12', 'W13'];
  for (const z of zone2) {
    if (clean.startsWith(z)) return 2;
  }
  for (const z of zone3) {
    if (clean.startsWith(z)) return 3;
  }
  return null;
}

export default function LocationBoroughExplorer({ location }: LocationBoroughExplorerProps) {
  const zones = getZonesForLocation(location);
  const [selectedZone, setSelectedZone] = useState<'all' | 'zone-1' | 'zone-2' | 'zone-3'>('all');
  const [postcode, setPostcode] = useState<string>(location.samplePostcode || 'W2 1NY');
  const [checkResult, setCheckResult] = useState<{
    status: 'idle' | 'success' | 'unavailable' | 'unknown';
    areaName?: string;
    zoneNum?: number;
  }>({ status: 'idle' });

  React.useEffect(() => {
    setPostcode(location.samplePostcode || 'W2 1NY');
    setCheckResult({ status: 'idle' });
  }, [location.slug, location.samplePostcode]);

  const handleQuickCheck = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!postcode.trim()) return;

    const zoneInfo = getZoneFromPostcode(postcode);
    const zNum = getZoneNumberForPostcode(postcode);

    if (zNum) {
      setCheckResult({
        status: 'success',
        areaName: `${location.name} Zone ${zNum}`,
        zoneNum: zNum,
      });
      setSelectedZone(`zone-${zNum}` as 'zone-1' | 'zone-2' | 'zone-3');
    } else if (zoneInfo && zoneInfo.available) {
      setCheckResult({
        status: 'success',
        areaName: `${zoneInfo.area} (Zones 1–3 Route)`,
      });
    } else {
      setCheckResult({
        status: 'unavailable',
        areaName: zoneInfo ? zoneInfo.area : 'Outside regular route',
      });
    }
  };

  const activeZoneDef = zones.find((z) => z.id === selectedZone);

  return (
    <section id="neighbourhoods" className="py-20 lg:py-28 bg-[#FAF6F0] text-stone-900 border-b border-stone-200 relative overflow-hidden font-sans">
      {/* Background ambient lighting */}
      <div className="absolute top-0 right-10 w-96 h-96 bg-[#C39B54]/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-0 left-10 w-96 h-96 bg-[#142A1E]/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-screen-2xl mx-auto px-4 lg:px-8 xl:px-12 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#142A1E]/10 text-[#142A1E] text-xs font-black uppercase tracking-widest border border-[#142A1E]/15">
            <Navigation size={13} className="text-[#C39B54]" />
            <span>{location.neighbourhoodsBadge || 'Scheduled London Delivery Network'}</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#142A1E] tracking-tight leading-[1.15] font-sans lg:whitespace-nowrap">
            {location.neighbourhoodsTitle || 'We Deliver to All London Zones 1–3'}
          </h2>

          <p className="text-stone-700 text-base sm:text-lg leading-relaxed max-w-2xl mx-auto">
            {location.neighbourhoodsSubtitle ||
              `From ${location.name}'s historic mews to high-rise concierge suites across London Zones 1, 2, and 3, our chilled delivery fleet brings authentic home-cooked Indian tiffins directly to your doorstep twice weekly with zero single-use plastic.`}
          </p>
        </div>

        {/* 2-Column Showcase: Left = Zone Filter & Street Checker, Right = Crystal-Clear London Zones 1–3 Map */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center mb-16">
          {/* Left Column: 3 Zones Explorer & Street Checker */}
          <div className="lg:col-span-6 space-y-6">
            {/* Zone Selector Buttons */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase tracking-wider text-stone-600 block">
                  Select Delivery Zone to Inspect:
                </span>
                <span className="text-[11px] font-bold text-emerald-800 bg-emerald-100/80 px-2.5 py-0.5 rounded-full">
                  All 3 Zones Active
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedZone('all')}
                  className={`px-3 py-2.5 rounded-xl text-xs font-black transition-all duration-200 cursor-pointer flex items-center justify-center gap-1.5 ${
                    selectedZone === 'all'
                      ? 'bg-[#142A1E] text-white shadow-md shadow-[#142A1E]/20 scale-[1.02]'
                      : 'bg-white text-stone-700 border border-stone-200 hover:border-stone-400'
                  }`}
                >
                  <Layers size={13} className={selectedZone === 'all' ? 'text-[#C39B54]' : 'text-stone-400'} />
                  <span>All Zones 1–3</span>
                </button>

                {zones.map((zone) => {
                  const isActive = selectedZone === zone.id;
                  return (
                    <button
                      key={zone.id}
                      type="button"
                      onClick={() => {
                        setSelectedZone(zone.id as 'zone-1' | 'zone-2' | 'zone-3');
                        setPostcode(zone.postcodes[0] + ' 1AA');
                        setCheckResult({ status: 'idle' });
                      }}
                      className={`px-3 py-2.5 rounded-xl text-xs font-black transition-all duration-200 cursor-pointer flex items-center justify-center gap-1.5 ${
                        isActive
                          ? 'bg-[#142A1E] text-white shadow-md shadow-[#142A1E]/20 scale-[1.02]'
                          : 'bg-white text-stone-700 border border-stone-200 hover:border-stone-400'
                      }`}
                    >
                      <MapPin size={13} className={isActive ? 'text-[#C39B54]' : 'text-stone-400'} />
                      <span>{zone.shortLabel}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Active Zone Detail Card */}
            <div className="p-7 rounded-3xl bg-white border border-stone-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                <div className="flex items-center gap-2.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  <h3 className="text-lg font-extrabold text-stone-900 font-sans">
                    {activeZoneDef ? activeZoneDef.name : `${location.name} Zones 1, 2 & 3 Coverage`}
                  </h3>
                </div>
                <span className="text-xs font-mono font-bold text-[#8C6B28] bg-[#C39B54]/10 px-3 py-1 rounded-full border border-[#C39B54]/25">
                  {activeZoneDef ? `${activeZoneDef.postcodes.length} Outward Codes` : `${location.supportedPostcodes.length} Postcodes`}
                </span>
              </div>

              {/* Description */}
              <p className="text-xs sm:text-sm text-stone-600 leading-relaxed font-medium">
                {activeZoneDef
                  ? activeZoneDef.notes
                  : `DoMeal serves all residential mews, corporate offices, and apartment concierge suites throughout ${location.name} across Zones 1, 2, and 3.`}
              </p>

              {/* Postcodes Pill Tags Grouped by Zone */}
              <div className="space-y-2 pt-1">
                <span className="text-[11px] font-black uppercase tracking-wider text-stone-500 block">
                  {activeZoneDef ? `Supported ${activeZoneDef.shortLabel} Postcodes:` : 'Active Postcode Outward Codes:'}
                </span>

                {activeZoneDef ? (
                  <div className="flex flex-wrap gap-2">
                    {activeZoneDef.postcodes.map((code) => (
                      <span
                        key={code}
                        className="px-3 py-1 bg-stone-50 text-stone-900 font-mono text-xs font-bold rounded-xl border border-stone-200 shadow-2xs"
                      >
                        {code}
                      </span>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-2">
                    {zones.map((z) => (
                      <div key={z.id} className="flex items-center gap-2 flex-wrap">
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-stone-100 text-stone-800 border border-stone-200">
                          {z.shortLabel}:
                        </span>
                        {z.postcodes.map((code) => (
                          <span
                            key={code}
                            className="px-2.5 py-0.5 bg-stone-50 text-stone-900 font-mono text-xs font-bold rounded-lg border border-stone-200"
                          >
                            {code}
                          </span>
                        ))}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Key Neighbourhoods in this Zone */}
              {activeZoneDef && (
                <div className="pt-2 border-t border-stone-100">
                  <span className="text-[11px] font-black uppercase tracking-wider text-stone-500 block mb-1.5">
                    Key Areas in {activeZoneDef.shortLabel}:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {activeZoneDef.keyAreas.map((area) => (
                      <span
                        key={area}
                        className="px-2.5 py-1 rounded-lg bg-[#C39B54]/10 text-stone-800 text-xs font-semibold"
                      >
                        {area}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Integrated Street Postcode Verification Bar */}
              <div className="pt-2 border-t border-stone-100">
                <form onSubmit={handleQuickCheck} className="flex gap-2">
                  <div className="relative flex-1">
                    <MapPin size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
                    <input
                      type="text"
                      value={postcode || ''}
                      onChange={(e) => {
                        setPostcode(e.target.value);
                        if (checkResult.status !== 'idle') setCheckResult({ status: 'idle' });
                      }}
                      placeholder="e.g. W2 1NY, W8 4PL, W5 2TJ..."
                      className="w-full bg-stone-50 border border-stone-200 text-stone-900 text-xs font-bold rounded-xl pl-9 pr-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#142A1E]"
                    />
                  </div>
                  <button
                    type="submit"
                    className="bg-[#142A1E] hover:bg-[#1E3B2B] text-white text-xs font-black px-4 py-2.5 rounded-xl transition-all active:scale-95 cursor-pointer shrink-0"
                  >
                    Verify Street
                  </button>
                </form>

                {/* Inline Result */}
                {checkResult.status === 'success' && (
                  <div className="mt-3 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2 font-bold">
                    <CheckCircle2 size={15} className="text-emerald-600 shrink-0" />
                    <span>
                      ✓ Delivery Confirmed! {checkResult.areaName} is fully active on our Mon &amp; Thu schedule.
                    </span>
                  </div>
                )}
                {checkResult.status === 'unavailable' && (
                  <div className="mt-3 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2 font-semibold">
                    <XCircle size={15} className="text-rose-600 shrink-0" />
                    <span>Postcode is outside our London Zones 1–3 routes. Join waitlist for future expansions.</span>
                  </div>
                )}
              </div>
            </div>

            {/* 3 Core Delivery Guarantees */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3.5 rounded-2xl bg-white border border-stone-200/80 shadow-2xs space-y-1">
                <Truck size={16} className="text-[#C39B54]" />
                <div className="font-bold text-stone-900">Mon &amp; Thu Deliveries</div>
                <div className="text-[11px] text-stone-500">Chilled in insulated bags</div>
              </div>
              <div className="p-3.5 rounded-2xl bg-white border border-stone-200/80 shadow-2xs space-y-1">
                <Building2 size={16} className="text-[#C39B54]" />
                <div className="font-bold text-stone-900">Concierge Drop-Off</div>
                <div className="text-[11px] text-stone-500">Gate codes &amp; safe places</div>
              </div>
              <div className="p-3.5 rounded-2xl bg-white border border-stone-200/80 shadow-2xs space-y-1">
                <RotateCcw size={16} className="text-[#C39B54]" />
                <div className="font-bold text-stone-900">Free Dabba Swap</div>
                <div className="text-[11px] text-stone-500">Leave out on delivery day</div>
              </div>
            </div>

            {/* Primary & Secondary Action Buttons */}
            <div className="pt-2 flex flex-wrap gap-4 items-center">
              <Link
                href="/menu"
                className="inline-flex items-center gap-2.5 bg-[#142A1E] hover:bg-[#1E3B2B] text-white font-black text-sm px-8 py-4 rounded-2xl transition-all duration-150 active:scale-95 shadow-xl shadow-stone-900/10 cursor-pointer"
              >
                <span>Order in {location.name}</span>
                <ArrowRight size={16} className="text-[#C39B54]" />
              </Link>

              <a
                href="#menu"
                className="inline-flex items-center gap-2 bg-white hover:bg-stone-50 text-stone-800 font-bold text-sm px-6 py-4 rounded-2xl border-2 border-stone-200 transition-all duration-150 active:scale-95 shadow-sm cursor-pointer"
              >
                <Clock size={15} className="text-[#C39B54]" />
                <span>Delivery Days &amp; Times</span>
              </a>
            </div>
          </div>

          {/* Right Column: Crystal-Clear London Zones 1, 2 & 3 Interactive Vector Map */}
          <div className="lg:col-span-6 flex justify-center">
            <div className="relative w-full max-w-xl bg-white rounded-[2.5rem] p-6 sm:p-8 border-2 border-stone-200/80 shadow-2xl overflow-hidden">
              {/* Map Card Header */}
              <div className="flex items-center justify-between mb-4 border-b border-stone-100 pb-3">
                <div>
                  <span className="text-[11px] font-black uppercase tracking-wider text-[#C39B54] block">
                    London Delivery Network Map
                  </span>
                  <div className="text-xl font-extrabold text-stone-900 font-sans">
                    London Zones 1–3 Coverage
                  </div>
                </div>
                <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span>3 Zones Active</span>
                </span>
              </div>

              {/* Stylized London Zones SVG Graphic */}
              <div className="relative w-full aspect-[4/3] bg-gradient-to-br from-[#FCF9F2] to-[#F5EFE3] rounded-3xl p-3 border border-stone-200/80 overflow-hidden flex items-center justify-center">
                <svg
                  viewBox="0 0 500 370"
                  className="w-full h-full drop-shadow-sm select-none"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  {/* Subtle Grid Coordinates */}
                  <g opacity="0.12" stroke="#142A1E" strokeWidth="0.5">
                    <line x1="50" y1="0" x2="50" y2="370" />
                    <line x1="150" y1="0" x2="150" y2="370" />
                    <line x1="250" y1="0" x2="250" y2="370" />
                    <line x1="350" y1="0" x2="350" y2="370" />
                    <line x1="450" y1="0" x2="450" y2="370" />
                    <line x1="0" y1="70" x2="500" y2="70" />
                    <line x1="0" y1="170" x2="500" y2="170" />
                    <line x1="0" y1="270" x2="500" y2="270" />
                  </g>

                  {/* River Thames Ribbon */}
                  <path
                    d="M 10 215 C 80 235, 130 195, 200 205 C 260 215, 305 168, 360 178 C 420 192, 460 180, 495 185"
                    stroke="#D5E2EC"
                    strokeWidth="18"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M 10 215 C 80 235, 130 195, 200 205 C 260 215, 305 168, 360 178 C 420 192, 460 180, 495 185"
                    stroke="#BED3E3"
                    strokeWidth="4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <text x="390" y="168" className="text-[9px] font-bold fill-[#8BA5BA] italic tracking-wider">
                    River Thames
                  </text>

                  {/* ==================================================== */}
                  {/* ZONE 3: OUTER LONDON RING                            */}
                  {/* ==================================================== */}
                  <ellipse
                    cx="250"
                    cy="185"
                    rx="225"
                    ry="150"
                    fill={selectedZone === 'zone-3' ? '#EFE7D8' : '#F6F1E7'}
                    stroke={selectedZone === 'zone-3' ? '#142A1E' : '#DCD3C3'}
                    strokeWidth={selectedZone === 'zone-3' ? '3' : '2'}
                    className="transition-all duration-300"
                  />

                  {/* ==================================================== */}
                  {/* ZONE 2: INNER LONDON RING                            */}
                  {/* ==================================================== */}
                  <ellipse
                    cx="250"
                    cy="185"
                    rx="155"
                    ry="105"
                    fill={selectedZone === 'zone-2' ? '#E7DCB5' : '#ECE2CE'}
                    stroke={selectedZone === 'zone-2' ? '#C39B54' : '#C7B9A0'}
                    strokeWidth={selectedZone === 'zone-2' ? '3' : '2'}
                    className="transition-all duration-300"
                  />

                  {/* ==================================================== */}
                  {/* ZONE 1: CENTRAL LONDON CORE                          */}
                  {/* ==================================================== */}
                  <ellipse
                    cx="250"
                    cy="185"
                    rx="75"
                    ry="52"
                    fill={selectedZone === 'zone-1' ? '#142A1E' : '#DED0B8'}
                    stroke={selectedZone === 'zone-1' ? '#C39B54' : '#9E8D72'}
                    strokeWidth={selectedZone === 'zone-1' ? '3.5' : '2.5'}
                    className="transition-all duration-300"
                  />

                  {/* ==================================================== */}
                  {/* DYNAMIC REGIONAL ACTIVE CORRIDOR HIGHLIGHT            */}
                  {/* ==================================================== */}
                  <g className="transition-all duration-300">
                    {location.regionCode === 'E' ? (
                      <path
                        d="M 450 140 C 370 130, 320 150, 260 175 C 260 195, 320 220, 370 240 C 435 220, 460 180, 450 140 Z"
                        fill="#142A1E"
                        fillOpacity={selectedZone === 'all' ? '0.92' : '0.85'}
                        stroke="#C39B54"
                        strokeWidth="3"
                      />
                    ) : location.regionCode === 'N' ? (
                      <path
                        d="M 170 50 C 160 120, 190 155, 250 160 C 310 155, 340 120, 330 50 C 270 40, 230 40, 170 50 Z"
                        fill="#142A1E"
                        fillOpacity={selectedZone === 'all' ? '0.92' : '0.85'}
                        stroke="#C39B54"
                        strokeWidth="3"
                      />
                    ) : location.regionCode === 'SW/SE' ? (
                      <path
                        d="M 170 320 C 160 250, 190 215, 250 210 C 310 215, 340 250, 330 320 C 270 330, 230 330, 170 320 Z"
                        fill="#142A1E"
                        fillOpacity={selectedZone === 'all' ? '0.92' : '0.85'}
                        stroke="#C39B54"
                        strokeWidth="3"
                      />
                    ) : location.regionCode === 'WC/EC' ? (
                      <ellipse
                        cx="250"
                        cy="185"
                        rx="75"
                        ry="52"
                        fill="#142A1E"
                        fillOpacity={selectedZone === 'all' ? '0.95' : '0.85'}
                        stroke="#C39B54"
                        strokeWidth="3.5"
                      />
                    ) : (
                      <path
                        d="M 50 140 C 130 130, 180 150, 240 175 C 240 195, 180 220, 130 240 C 65 220, 40 180, 50 140 Z"
                        fill="#142A1E"
                        fillOpacity={selectedZone === 'all' ? '0.92' : '0.85'}
                        stroke="#C39B54"
                        strokeWidth="3"
                      />
                    )}
                  </g>

                  {/* Corridor Badge on Map */}
                  <g
                    transform={
                      location.regionCode === 'E'
                        ? 'translate(330, 175)'
                        : location.regionCode === 'N'
                        ? 'translate(195, 65)'
                        : location.regionCode === 'SW/SE'
                        ? 'translate(195, 280)'
                        : location.regionCode === 'WC/EC'
                        ? 'translate(195, 172)'
                        : 'translate(60, 175)'
                    }
                  >
                    <rect x="0" y="0" width="115" height="28" rx="8" fill="#142A1E" stroke="#C39B54" strokeWidth="1.5" />
                    <text x="57" y="14" textAnchor="middle" className="text-[10px] font-black fill-white uppercase tracking-wider">
                      {location.name.toUpperCase()}
                    </text>
                    <text x="57" y="24" textAnchor="middle" className="text-[8px] font-bold fill-[#C39B54] uppercase tracking-wider">
                      ZONES 1, 2 &amp; 3
                    </text>
                  </g>

                  {/* ZONE LABELS & BADGES (CRISP, UNMISTAKABLE) */}
                  {/* Zone 1 Label in Core */}
                  <g transform="translate(210, 172)">
                    <rect
                      x="0"
                      y="0"
                      width="80"
                      height="24"
                      rx="6"
                      fill={selectedZone === 'zone-1' ? '#C39B54' : '#142A1E'}
                      stroke="#FFFFFF"
                      strokeWidth="1.5"
                    />
                    <text
                      x="40"
                      y="16"
                      textAnchor="middle"
                      className="text-[11px] font-black uppercase tracking-wider fill-white"
                    >
                      ★ ZONE 1
                    </text>
                  </g>

                  {/* Zone 2 Label Pill */}
                  <g transform="translate(210, 102)">
                    <rect
                      x="0"
                      y="0"
                      width="80"
                      height="22"
                      rx="6"
                      fill={selectedZone === 'zone-2' ? '#142A1E' : '#C39B54'}
                      stroke="#FFFFFF"
                      strokeWidth="1.5"
                    />
                    <text
                      x="40"
                      y="15"
                      textAnchor="middle"
                      className="text-[10px] font-black uppercase tracking-wider fill-white"
                    >
                      ZONE 2
                    </text>
                  </g>

                  {/* Zone 3 Label Pill */}
                  <g transform="translate(210, 50)">
                    <rect
                      x="0"
                      y="0"
                      width="80"
                      height="22"
                      rx="6"
                      fill={selectedZone === 'zone-3' ? '#142A1E' : '#8C7456'}
                      stroke="#FFFFFF"
                      strokeWidth="1.5"
                    />
                    <text
                      x="40"
                      y="15"
                      textAnchor="middle"
                      className="text-[10px] font-black uppercase tracking-wider fill-white"
                    >
                      ZONE 3
                    </text>
                  </g>

                  {/* Landmark Pins with Postcode Indicators */}
                  {/* Zone 3: Ealing & Acton */}
                  <circle cx="85" cy="155" r="4" fill="#C39B54" stroke="#FFFFFF" strokeWidth="1.5" />
                  <text x="85" y="146" textAnchor="middle" className="text-[9px] font-extrabold fill-stone-100">
                    Ealing (W5) • Z3
                  </text>

                  {/* Zone 2: Kensington & Notting Hill */}
                  <circle cx="160" cy="180" r="4.5" fill="#C39B54" stroke="#FFFFFF" strokeWidth="1.5" />
                  <text x="160" y="172" textAnchor="middle" className="text-[9px] font-extrabold fill-stone-100">
                    Kensington (W8) • Z2
                  </text>

                  {/* Zone 2: Chiswick & Hammersmith */}
                  <circle cx="120" cy="215" r="4" fill="#C39B54" stroke="#FFFFFF" strokeWidth="1.5" />
                  <text x="120" y="228" textAnchor="middle" className="text-[9px] font-extrabold fill-stone-100">
                    Chiswick (W4) • Z3
                  </text>

                  {/* Zone 1: Mayfair & West End */}
                  <circle cx="230" cy="185" r="4.5" fill="#FFFFFF" stroke="#C39B54" strokeWidth="2" />
                  <text x="210" y="210" textAnchor="middle" className="text-[9px] font-extrabold fill-stone-900">
                    Mayfair (W1) • Z1
                  </text>

                  {/* East/North/South Ambient Direction Indicators */}
                  <text x="390" y="115" textAnchor="middle" className="text-[10px] font-bold fill-stone-400 uppercase tracking-widest">
                    North (Zone 2/3)
                  </text>
                  <text x="430" y="200" textAnchor="middle" className="text-[10px] font-bold fill-stone-400 uppercase tracking-widest">
                    East (Zone 1-3)
                  </text>
                  <text x="250" y="325" textAnchor="middle" className="text-[10px] font-bold fill-stone-400 uppercase tracking-widest">
                    South (Zone 1-3)
                  </text>
                </svg>

                {/* Overlaid Active Pin Badge */}
                <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-md px-3.5 py-1.5 rounded-2xl shadow-md border border-stone-200/80 flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-xs font-bold text-stone-900 font-sans">
                    Zones 1, 2 &amp; 3 Verified Route
                  </span>
                </div>

                {/* Overlaid Courier Transit Badge */}
                <div className="absolute bottom-4 right-4 bg-[#142A1E]/95 backdrop-blur-md px-3.5 py-1.5 rounded-2xl shadow-lg border border-[#C39B54]/40 flex items-center gap-2 text-white">
                  <Bike size={14} className="text-[#C39B54]" />
                  <span className="text-[11px] font-black uppercase tracking-wider">
                    Zero-Plastic Courier Route
                  </span>
                </div>
              </div>

              {/* 3 Dedicated Zone Status Cards Beneath the Map */}
              <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                {zones.map((zone) => {
                  const isSelected = selectedZone === zone.id;
                  return (
                    <button
                      key={zone.id}
                      type="button"
                      onClick={() => {
                        setSelectedZone(zone.id as 'zone-1' | 'zone-2' | 'zone-3');
                        setPostcode(zone.postcodes[0] + ' 1AA');
                      }}
                      className={`p-3 rounded-2xl border transition-all text-left cursor-pointer ${
                        isSelected
                          ? 'border-[#142A1E] bg-[#142A1E]/5 shadow-sm'
                          : 'border-stone-200/80 bg-stone-50/70 hover:bg-stone-100/60'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-black text-[#142A1E] uppercase tracking-wide">
                          {zone.shortLabel}
                        </span>
                        <span className="w-2 h-2 rounded-full bg-emerald-500" />
                      </div>
                      <div className="text-[11px] font-bold text-stone-700 truncate">
                        {zone.number === 1 ? 'Central Core' : zone.number === 2 ? 'Inner Ring' : 'Outer Ring'}
                      </div>
                      <div className="text-[10px] font-mono text-stone-500 mt-0.5 truncate">
                        {zone.postcodes.slice(0, 3).join(', ')}
                        {zone.postcodes.length > 3 ? '...' : ''}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Map Footer Information */}
              <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between text-xs text-stone-500">
                <span className="flex items-center gap-1.5 text-stone-700 font-medium">
                  <CheckCircle2 size={13} className="text-emerald-600" /> All 3 Zones Included in Standard Delivery
                </span>
                <span className="font-bold text-[#8C6B28]">No Zone 4 Surcharges</span>
              </div>
            </div>
          </div>
        </div>

        {/* Verified Neighbourhood Cards Grid Categorized by Zone */}
        <div className="space-y-6">
          <div className="border-b border-stone-200 pb-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-xl sm:text-2xl font-extrabold text-stone-900 font-sans">
                Key {location.name} Neighbourhoods by Zone
              </h3>
              <p className="text-xs text-stone-500 mt-0.5">
                Every neighbourhood across Zones 1, 2, and 3 receives twice-weekly cold-packed tiffin delivery.
              </p>
            </div>
            <span className="text-xs font-bold text-[#8C6B28] bg-[#C39B54]/10 px-3 py-1 rounded-full border border-[#C39B54]/20">
              Zones 1–3 Guaranteed
            </span>
          </div>

          <div className="flex flex-wrap justify-center gap-6">
            {location.neighbourhoods.map((area, idx) => {
              // Determine which zone this neighbourhood belongs to
              const p = area.postcode.toUpperCase();
              const zoneNum =
                p.includes('W1') || p.includes('WC') || p.includes('EC') || p.includes('SW1') || p.includes('E1,') || p.endsWith('E1') || p.includes('E1 ') || p.includes('N1,') || p.endsWith('N1') || p.includes('SE1')
                  ? 1
                  : p.includes('W2') || p.includes('W6') || p.includes('W8') || p.includes('W9') || p.includes('W11') || p.includes('W14') ||
                    p.includes('E2') || p.includes('E8') || p.includes('E9') || p.includes('E14') ||
                    p.includes('N5') || p.includes('N7') || p.includes('NW1') || p.includes('NW5') ||
                    p.includes('SW4') || p.includes('SW8') || p.includes('SW11') || p.includes('SE10') || p.includes('SE16')
                  ? 2
                  : 3;

              return (
                <div
                  key={idx}
                  className="w-full sm:w-[calc(50%_-_12px)] lg:w-[calc(33.333%_-_16px)] max-w-md bg-white p-7 rounded-3xl border border-stone-200 hover:border-[#C39B54] hover:shadow-xl transition-all duration-300 flex flex-col justify-between group"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-[#142A1E]/5 text-[#142A1E] flex items-center justify-center group-hover:bg-[#142A1E] group-hover:text-white transition-colors duration-300">
                          <Building2 size={18} />
                        </div>
                        <h4 className="font-extrabold text-stone-900 text-lg font-sans">{area.name}</h4>
                      </div>
                      <span
                        className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-full border ${
                          zoneNum === 1
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                            : zoneNum === 2
                            ? 'bg-amber-50 text-amber-800 border-amber-200'
                            : 'bg-stone-100 text-stone-800 border-stone-200'
                        }`}
                      >
                        Zone {zoneNum}
                      </span>
                    </div>

                    <div className="inline-block px-3 py-1 bg-amber-50 text-amber-900 font-mono text-xs font-bold rounded-lg mb-3 border border-amber-200">
                      Postcodes: {area.postcode}
                    </div>

                    <p className="text-sm text-stone-600 leading-relaxed font-normal">{area.description}</p>
                  </div>

                  <div className="pt-4 mt-5 border-t border-stone-100 flex items-center justify-between text-xs font-bold">
                    <span className="flex items-center gap-1.5 text-emerald-700">
                      <CheckCircle2 size={14} className="text-emerald-600" /> Mon &amp; Thu Deliveries
                    </span>
                    <span className="text-stone-400 font-medium">Insulated Dabbas</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
