'use client';
import React, { useState, useEffect } from 'react';
import UserNavbar from '@/components/UserNavbar';
import UserFooter from '@/components/UserFooter';
import { ConciergeBell, Package, ChevronDown } from 'lucide-react';
import Link from 'next/link';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

const heatingData = [
  {
    title: 'Golden',
    icon: ConciergeBell,
    serves: 2,
    oven: [
      'Preheat oven to 180°C (160°C fan) / Gas Mark 4.',
      'Unclip the dabba and remove the lid.',
      "Place the two bottom tins, still stacked, onto an oven tray, along side the aubergine curry. The top tin can be eaten cold, however if you'd like it warmed it can go in for half the duration (15-20 minutes).",
      'Place dishes in the oven and heat for 30-40 minutes, or until piping hot. Stir halfway through for even heating.',
      'Check the temperature before serving—food should be steaming hot throughout.'
    ],
    microwave: [
      'Transfer portions of all dishes into microwave-safe bowls.',
      'Cover the dishes with a microwave-safe lid or plate to prevent drying out.',
      'Heat on high for 5-7 minutes, stirring halfway through - have the top tin cold if you wish.',
      'Check the temperature and heat for an extra minute if needed—food should be piping hot throughout.'
    ],
    tip: 'For best results, stir curries and greens before serving to redistribute heat evenly.'
  },
  {
    title: 'Sunshine',
    icon: ConciergeBell,
    serves: 2,
    oven: [
      'Preheat oven to 180°C (160°C fan) / Gas Mark 4.',
      'Unclip the dabba and remove the lid.',
      'Place the top two tins, still stacked, onto an oven tray, along side the (still stacked) bottom two tins. Please note the top tin in this menu can be eaten cold if you wish, in the warmer months, we prefer it that way.',
      'Place dishes in the oven and heat for 30-40 minutes, or until piping hot. Stir halfway through for even heating.',
      'Check the temperature before serving—food should be steaming hot throughout.'
    ],
    microwave: [
      'Transfer portions of all dishes into microwave-safe bowls.',
      'Cover the dishes with a microwave-safe lid or plate to prevent drying out.',
      'Heat on high for 5-7 minutes, stirring halfway through.',
      'Check the temperature and heat for an extra minute if needed—food should be piping hot throughout.'
    ],
    tip: 'For best results, stir curries and greens before serving to redistribute heat evenly.'
  },
  {
    title: 'Comfort Classic',
    icon: ConciergeBell,
    serves: 2,
    oven: [
      'Preheat oven to 180°C (160°C fan) / Gas Mark 4.',
      'Unclip the dabba and remove the lid.',
      'Place the top two tins, still stacked, onto an oven tray, along side the (still stacked) bottom two tins.',
      'Place dishes in the oven and heat for 30-40 minutes, or until piping hot. Stir halfway through for even heating.',
      'Check the temperature before serving - food should be steaming hot throughout.'
    ],
    microwave: [
      'Transfer portions of all dishes into microwave-safe bowls.',
      'Cover the dishes with a microwave-safe lid or plate to prevent drying out.',
      'Heat on high for 5-7 minutes, stirring halfway through.',
      'Check the temperature and heat for an extra minute if needed—food should be piping hot throughout.'
    ],
    tip: 'For best results, stir curries and greens before serving to redistribute heat evenly.'
  },
  {
    title: 'Bright & Fresh',
    icon: ConciergeBell,
    serves: 2,
    oven: [
      'Preheat oven to 180°C (160°C fan) / Gas Mark 4.',
      'Unclip the dabba and remove the lid.',
      'Place the top two tins, still stacked, onto an oven tray, along side the (still stacked) bottom two tins. Please note the top tin in this menu can be eaten cold if you wish, in the warmer months, we prefer it that way.',
      'Place dishes in the oven and heat for 30-40 minutes, or until piping hot. Stir halfway through for even heating.',
      'Check the temperature before serving—food should be steaming hot throughout.'
    ],
    microwave: [
      'Transfer portions of all dishes into microwave-safe bowls.',
      'Cover the dishes with a microwave-safe lid or plate to prevent drying out.',
      'Heat on high for 5-7 minutes, stirring halfway through.',
      'Check the temperature and heat for an extra minute if needed—food should be piping hot throughout.'
    ],
    tip: 'For best results, stir curries and greens before serving to redistribute heat evenly.'
  },
  {
    title: 'A Proper Feast',
    icon: ConciergeBell,
    serves: 2,
    oven: [
      'Preheat oven to 180°C (160°C fan) / Gas Mark 4.',
      'Unclip the dabba and remove the lid.',
      "Place the bottom two tins, still stacked, onto an oven tray, alongside the curry tin. The Top tin is best eaten cold in this weather, if you'd like it warm, please heat along with the rest of the dabba.",
      'Place dishes in the oven and heat for 30-40 minutes, or until piping hot. Stir halfway through for even heating.',
      'Check the temperature before serving—food should be steaming hot throughout.'
    ],
    microwave: [
      'Transfer portions of all dishes into microwave-safe bowls or a plate (except the top tin which is best enjoyed cold in this weather).',
      'Cover the dishes with a microwave-safe lid or plate to prevent drying out.',
      'Heat on high for 5-7 minutes, stirring halfway through.',
      'Check the temperature and heat for an extra minute if needed—food should be piping hot throughout.'
    ],
    tip: 'For best results, stir curries and greens before serving to redistribute heat evenly.'
  },
  {
    title: 'House Favourite',
    icon: ConciergeBell,
    serves: 2,
    oven: [
      'Preheat oven to 180°C (160°C fan) / Gas Mark 4.',
      'Unclip the dabba and remove the lid.',
      'Place the top two tins, still stacked, onto an oven tray, along side the (still stacked) bottom two tins.',
      'Place dishes in the oven and heat for 30-40 minutes, or until piping hot. Stir halfway through for even heating.',
      'Check the temperature before serving—food should be steaming hot throughout.'
    ],
    microwave: [
      'Transfer portions of all dishes into microwave-safe bowls.',
      'Cover the dishes with a microwave-safe lid or plate to prevent drying out.',
      'Heat on high for 5-7 minutes, stirring halfway through.',
      'Check the temperature and heat for an extra minute if needed—food should be piping hot throughout.'
    ],
    tip: 'For best results, stir curries and dals halfway through to ensure even heating. If you prefer your rice less moist, uncover the rice tin for the last 5 minutes of heating.'
  },
  {
    title: 'Tamil Prince',
    icon: ConciergeBell,
    serves: 2,
    oven: [
      'Preheat oven to 180°C (160°C fan) / Gas Mark 4.',
      'Unclip the dabba and remove the lid.',
      'Place the top two tins, still stacked, onto an oven tray, along side the (still stacked) bottom two tins.',
      'Place dishes in the oven and heat for 30-40 minutes, or until piping hot. Stir halfway through for even heating.',
      'Check the temperature before serving—food should be steaming hot throughout.'
    ],
    microwave: [
      'Transfer portions of all dishes into microwave-safe bowls.',
      'Cover the dishes with a microwave-safe lid or plate to prevent drying out.',
      'Heat on high for 5-7 minutes, stirring halfway through.',
      'Check the temperature and heat for an extra minute if needed—food should be piping hot throughout.'
    ],
    tip: 'For best results, stir curries and dals halfway through to ensure even heating. If you prefer your rice less moist, uncover the rice tin for the last 5 minutes of heating.'
  },
  {
    title: 'Naan',
    icon: Package,
    text: "To ensure your roti don't crisp up, we recommend just 2 minutes in the 180c oven. It can be enjoyed as it is, but its even better when warmed through."
  },
  {
    title: 'Samosas, Spring Rolls and Katsu',
    icon: Package,
    text: "We recommend at least 10 minutes in the 180c oven to ensure they are crisp and piping hot."
  }
];

