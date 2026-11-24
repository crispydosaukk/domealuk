'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { LocationData } from '@/lib/locations-data';
import { Sparkles, ArrowRight, Utensils, CheckCircle2, Flame, Calendar, Leaf } from 'lucide-react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface LocationSignatureDishesProps {
  location: LocationData;
}

interface RealMenuItem {
  id: string;
  name: string;
  category: string;
  price: number;
  originalPrice?: number | null;
  desc: string;
  spice: number;
  images?: string[];
  tag?: string | null;
}

// Fallback real items matching Firestore data
const DEFAULT_REAL_ITEMS: RealMenuItem[] = [
  {
    id: 'heritage-harvest',
    name: 'Heritage Harvest',
    category: 'Menu',
    price: 14.99,
    originalPrice: 19.99,
    desc: 'A fulfilling meal with Chickpea Salad (440g), Aloo Fry (440g), Aloo Gobi Masala (440g), and Jeera Rice (400g).',
    spice: 1,
    images: ['/Chickpea Salad_Aloo Fry_Aloo Gobi Masala_Jeera Rice.png'],
  },
  {
    id: 'plant-protein-selection',
    name: 'Premium Plant Protein Selection',
    category: 'Menu',
    price: 14.99,
    originalPrice: 19.99,
    desc: 'A healthy mix featuring Tomato Cucumber Salad (440g), Soya Chaap subzi (440g), Tofu Jalfrezi (440g), and Jasmine Rice (500ml).',
    spice: 2,
    images: ['/Tomato Cucumber Salad_Soya Chaap subzi_Tofu Jalfrezi_Jasmine Rice.png'],
  },
  {
    id: 'chefs-garden-feast',
    name: "Chef's Garden Feast",
    category: 'Menu',
    price: 14.99,
    originalPrice: 19.99,
    desc: 'Protein-packed meal with Soya Chunks Salad (440g), Kadai veg (440g), Palak Tofu (440g), and Basmati Rice (500ml).',
    spice: 1,
    images: ['/Soya Chunks Salad_Kadai veg_Palak Tofu_Basmati Rice.png'],
  },
  {
    id: 'sprouted-vitality-meal',
    name: 'Sprouted Vitality Meal',
    category: 'Menu',
    price: 14.99,
    originalPrice: 19.99,
    desc: 'Nutritious and flavourful with Sprouted Green gram Salad with peanuts (440g), Baingan Bartha (440g), Soya Chettinad (440g), and Sambar Rice (450g).',
    spice: 2,
    images: ['/Sprouted Green gram Salad with peanuts_Baingan Bartha_Soya Chettinad_Sambar Rice.png'],
  },
];

