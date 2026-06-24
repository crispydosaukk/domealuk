'use client';

import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import Image from 'next/image';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface PopupSettings {
  popupEnabled: boolean;
  popupTitle: string;
  popupDiscountPercentage: number;
  popupOrdersCount: number;
  popupImage: string;
  popupDescription: string;
  popupBtnText: string;
}

export default function GlobalPopup() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [settings, setSettings] = useState<PopupSettings>({
    popupEnabled: true,
    popupTitle: 'Exclusive Offer!',
    popupDiscountPercentage: 25,
    popupOrdersCount: 4,
    popupImage: '/discount_poster.png',
    popupDescription: 'Sign up today and get {percentage}% off your first {count} orders with DoMeal.',
    popupBtnText: 'Claim Offer Now'
  });

  useEffect(() => {
    // Check if the user has already seen the popup in this session
    // const hasSeenPopup = sessionStorage.getItem('hasSeenPopup');
    // if (hasSeenPopup) return;
    
    // Open instantly
    setIsOpen(true);

    const fetchSettings = async () => {
      try {
        const res = await fetch('/api/public-settings', { method: 'POST' });
        if (res.ok) {
          const data = await res.json();
          const isEnabled = data.popupEnabled !== false; // Default to true if undefined
          
          if (!isEnabled) {
            setIsOpen(false);
          } else {
            setSettings({
              popupEnabled: true,
              popupTitle: data.popupTitle || 'Exclusive Offer!',
              popupDiscountPercentage: data.popupDiscountPercentage || 25,
              popupOrdersCount: data.popupOrdersCount || 4,
              popupImage: data.popupImage || '/discount_poster.png',
              popupDescription: data.popupDescription || 'Sign up today and get {percentage}% off your first {count} orders with DoMeal.',
              popupBtnText: data.popupBtnText || 'Claim Offer Now'
            });
          }
        }
      } catch (error) {
        console.error('Failed to load popup settings:', error);
      }
    };

    fetchSettings();
  }, []);

  if (pathname.startsWith('/admin')) {
    return null;
  }

  const handleClose = () => {
    setIsOpen(false);
    sessionStorage.setItem('hasSeenPopup', 'true');
  };

  if (!isOpen || !settings) return null;

  // Format the description
  const formattedDescription = settings.popupDescription
    .replace(/\{percentage\}/g, settings.popupDiscountPercentage.toString())
    .replace(/\{count\}/g, settings.popupOrdersCount.toString());

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={handleClose}
      />
      
      {/* Modal */}
      <div className="relative bg-white rounded-3xl w-full max-w-4xl overflow-hidden shadow-2xl flex flex-col md:flex-row animate-in zoom-in-95 fade-in duration-300">
        
        {/* Close Button */}
        <button 
          onClick={handleClose}
          className="absolute top-4 right-4 z-10 w-10 h-10 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 rounded-full flex items-center justify-center text-white transition-colors"
        >
          <X size={20} />
        </button>

        {/* Image Section */}
        <div className="relative w-full md:w-1/2 h-[300px] md:h-auto">
          <Image 
            src={settings.popupImage} 
            alt="Promotional Offer" 
            fill 
            className="object-cover"
          />
          {/* Overlay gradient for text readability if needed */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />
          
          <div className="absolute bottom-6 left-6 right-6 md:hidden text-white">
             <h2 className="text-3xl font-900 mb-2">{settings.popupTitle}</h2>
          </div>
        </div>

        {/* Content Section */}
        <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center bg-[#11261a] text-white">
          <div className="hidden md:block">
            <div className="inline-flex items-center justify-center px-3 py-1 rounded-full bg-orange-500/20 text-orange-400 font-800 text-xs tracking-widest uppercase mb-4">
              Limited Time
            </div>
            <h2 className="text-4xl lg:text-5xl font-900 mb-6 leading-tight text-white">{settings.popupTitle}</h2>
          </div>
          
          <p className="text-lg text-white/80 leading-relaxed mb-8 font-500">
            {formattedDescription}
          </p>

          <div className="bg-white/10 border border-white/20 rounded-2xl p-5 mb-8">
            <div className="flex justify-between items-center text-center divide-x divide-white/20">
              <div className="flex-1 px-2">
                <p className="text-3xl font-900 text-[#f3e5d8] mb-1">{settings.popupDiscountPercentage}%</p>
                <p className="text-xs font-700 text-white/70 uppercase tracking-wide">Discount</p>
              </div>
              <div className="flex-1 px-2">
                <p className="text-3xl font-900 text-[#f3e5d8] mb-1">{settings.popupOrdersCount}</p>
                <p className="text-xs font-700 text-white/70 uppercase tracking-wide">Orders</p>
              </div>
            </div>
          </div>

          <Link href="/menu" onClick={handleClose} className="w-full">
            <button className="w-full bg-[#f3e5d8] text-[#11261a] hover:bg-white font-900 text-lg py-4 rounded-xl transition-all active:scale-95 shadow-[0_0_20px_rgba(243,229,216,0.3)]">
              {settings.popupBtnText}
            </button>
          </Link>
          
          <p className="text-center text-xs text-white/40 mt-4">
            Terms and conditions apply.
          </p>
        </div>
      </div>
    </div>
  );
}