export default function HowToHeatPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(0); // First item open by default
  const [settings, setSettings] = useState({
    heatTitle: 'Heating Instructions',
    heatContent: 'Your DoMeal is delivered ice-packed and cold and lasts for 48 hours in the fridge.\n\nOur meals are best enjoyed heated. Our recommended heating method is the oven at 180°C until piping hot (usually around 30-40 minutes).',
    heatBottomTitle: 'Find out if we deliver to your neighbourhood',
    heatBottomDesc: 'Ready to enjoy piping hot, authentic Indian meals at home? Enter your postcode on our homepage to see if we deliver to you.',
    heatBottomBtn: 'Get Started',
    heatData: heatingData
  });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const docRef = doc(db, 'settings', 'global');
        const docSnap = await getDoc(docRef);
        if (docSnap.exists() && docSnap.data().heatTitle !== undefined) {
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
                    <div className="flex items-center gap-4">
                      <Icon className={`w-6 h-6 md:w-8 md:h-8 ${isOpen ? 'text-[#C39B54]' : 'text-primary'}`} strokeWidth={1.5} />
                      <span className={`text-xl md:text-2xl font-800 ${isOpen ? 'text-[#1E3B2B]' : 'text-foreground'}`}>
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
                                  {item.oven?.map((step, i) => (
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
                                  {item.microwave?.map((step, i) => (
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