export default function LocationSignatureDishes({ location }: LocationSignatureDishesProps) {
  const [items, setItems] = useState<RealMenuItem[]>(DEFAULT_REAL_ITEMS);

  // Calculate sequence of Monday/Thursday delivery dates dynamically
  const getDeliveryDateForIndex = (idx: number) => {
    const allowedDays = [1, 4]; // Monday & Thursday
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    let foundCount = 0;
    while (true) {
      if (allowedDays.includes(d.getDay())) {
        if (foundCount === idx) {
          return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
        }
        foundCount++;
      }
      d.setDate(d.getDate() + 1);
    }
  };

  useEffect(() => {
    try {
      const q = query(collection(db, 'menuItems'), where('active', '==', true));
      const unsub = onSnapshot(q, (snap) => {
        if (!snap.empty) {
          const fetched = snap.docs
            .map((d) => ({ id: d.id, ...d.data() }) as RealMenuItem)
            .filter((i) => (i.category || '').toLowerCase() === 'menu' || (i.category || '').toLowerCase() === 'combo packs');

          if (fetched.length >= 4) {
            setItems(fetched.slice(0, 4));
          }
        }
      }, (err) => {
        console.warn('Using default real menu items:', err);
      });
      return () => unsub();
    } catch {
      // Keep DEFAULT_REAL_ITEMS
    }
  }, []);

  return (
    <section id="menu" className="py-20 lg:py-28 bg-[#FBF8F3] text-stone-900 border-b border-stone-200 font-sans">
      <div className="max-w-screen-2xl mx-auto px-4 lg:px-8 xl:px-12">
        {/* Section Header with Previous Style & Explore All Menu Button */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#1E3B2B]/10 text-[#1E3B2B] text-xs font-black uppercase tracking-widest">
              <Sparkles size={13} className="text-[#C39B54]" />
              <span>Chef&apos;s London Selection</span>
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#142A1E] tracking-tight leading-tight font-sans">
              Signature Feasts on This Week&apos;s {location.name} Menu
            </h2>

            <p className="text-stone-600 text-base sm:text-lg leading-relaxed">
              Every dish is prepared fresh on delivery mornings in our commercial kitchen. No commercial
              pastes, no artificial thickeners, and no single-use plastic takeaway tubs.
            </p>
          </div>

          <Link
            href="/menu"
            className="inline-flex items-center gap-2 bg-[#142A1E] hover:bg-[#1E3B2B] text-white text-sm font-black px-7 py-4 rounded-2xl transition-all duration-150 shadow-xl shadow-stone-900/10 shrink-0 cursor-pointer"
          >
            <Utensils size={16} className="text-[#C39B54]" />
            <span>Explore Full Rotating Menu</span>
            <ArrowRight size={15} />
          </Link>
        </div>

        {/* Exactly 4 Real Menu Cards in One Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {items.slice(0, 4).map((item, idx) => {
            const assignedDate = getDeliveryDateForIndex(idx);
            const activePrice = item.price > 0 ? item.price : 14.99;
            const originalPrice = item.originalPrice && item.originalPrice > 0 ? item.originalPrice : 19.99;
            const imgSrc = item.images && item.images.length > 0 ? item.images[0] : '/banner.png';

            return (
              <div
                key={item.id}
                className="group bg-white rounded-3xl border border-stone-200 overflow-hidden shadow-xs hover:shadow-xl hover:border-[#C39B54] transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  {/* Image Frame */}
                  <div className="relative w-full aspect-[4/3] bg-stone-100 overflow-hidden">
                    <img
                      src={imgSrc}
                      alt={item.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                    />
                    {item.tag && (
                      <span className="absolute top-3 left-3 text-[11px] font-black bg-[#142A1E] text-white px-2.5 py-1 rounded-full shadow">
                        {item.tag}
                      </span>
                    )}
                  </div>

                  {/* Card Content */}
                  <div className="p-5 flex flex-col space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-extrabold text-[#142A1E] text-lg leading-snug line-clamp-2">
                        {item.name}
                      </h3>
                      {item.spice > 0 && (
                        <div className="flex gap-0.5 shrink-0 mt-1">
                          {Array.from({ length: 3 }, (_, i) => (
                            <Flame
                              key={i}
                              size={12}
                              className={i < item.spice ? 'text-red-500 fill-red-400' : 'text-gray-200'}
                            />
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Delivery Date & Offer Badges */}
                    <div className="space-y-1.5">
                      <div className="inline-flex items-center gap-1.5 bg-orange-50 text-[#b58b42] text-xs font-black px-2.5 py-1 rounded-lg border border-orange-200">
                        <Calendar size={13} />
                        <span>Delivery Date: {assignedDate}</span>
                      </div>
                      <div className="bg-emerald-50 text-emerald-800 text-[11px] font-bold px-2.5 py-1 rounded-lg border border-emerald-100 leading-tight">
                        🎉 25% off first 4 deliveries, applied automatically.
                      </div>
                    </div>

                    {/* Description */}
                    <p className="text-xs text-stone-600 leading-relaxed line-clamp-3">
                      {item.desc}
                    </p>
                  </div>
                </div>

                {/* Price and Action Footer (Full Width View Details Button like Homepage) */}
                <div className="p-5 pt-3 border-t border-stone-100 flex flex-col space-y-3 mt-auto">
                  <div className="flex items-baseline gap-2">
                    {originalPrice > 0 && (
                      <span className="text-xl font-extrabold text-[#C39B54] line-through opacity-60">
                        £{originalPrice.toFixed(2)}
                      </span>
                    )}
                    <span className="text-3xl font-black text-[#C39B54] tracking-tight">
                      £{activePrice.toFixed(2)}
                    </span>
                  </div>

                  <Link
                    href="/menu"
                    className="flex items-center justify-center w-full text-white text-sm font-bold py-3 rounded-2xl transition-all active:scale-95 shadow-sm bg-[#10261A] hover:bg-[#1E3B2B] text-center"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom Centered Explore All Menu CTA */}
        <div className="mt-12 text-center">
          <Link
            href="/menu"
            className="inline-flex items-center gap-2.5 bg-white hover:bg-stone-50 text-[#142A1E] border-2 border-stone-300 hover:border-[#142A1E] text-sm font-black px-8 py-3.5 rounded-2xl transition-all shadow-sm"
          >
            <span>Explore All 20+ Rotating Menu Dishes</span>
            <ArrowRight size={16} className="text-[#C39B54]" />
          </Link>
        </div>
      </div>
    </section>
  );
}
