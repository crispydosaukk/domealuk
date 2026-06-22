'use client';
import React, { useState, useEffect } from 'react';
import UserNavbar from '@/components/UserNavbar';
import UserFooter from '@/components/UserFooter';
import { ConciergeBell, Package, ChevronDown } from 'lucide-react';
import Link from 'next/link';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export default function HowToHeatPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(0); // First item open by default
  const [settings, setSettings] = useState({
    heatTitle: 'Heating Instructions',
    heatContent: 'Your DoMeal is delivered ice-packed and cold and lasts for 48 hours in the fridge.\n\nOur meals are best enjoyed heated. Our recommended heating method is the oven at 180°C until piping hot (usually around 30-40 minutes).',
    heatBottomTitle: 'Find out if we deliver to your neighbourhood',
    heatBottomDesc: 'Ready to enjoy piping hot, authentic Indian meals at home? Enter your postcode on our homepage to see if we deliver to you.',
    heatBottomBtn: 'Get Started',
    heatData: [] as any[]
  });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const docRef = doc(db, 'settings', 'global');
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setSettings(prev => ({ ...prev, ...docSnap.data() }));
        }
      } catch (error) {}
    };
    fetchSettings();
  }, []);

  const toggleAccordion = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <UserNavbar />
      
      <main className="flex-1 w-full pt-12 pb-24 mt-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="mb-12 text-center">
            <h1 className="text-4xl md:text-5xl font-900 text-[#1E3B2B] mb-6">{settings.heatTitle}</h1>
            <p className="text-lg text-muted-foreground mb-4 max-w-3xl mx-auto leading-relaxed whitespace-pre-line">
              {settings.heatContent}
            </p>
            <p className="text-sm font-600 text-primary mt-6">For detailed heating instructions per menu, please see below:</p>
          </div>

          <div className="bg-white rounded-3xl shadow-xl border border-border overflow-hidden">
            {settings.heatData.map((item, index) => {
              const isOpen = openIndex === index;
              // Map saved string icons or fallback
              const Icon = (item.icon as any) === 'Package' || item.icon === Package ? Package : ConciergeBell;
              
              return (
                <div key={index} className="border-b border-border last:border-0">
                  <button
                    onClick={() => toggleAccordion(index)}
                    className={`w-full flex items-center justify-between px-6 py-5 md:px-8 md:py-6 transition-all duration-200 ${
                      isOpen ? 'bg-[#1E3B2B]/5' : 'hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center gap-4 flex-1 pr-4">
                      <Icon className={`w-6 h-6 md:w-8 md:h-8 shrink-0 ${isOpen ? 'text-[#C39B54]' : 'text-primary'}`} strokeWidth={1.5} />
                      <span className={`text-xl md:text-2xl font-800 text-left ${isOpen ? 'text-[#1E3B2B]' : 'text-foreground'}`}>
                        {item.title}
                      </span>
                    </div>
                    <ChevronDown 
                      className={`w-6 h-6 transition-transform duration-300 ${isOpen ? 'rotate-180 text-[#C39B54]' : 'text-muted-foreground'}`} 
                    />
                  </button>

                  {isOpen && (
                    <div className="px-6 pb-8 md:px-8 bg-[#1E3B2B]/5 animate-in slide-in-from-top-2 duration-200">
                      <div className="pt-2 pl-10 md:pl-12">
                        {item.text ? (
                          <p className="text-foreground leading-relaxed text-lg">{item.text}</p>
                        ) : (
                          <>
                            <div className="mb-6">
                              <span className="inline-block bg-[#C39B54]/20 text-[#926a2e] font-800 text-xs uppercase tracking-widest px-3 py-1 rounded-full mb-4">
                                Serves: {item.serves}
                              </span>
                            </div>
                            
                            <div className="space-y-8">
                              <div>
                                <h3 className="font-800 text-[#1E3B2B] text-lg mb-3 flex items-center gap-2">
                                  <span className="w-2 h-2 rounded-full bg-[#C39B54]" /> Oven Heating (Recommended)
                                </h3>
                                <ul className="space-y-2 text-muted-foreground pl-4">
                                  {item.oven?.map((step: string, i: number) => (
                                    <li key={i} className="flex gap-2">
                                      <span className="text-[#C39B54] font-800 select-none">{i + 1}.</span>
                                      <span className="leading-relaxed">{step}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>

                              <div>
                                <h3 className="font-800 text-[#1E3B2B] text-lg mb-3 flex items-center gap-2">
                                  <span className="w-2 h-2 rounded-full bg-primary" /> Microwave Heating (Quick & Convenient)
                                </h3>
                                <ul className="space-y-2 text-muted-foreground pl-4">
                                  {item.microwave?.map((step: string, i: number) => (
                                    <li key={i} className="flex gap-2">
                                      <span className="text-primary font-800 select-none">{i + 1}.</span>
                                      <span className="leading-relaxed">{step}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>

                              {item.tip && (
                                <div className="bg-white border-l-4 border-[#C39B54] p-4 rounded-r-xl shadow-sm">
                                  <p className="text-sm text-foreground">
                                    <strong className="text-[#C39B54]">Tip:</strong> {item.tip}
                                  </p>
                                </div>
                              )}
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="mt-16 text-center bg-[#1E3B2B] rounded-3xl p-10 md:p-12 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#C39B54] rounded-full blur-3xl opacity-20 translate-x-1/2 -translate-y-1/2" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary rounded-full blur-3xl opacity-20 -translate-x-1/2 translate-y-1/2" />
            
            <h2 className="text-3xl font-900 text-white mb-4 relative z-10">{settings.heatBottomTitle}</h2>
            <p className="text-blue-100 mb-8 max-w-xl mx-auto relative z-10 whitespace-pre-line">
              {settings.heatBottomDesc}
            </p>
            <Link href="/" className="inline-block bg-[#C39B54] text-white font-800 px-8 py-4 rounded-xl hover:bg-[#a17e41] transition-all shadow-lg shadow-yellow-900/20 relative z-10">
              {settings.heatBottomBtn}
            </Link>
          </div>

        </div>
      </main>

      <UserFooter />
    </div>
  );
}
