'use client';

import React from 'react';
import { Sparkles } from 'lucide-react';

interface LocationPromoBarProps {
  locationName: string;
  customItems?: string[];
}

export default function LocationPromoBar({ locationName, customItems }: LocationPromoBarProps) {
  const defaultItems = [
    `🌿 PURE PLANT-POWERED & VEGETARIAN HOMESTYLE FOOD`,
    `✦ DELIVERED COLD-PACKED TO ${locationName.toUpperCase()} EVERY MONDAY & THURSDAY`,
    `♻️ REUSABLE STAINLESS STEEL DABBAS · ZERO SINGLE-USE PLASTIC`,
    `✦ 21+ YEARS AUTHENTIC CULINARY HERITAGE · COUNCIL 5-STAR HYGIENE`,
    `✦ FREE EMPTY DABBA SWAP ON EVERY DELIVERY`,
  ];

  const activeItems =
    customItems && customItems.length > 0
      ? customItems.filter((i) => i.trim().length > 0)
      : defaultItems;

  const items = activeItems.length > 0 ? [...activeItems, ...activeItems] : defaultItems;

  return (
    <aside
      aria-label="Promotional announcements"
      className="bg-[#09150E] text-[#E8C482] py-2.5 overflow-hidden border-b border-[#C39B54]/25 select-none relative z-30"
    >
      <div className="flex animate-marquee-slow whitespace-nowrap text-[11px] sm:text-xs font-black tracking-widest uppercase">
        {items.map((item, idx) => (
          <span key={idx} className="mx-6 flex items-center gap-2">
            <span>{item}</span>
          </span>
        ))}
      </div>
    </aside>
  );
}
