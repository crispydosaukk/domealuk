'use client';
import React, { useState, useEffect } from 'react';
import UserNavbar from '@/components/UserNavbar';
import UserFooter from '@/components/UserFooter';
import Image from 'next/image';
import { CheckCircle2, ChevronDown, CalendarIcon, CreditCard } from 'lucide-react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export default function GiftPage() {
  const [deliveries, setDeliveries] = useState<number>(1);
  const [sides, setSides] = useState<string>('none');
  const [price, setPrice] = useState<number>(48.50);

  const [settings, setSettings] = useState({
    giftBasePrice: 48.50,
    giftStandardPrice: 8.50,
    giftCompletePrice: 12.50,
    giftImage: '/gift-card.png',
    giftTitle: 'Good Things Are Meant to Be Shared!',
    giftContent1: 'Treat your friends, family, lovers, aunties, and uncles to a taste of our banging authentic Indian meals - because great food is best enjoyed together.',
    giftContent2: "Give the gift of a DoMeal delivery! We'll send the voucher straight to your giftee so they can start redeeming their tiffin delivery when it suits them.",
    giftIncludesTitle: 'Each gift includes:',
    giftInclude1: 'A reusable tiffin for them to keep (£15 value)',
    giftInclude2: 'A meal for two (or two servings) packed with bold, fresh flavours',
    giftNote: 'Gift subscriptions are delivered on a fortnightly basis (or can be customised based on preference and availability).',
    giftClosing: "A simple, thoughtful, and waste-free way to spread the love of great food! We can't wait to feed your loved ones."
  });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch('/api/public-settings', { method: 'POST' });
        if (res.ok) {
          const data = await res.json();
          if (data.giftBasePrice !== undefined) {
            setSettings(prev => ({ ...prev, ...data }));
            setPrice(data.giftBasePrice * deliveries);
          }
        }
      } catch (error) {}
    };
    fetchSettings();
  }, []);

  const calculatePrice = (dels: number, sds: string, currentSettings = settings) => {
    let base = currentSettings.giftBasePrice * dels;
    let extra = 0;
    if (sds === 'standard') extra = currentSettings.giftStandardPrice * dels;
    if (sds === 'complete') extra = currentSettings.giftCompletePrice * dels;
    setPrice(base + extra);
  };

  const handleDeliveriesChange = (val: number) => {
    setDeliveries(val);
    calculatePrice(val, sides);
  };

  const handleSidesChange = (val: string) => {
    setSides(val);
    calculatePrice(deliveries, val);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <UserNavbar />
      
      <main className="flex-1 max-w-screen-xl mx-auto px-4 lg:px-8 xl:px-10 py-6 w-full">
        
        {/* Breadcrumb */}
        <div className="text-sm text-muted-foreground mb-8">
          <a href="/" className="hover:text-primary">Home</a> &gt; <span className="text-foreground font-600">Gift Cards</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 xl:gap-16">
          
          {/* Left Column - Image & Description */}
          <div className="space-y-8">
            <div className="relative w-full aspect-square md:aspect-[4/3] lg:aspect-square rounded-3xl overflow-hidden shadow-xl border border-border">
              <Image 
                src={settings.giftImage || "/gift-card.png"}
                alt="DoMeal Delivery Gift Card"
                fill
                className="object-cover"
                priority
              />
            </div>
            
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-border">
              <h3 className="text-xl font-800 text-[#1E3B2B] mb-4">{settings.giftTitle}</h3>
              <p className="text-muted-foreground leading-relaxed mb-4 whitespace-pre-line">
                {settings.giftContent1}
              </p>
              <p className="text-muted-foreground leading-relaxed mb-6 whitespace-pre-line">
                {settings.giftContent2}
              </p>
              
              <h4 className="font-800 text-foreground mb-3">{settings.giftIncludesTitle}</h4>
              <ul className="space-y-3 mb-6">
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="text-[#C39B54] shrink-0 mt-0.5" size={20} />
                  <span className="text-muted-foreground whitespace-pre-line">{settings.giftInclude1}</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="text-[#C39B54] shrink-0 mt-0.5" size={20} />
                  <span className="text-muted-foreground whitespace-pre-line">{settings.giftInclude2}</span>
                </li>
              </ul>
              
              <p className="text-sm text-muted-foreground italic mb-4 bg-gray-50 p-4 rounded-xl whitespace-pre-line">
                {settings.giftNote}
              </p>
              
              <p className="font-700 text-[#1E3B2B] whitespace-pre-line">
                {settings.giftClosing}
              </p>
            </div>
          </div>

          {/* Right Column - Purchasing Form */}
          <div className="lg:sticky lg:top-28 self-start bg-white p-6 md:p-10 rounded-3xl shadow-xl border border-border">
            <h1 className="text-3xl md:text-4xl font-900 text-[#1E3B2B] mb-3">DoMeal Delivery Gift Card</h1>
            <p className="text-3xl font-800 text-[#C39B54] mb-8">£{price.toFixed(2)}</p>

            <form className="space-y-8" onSubmit={(e) => e.preventDefault()}>
              
              {/* Deliveries */}
              <div>
                <label className="block text-sm font-800 text-foreground mb-3 uppercase tracking-wider">How many deliveries?</label>
                <div className="flex flex-wrap gap-3">
                  {[1, 2, 4, 6].map(num => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => handleDeliveriesChange(num)}
                      className={`w-14 h-14 rounded-2xl flex items-center justify-center text-lg font-800 border-2 transition-all ${
                        deliveries === num 
                          ? 'border-[#1E3B2B] bg-[#1E3B2B] text-white shadow-md' 
                          : 'border-border bg-white text-muted-foreground hover:border-[#C39B54]/50 hover:bg-[#C39B54]/5'
                      }`}
                    >
                      {num}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sides Selection */}
              <div>
                <label className="block text-sm font-800 text-foreground mb-3 uppercase tracking-wider">Select your sides</label>
                <div className="space-y-3">
                  {[
                    { id: 'none', label: 'None', extra: 0 },
                    { id: 'standard', label: 'Standard', extra: settings.giftStandardPrice },
                    { id: 'complete', label: 'Complete', extra: settings.giftCompletePrice },
                  ].map(option => (
                    <div 
                      key={option.id}
                      onClick={() => handleSidesChange(option.id)}
                      className={`flex justify-between items-center p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                        sides === option.id 
                          ? 'border-[#1E3B2B] bg-[#1E3B2B]/5' 
                          : 'border-border hover:border-[#C39B54]/50'
                      }`}
                    >
                      <div>
                        <p className={`font-800 ${sides === option.id ? 'text-[#1E3B2B]' : 'text-foreground'}`}>{option.label}</p>
                        {option.id !== 'none' && <p className="text-xs text-muted-foreground font-600 underline mt-1">What's inside?</p>}
                      </div>
                      {option.extra > 0 && (
                        <span className={`font-700 ${sides === option.id ? 'text-[#C39B54]' : 'text-muted-foreground'}`}>
                          +£{option.extra.toFixed(2)}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <hr className="border-border" />

              {/* Form Fields */}
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-800 text-muted-foreground mb-1.5 uppercase">Your Name *</label>
                  <input type="text" className="w-full bg-gray-50 border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#C39B54]" required />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-800 text-muted-foreground mb-1.5 uppercase">Recipient First Name *</label>
                    <input type="text" className="w-full bg-gray-50 border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#C39B54]" required />
                  </div>
                  <div>
                    <label className="block text-xs font-800 text-muted-foreground mb-1.5 uppercase">Recipient Last Name *</label>
                    <input type="text" className="w-full bg-gray-50 border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#C39B54]" required />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-800 text-muted-foreground mb-1.5 uppercase">Recipient Email *</label>
                  <input type="email" className="w-full bg-gray-50 border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#C39B54]" required />
                </div>
                <div>
                  <label className="block text-xs font-800 text-muted-foreground mb-1.5 uppercase">Message (Optional)</label>
                  <textarea rows={3} className="w-full bg-gray-50 border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#C39B54] resize-none" placeholder="Write a nice note..."></textarea>
                </div>
                <div>
                  <label className="block text-xs font-800 text-muted-foreground mb-1.5 uppercase">Send On *</label>
                  <div className="relative">
                    <input type="date" defaultValue="2026-06-17" className="w-full bg-gray-50 border border-border rounded-xl px-4 py-3 pl-10 text-sm focus:outline-none focus:ring-2 focus:ring-[#C39B54]" required />
                    <CalendarIcon className="absolute left-3.5 top-3 text-muted-foreground" size={18} />
                  </div>
                </div>
              </div>

              {/* Action */}
              <button type="submit" className="w-full bg-[#1E3B2B] hover:bg-primary text-white font-800 text-lg py-5 rounded-2xl transition-all shadow-xl shadow-green-900/20 flex items-center justify-center gap-2">
                Add to basket — £{price.toFixed(2)}
              </button>

              <div className="flex flex-col items-center gap-2 mt-4">
                <p className="text-xs text-muted-foreground font-600">Buy with</p>
                <div className="flex gap-2 text-muted-foreground">
                   <CreditCard size={24} />
                   <div className="w-10 h-6 bg-blue-600 rounded flex items-center justify-center text-[10px] text-white font-bold italic tracking-tighter">Pay<span className="text-blue-200">Pal</span></div>
                </div>
                <a href="#" className="text-xs text-primary font-600 underline underline-offset-2 mt-2">More payment options</a>
              </div>

            </form>
          </div>

        </div>
      </main>

      <UserFooter />
    </div>
  );
}
