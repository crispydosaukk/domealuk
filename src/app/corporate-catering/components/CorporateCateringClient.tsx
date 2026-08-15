'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  Users,
  Clock,
  Sparkles,
  Download,
  Calendar,
  Building,
  Mail,
  Phone,
  MapPin,
  CheckCircle2,
  ChevronRight,
  Flame,
  Award,
  ShieldCheck,
  Star,
  FileText,
  X,
  Plus,
  Minus,
  UtensilsCrossed,
  GlassWater,
  ChefHat,
  HeartHandshake
} from 'lucide-react';
import { generateCorporateMenuPdf } from '@/lib/generateCorporateMenuPdf';
import { toast } from 'sonner';

import { getLocalCorporateMenuConfig } from '@/lib/corporateMenuConfig';
import { saveLocalCorporateInquiry } from '@/lib/corporateInquiriesStorage';

export default function CorporateCateringClient() {
  // Dynamic Corporate Menu Config
  const [config, setConfig] = useState(getLocalCorporateMenuConfig());

  React.useEffect(() => {
    const handleConfigUpdate = () => setConfig(getLocalCorporateMenuConfig());
    window.addEventListener('domeal-corporate-config-updated', handleConfigUpdate);
    window.addEventListener('storage', handleConfigUpdate);
    return () => {
      window.removeEventListener('domeal-corporate-config-updated', handleConfigUpdate);
      window.removeEventListener('storage', handleConfigUpdate);
    };
  }, []);

  // State for Booking Modal
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);

  // State for Calculator & Form
  const [selectedPackage, setSelectedPackage] = useState<'live' | 'standard'>('live');
  const [paxCount, setPaxCount] = useState<number | string>(config.minPax || 10);
  const [companyName, setCompanyName] = useState('');
  const [contactName, setContactName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [eventTime, setEventTime] = useState('');
  const [eventLocation, setEventLocation] = useState('');
  const [specialNotes, setSpecialNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);

  // Selected Dishes
  const [selectedChaat, setSelectedChaat] = useState('Samosa Chaat');
  const [selectedMains, setSelectedMains] = useState<string[]>(['Veg Biryani', 'Jeera Rice']);
  const [selectedBread, setSelectedBread] = useState('Butter Naan');
  const [selectedCurries, setSelectedCurries] = useState<string[]>(['Paneer Butter Masala', 'Kadai Veg']);
  const [selectedDessert, setSelectedDessert] = useState('Gulab Jamun (2pcs)');

  // Active Menu Tab
  const [activeMenuTab, setActiveMenuTab] = useState<'package' | 'desserts' | 'drinks' | 'bar'>('package');

  // Active Gallery Filter
  const [activeGalleryFilter, setActiveGalleryFilter] = useState<'all' | 'live' | 'buffet' | 'bar'>('all');

  // Dynamic Pricing calculations
  const numericPax = typeof paxCount === 'number' ? paxCount : (parseInt(paxCount, 10) || 0);
  const pricePerPax = selectedPackage === 'live' ? config.liveDosaPrice : config.standardBuffetPrice;
  const totalPrice = (numericPax * pricePerPax).toFixed(2);

  const scrollToBookingForm = () => {
    const el = document.getElementById('booking-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handlePaxChange = (delta: number) => {
    setPaxCount((prev) => {
      const val = typeof prev === 'number' ? prev : (parseInt(prev, 10) || 0);
      return Math.max(10, val + delta);
    });
  };

  const toggleMainSelection = (item: string) => {
    if (selectedMains.includes(item)) {
      if (selectedMains.length > 1) {
        setSelectedMains(selectedMains.filter((m) => m !== item));
      }
    } else {
      if (selectedMains.length < 2) {
        setSelectedMains([...selectedMains, item]);
      } else {
        setSelectedMains([selectedMains[1], item]);
      }
    }
  };

  const toggleCurrySelection = (item: string) => {
    if (selectedCurries.includes(item)) {
      if (selectedCurries.length > 1) {
        setSelectedCurries(selectedCurries.filter((c) => c !== item));
      }
    } else {
      if (selectedCurries.length < 2) {
        setSelectedCurries([...selectedCurries, item]);
      } else {
        setSelectedCurries([selectedCurries[1], item]);
      }
    }
  };

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalPax = typeof paxCount === 'number' ? paxCount : (parseInt(paxCount, 10) || 0);
    if (!finalPax || finalPax < 10) {
      toast.error('Minimum order is 10 employees/guests.');
      return;
    }
    if (!companyName || !contactName || !email || !phone || !eventDate) {
      toast.error('Please fill in all required contact details.');
      return;
    }

    setIsSubmitting(true);
    const inquiryPayload = {
      companyName,
      contactName,
      email,
      phone,
      eventDate,
      eventTime: eventTime || 'Not specified',
      eventLocation: eventLocation || 'Not specified',
      selectedPackage: selectedPackage === 'live' ? 'With Live Dosa Station (£29.99 pp)' : 'Without Live Dosa (£24.99 pp)',
      packageType: selectedPackage,
      paxCount: finalPax,
      estimatedTotal: Number((finalPax * pricePerPax).toFixed(2)),
      specialNotes: specialNotes || '',
      status: 'New' as const,
    };

    // Guaranteed local save for instant admin dashboard updates
    saveLocalCorporateInquiry(inquiryPayload);

    // Optional Firestore sync
    try {
      const { collection, addDoc, serverTimestamp } = await import('firebase/firestore');
      const { db } = await import('@/lib/firebase');
      await addDoc(collection(db, 'corporateInquiries'), {
        ...inquiryPayload,
        createdAt: serverTimestamp(),
      });
    } catch (err) {
      console.warn('Firestore sync note:', err);
    }

    // Direct email notification trigger
    try {
      await fetch('/api/send-corporate-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(inquiryPayload),
      });
    } catch (emailErr) {
      console.warn('Direct email notification trigger note:', emailErr);
    }

    setIsSubmitting(false);
    setBookingSuccess(true);
    toast.success('Corporate Catering Inquiry Received! Our corporate team will contact you shortly.');
  };

  const galleryImages = [
    {
      url: '/assets/corporate_catering_hero.jpg',
      fallback: '/assets/corporate_catering_hero.jpg',
      title: 'Live 4ft Jumbo Dosa Counter',
      category: 'live',
      caption: 'Chefs preparing authentic 4ft Jumbo Dosas live on site for corporate guests'
    },
    {
      url: '/assets/Corporate Buffet Setup.jpg',
      fallback: 'https://images.unsplash.com/photo-1555244162-803834f70033?auto=format&fit=crop&w=800&q=80',
      title: 'Executive Corporate Buffet',
      category: 'buffet',
      caption: 'Hot chafing dish spread with curries, biryanis & freshly baked breads'
    },
    {
      url: '/assets/Live Chaat Station.jpg',
      fallback: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=800&q=80',
      title: 'Crispy Medu Vada & Idly Station',
      category: 'live',
      caption: 'Golden medu vadas & soft idlys served piping hot with 3 chutneys'
    },
    {
      url: '/assets/Beverage Bar Setup.jpg',
      fallback: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&w=800&q=80',
      title: 'Licensed Bar & Drinks Counter',
      category: 'bar',
      caption: 'Draft Cobra & Peroni beer, single malt whiskeys, fine wines & fresh lassis'
    },
    {
      url: '/assets/Executive Thali Lunches.jpg',
      fallback: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=800&q=80',
      title: 'Corporate Gala Feast',
      category: 'buffet',
      caption: 'High-end multi-course dining for tech conferences & corporate annual galas'
    },
    {
      url: '/assets/Dessert Display.jpg',
      fallback: 'https://images.unsplash.com/photo-1587314168485-3236d6710814?auto=format&fit=crop&w=800&q=80',
      title: 'Artisanal Dessert Spread',
      category: 'bar',
      caption: 'Fresh Carrot Halwa, Gulab Jamun & Royal Falooda counters'
    }
  ];

  const filteredGallery = activeGalleryFilter === 'all'
    ? galleryImages
    : galleryImages.filter(img => img.category === activeGalleryFilter);

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-slate-900 font-sans pb-24 selection:bg-[#C39B54]/30">
      
      {/* 1. HERO BANNER SECTION WITH FULL BACKGROUND IMAGE */}
      <section
        className="relative overflow-hidden bg-cover bg-center bg-no-repeat text-white pt-8 pb-20 lg:pt-14 lg:pb-28 shadow-2xl"
        style={{
          backgroundImage: `linear-gradient(to right, rgba(15, 38, 26, 0.94) 0%, rgba(30, 59, 43, 0.65) 100%), url('/assets/corporate_catering_hero.jpg')`,
        }}
      >
        {/* Decorative ambient background glows */}
        <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-[#C39B54]/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-10 w-[400px] h-[400px] bg-[#2E5E43]/30 rounded-full blur-3xl pointer-events-none" />
        
        {/* Subtle geometric pattern overlay */}
        <div className="absolute inset-0 bg-[radial-gradient(#C39B54_1px,transparent_1px)] [background-size:32px_32px] opacity-10 pointer-events-none" />

        <div className="max-w-screen-2xl mx-auto px-4 lg:px-8 xl:px-10 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-[#C39B54]/40 text-[#F3E5AB] text-xs sm:text-sm font-bold tracking-wide uppercase shadow-inner">
                <Sparkles className="w-4 h-4 text-[#C39B54]" />
                LONDON'S PREMIER CORPORATE CATERER
              </div>

              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-[1.15]">
                Corporate Catering & <span className="bg-gradient-to-r from-[#F5D77F] via-[#C39B54] to-[#E6B85C] bg-clip-text text-transparent">Live Station</span> Experiences
              </h1>

              <p className="text-base sm:text-lg text-emerald-100/90 max-w-2xl font-normal leading-relaxed">
                Elevate your corporate galas, office team lunches, tech summits, and VIP events with London’s finest South Indian cuisine, famous live 4ft Jumbo Dosa stations, artisanal curries, and full licensed bar services.
              </p>

              {/* Key Features Badges */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
                <div className="flex items-center gap-2 bg-white/10 border border-white/15 rounded-xl p-3 backdrop-blur-md">
                  <Flame className="w-5 h-5 text-[#C39B54] flex-shrink-0" />
                  <span className="text-xs font-semibold text-white">Live Cooking Stations</span>
                </div>
                <div className="flex items-center gap-2 bg-white/10 border border-white/15 rounded-xl p-3 backdrop-blur-md">
                  <Clock className="w-5 h-5 text-[#C39B54] flex-shrink-0" />
                  <span className="text-xs font-semibold text-white">3 Hours On-Site Service</span>
                </div>
                <div className="flex items-center gap-2 bg-white/10 border border-white/15 rounded-xl p-3 backdrop-blur-md col-span-2 sm:col-span-1">
                  <Users className="w-5 h-5 text-[#C39B54] flex-shrink-0" />
                  <span className="text-xs font-semibold text-white">Min. 10 Pax Per Order</span>
                </div>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row items-center gap-4 pt-4 justify-center lg:justify-start">
                <button
                  onClick={scrollToBookingForm}
                  className="w-full sm:w-auto px-8 py-4 rounded-xl bg-gradient-to-r from-[#C39B54] via-[#D4AF37] to-[#B8860B] text-[#0F261A] font-extrabold text-base shadow-xl hover:shadow-[#C39B54]/30 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-3 cursor-pointer"
                >
                  <Calendar className="w-5 h-5" />
                  Book Corporate Catering Now
                </button>

                <button
                  onClick={generateCorporateMenuPdf}
                  className="w-full sm:w-auto px-7 py-4 rounded-xl bg-white/10 backdrop-blur-md hover:bg-white/20 text-white font-bold text-base border border-white/20 hover:border-[#C39B54] transition-all duration-200 flex items-center justify-center gap-2.5 cursor-pointer"
                >
                  <Download className="w-5 h-5 text-[#C39B54]" />
                  Download Menu PDF
                </button>
              </div>
            </div>

            {/* Right Card / Visual Glassmorphism Showcase */}
            <div className="lg:col-span-5 flex justify-center lg:justify-end">
              <div className="relative w-full max-w-md bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-6 sm:p-8 text-white shadow-2xl space-y-6">
                
                {/* Logo Header Badge */}
                <div className="w-24 h-24 mx-auto rounded-full overflow-hidden border-4 border-[#C39B54]/60 shadow-xl bg-white">
                  <Image
                    src="/DOMEAL_Logo.png"
                    alt="DoMeal Corporate Catering"
                    width={96}
                    height={96}
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="text-center">
                  <h3 className="text-2xl font-black text-white">DoMeal Corporate</h3>
                  <p className="text-[#C39B54] text-xs font-bold uppercase tracking-widest mt-0.5">
                    Live Dosa & Event Catering
                  </p>
                </div>

                {/* Option 1 Brief */}
                <div
                  onClick={() => {
                    setSelectedPackage('live');
                    scrollToBookingForm();
                  }}
                  className="p-4 rounded-2xl bg-white/15 border border-[#C39B54]/60 relative overflow-hidden shadow-sm cursor-pointer hover:bg-white/25 transition-all"
                >
                  <div className="absolute top-0 right-0 bg-[#C39B54] text-[#0F261A] text-[9px] font-extrabold px-3 py-0.5 rounded-bl-lg uppercase tracking-wider">
                    Most Popular
                  </div>
                  <div className="text-sm font-bold text-white mb-0.5">With Live Dosa Station</div>
                  <div className="text-2xl font-black text-[#F5D77F]">£{config.liveDosaPrice.toFixed(2)} <span className="text-xs font-normal text-emerald-200">/ per person</span></div>
                  <p className="text-xs text-emerald-100/90 mt-1">Includes {config.serviceDuration || '3 hrs live preparation of 4ft Jumbo Dosa, Medu Vada & Idly on-site'}.</p>
                </div>

                {/* Option 2 Brief */}
                <div
                  onClick={() => {
                    setSelectedPackage('standard');
                    scrollToBookingForm();
                  }}
                  className="p-4 rounded-2xl bg-white/10 border border-white/15 cursor-pointer hover:bg-white/20 transition-all"
                >
                  <div className="text-sm font-bold text-white mb-0.5">Without Live Dosa</div>
                  <div className="text-2xl font-black text-white">£{config.standardBuffetPrice.toFixed(2)} <span className="text-xs font-normal text-emerald-200">/ per person</span></div>
                  <p className="text-xs text-emerald-100/90 mt-1">Premium hot buffet arrangement setup with chafing dish warmers.</p>
                </div>

                <div className="pt-1 text-center border-t border-white/10">
                  <div className="text-xs text-emerald-200/90 font-semibold flex items-center justify-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-[#C39B54]" />
                    Minimum requirement: {config.minPax} pax per order
                  </div>
                </div>

                {/* Floating Badge */}
                <div className="absolute -top-3 -right-3 bg-[#C39B54] text-[#0F261A] font-black rounded-2xl shadow-xl px-3 py-1.5 text-center border-2 border-yellow-300 text-xs tracking-wide">
                  ⭐ 5-Star Rated
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>


      {/* 2. BODY CONTENT SECTION - WHY CHOOSE US & OVERVIEW */}
      <section className="py-16 lg:py-24 max-w-screen-2xl mx-auto px-4 lg:px-8 xl:px-10">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <h2 className="text-xs font-bold text-[#C39B54] uppercase tracking-widest">WHY CORPORATE CLIENTS TRUST US</h2>
          <h3 className="text-3xl sm:text-4xl font-black text-slate-900">
            Unrivalled Quality, Punctuality & Culinary Artistry
          </h3>
          <p className="text-base sm:text-lg text-slate-600 leading-relaxed">
            From executive boardroom lunches to company-wide gala celebrations, DoMeal delivers high-impact dining experiences designed for UK businesses.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {[
            {
              icon: ChefHat,
              title: 'Authentic Live Cooking',
              desc: 'Our master chefs prepare 4ft Jumbo Dosas and crispy Medu Vadas live at your event venue.'
            },
            {
              icon: ShieldCheck,
              title: '100% Quality & Hygiene',
              desc: '5-Star hygiene rated preparation using pure ingredients, cold-pressed oils, and fresh produce.'
            },
            {
              icon: Clock,
              title: 'Guaranteed Punctuality',
              desc: 'Seamless, on-time logistics & setup so your business schedule runs without interruption.'
            },
            {
              icon: HeartHandshake,
              title: 'Dietary Accommodation',
              desc: 'Clear allergen labelling, Jain-friendly options, Vegan choices, and customized menus.'
            }
          ].map((item, idx) => (
            <div key={idx} className="bg-white rounded-3xl p-7 border border-slate-200/80 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <div className="w-14 h-14 rounded-2xl bg-[#1E3B2B]/10 text-[#1E3B2B] flex items-center justify-center mb-6">
                <item.icon className="w-7 h-7" />
              </div>
              <h4 className="text-xl font-bold text-slate-900 mb-3">{item.title}</h4>
              <p className="text-sm text-slate-600 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>








      {/* 4. OFFICIAL MENU CATALOG & PDF DOWNLOAD */}
      <section className="py-14 max-w-screen-2xl mx-auto px-4 lg:px-8 xl:px-10 border-t border-slate-200/60">
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <h2 className="text-xs font-bold text-[#C39B54] uppercase tracking-widest">OFFICIAL MENU CATALOG</h2>
          <h3 className="text-3xl sm:text-4xl font-black text-slate-900">
            Explore Our Corporate Catering Menu & PDF
          </h3>
          <p className="text-slate-600">
            Download our complete officially formatted business PDF document with full item catalog & package details.
          </p>

          <div className="pt-4 flex justify-center">
            <button
              onClick={generateCorporateMenuPdf}
              className="px-8 py-4 rounded-xl bg-gradient-to-r from-[#1E3B2B] to-[#0F261A] text-white font-extrabold text-sm shadow-xl hover:shadow-emerald-900/30 flex items-center gap-3 cursor-pointer hover:scale-[1.02] transition-all"
            >
              <Download className="w-5 h-5 text-[#C39B54]" />
              Download Complete Corporate Menu PDF
            </button>
          </div>
        </div>
      </section>


      {/* 5. BOOKING FORM & REAL-TIME PRICE ESTIMATOR */}
      <section id="booking-section" className="py-16 bg-[#1E3B2B] text-white">
        <div className="max-w-screen-2xl mx-auto px-4 lg:px-8 xl:px-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            
            {/* Left Info & Calculator Summary */}
            <div className="lg:col-span-5 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#C39B54]/20 border border-[#C39B54] text-[#F5D77F] text-xs font-bold tracking-wider uppercase">
                INSTANT PRICE ESTIMATOR
              </div>

              <h3 className="text-3xl sm:text-4xl font-black text-white leading-tight">
                Calculate & Book Your Corporate Catering
              </h3>

              <p className="text-emerald-100/80 text-sm sm:text-base leading-relaxed">
                Select your package options, pax count, and dish preferences for an instant estimate. Our corporate team will confirm availability within 2 business hours.
              </p>

              {/* Package Selection Buttons */}
              <div className="space-y-3 pt-2">
                <label className="text-xs font-bold text-[#F5D77F] uppercase tracking-wider">Select Package Format</label>
                
                <div
                  onClick={() => setSelectedPackage('live')}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                    selectedPackage === 'live'
                      ? 'bg-white/15 border-[#C39B54] shadow-lg ring-2 ring-[#C39B54]/50'
                      : 'bg-white/5 border-white/10 hover:bg-white/10'
                  }`}
                >
                  <div>
                    <div className="font-bold text-white text-base">With Live Dosa Station</div>
                    <div className="text-xs text-emerald-200">3 Hours Live Serving (4ft Jumbo Dosa, Medu Vada, Idly)</div>
                  </div>
                  <div className="text-xl font-extrabold text-[#F5D77F]">£29.99 <span className="text-xs text-white/70 font-normal">/pp</span></div>
                </div>

                <div
                  onClick={() => setSelectedPackage('standard')}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                    selectedPackage === 'standard'
                      ? 'bg-white/15 border-[#C39B54] shadow-lg ring-2 ring-[#C39B54]/50'
                      : 'bg-white/5 border-white/10 hover:bg-white/10'
                  }`}
                >
                  <div>
                    <div className="font-bold text-white text-base">Without Live Dosa</div>
                    <div className="text-xs text-emerald-200">Premium Hot Buffet Setup with Chafing Dishes</div>
                  </div>
                  <div className="text-xl font-extrabold text-white">£24.99 <span className="text-xs text-white/70 font-normal">/pp</span></div>
                </div>
              </div>



              {/* Download PDF Menu Button */}
              <button
                type="button"
                onClick={generateCorporateMenuPdf}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#C39B54] via-[#D4AF37] to-[#B8860B] text-[#0F261A] font-extrabold text-base shadow-2xl hover:shadow-[#C39B54]/30 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-3 cursor-pointer"
              >
                <Download className="w-5 h-5 text-[#0F261A]" />
                <span>Download Complete Menu PDF</span>
              </button>
            </div>

            {/* Right Booking Form */}
            <div className="lg:col-span-7 bg-white text-slate-900 rounded-3xl p-6 sm:p-10 shadow-2xl border border-slate-200">
              {bookingSuccess ? (
                <div className="text-center py-12 space-y-6">
                  <div className="w-20 h-20 rounded-full bg-emerald-100 text-[#1E3B2B] flex items-center justify-center mx-auto shadow-inner">
                    <CheckCircle2 className="w-10 h-10" />
                  </div>
                  <h4 className="text-3xl font-extrabold text-slate-900">Inquiry Submitted Successfully!</h4>
                  <p className="text-slate-600 max-w-md mx-auto text-sm leading-relaxed">
                    Thank you, <span className="font-bold text-slate-900">{contactName}</span> from <span className="font-bold text-slate-900">{companyName}</span>. Your request for <span className="font-bold text-slate-900">{paxCount} pax</span> on <span className="font-bold text-slate-900">{eventDate}</span> has been assigned to our corporate catering manager.
                  </p>
                  <div className="pt-4">
                    <button
                      onClick={() => setBookingSuccess(false)}
                      className="px-6 py-3 rounded-xl bg-[#1E3B2B] text-white font-bold text-sm hover:bg-[#0F261A] transition-all"
                    >
                      Submit Another Booking Inquiry
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleBookingSubmit} className="space-y-6">
                  <div className="border-b border-slate-200 pb-4">
                    <h4 className="text-xl font-extrabold text-slate-900">Corporate Booking Inquiry Form</h4>
                    <p className="text-xs text-slate-500">Fill in your event details for quick quotation confirmation.</p>
                  </div>

                  {/* Company & Contact */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                        <Building className="w-3.5 h-3.5 text-[#C39B54]" />
                        Company / Organization Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                        placeholder="e.g. Acme Tech UK Ltd"
                        className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#1E3B2B] focus:outline-none text-sm"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5 text-[#C39B54]" />
                        Contact Person Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={contactName}
                        onChange={(e) => setContactName(e.target.value)}
                        placeholder="Full Name"
                        className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#1E3B2B] focus:outline-none text-sm"
                      />
                    </div>
                  </div>

                  {/* Email & Phone */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5 text-[#C39B54]" />
                        Corporate Email *
                      </label>
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="name@company.com"
                        className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#1E3B2B] focus:outline-none text-sm"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-[#C39B54]" />
                        Phone Number *
                      </label>
                      <input
                        type="tel"
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+44 7000 000000"
                        className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#1E3B2B] focus:outline-none text-sm"
                      />
                    </div>
                  </div>

                  {/* Number of Employees */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-[#C39B54]" />
                      Number of Employees / Guests (Pax) *
                    </label>
                    <input
                      type="number"
                      min={10}
                      required
                      value={paxCount}
                      onChange={(e) => setPaxCount(e.target.value)}
                      placeholder="e.g. 10 (Minimum 10 required)"
                      className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#1E3B2B] focus:outline-none text-sm font-600"
                    />
                  </div>

                  {/* Event Date, Time & Venue */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-[#C39B54]" />
                        Event Date *
                      </label>
                      <input
                        type="date"
                        required
                        value={eventDate}
                        onChange={(e) => setEventDate(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#1E3B2B] focus:outline-none text-sm"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-[#C39B54]" />
                        Serving Time
                      </label>
                      <input
                        type="time"
                        value={eventTime}
                        onChange={(e) => setEventTime(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#1E3B2B] focus:outline-none text-sm"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-[#C39B54]" />
                        Postcode / Location
                      </label>
                      <input
                        type="text"
                        value={eventLocation}
                        onChange={(e) => setEventLocation(e.target.value)}
                        placeholder="e.g. EC1A 1BB"
                        className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#1E3B2B] focus:outline-none text-sm"
                      />
                    </div>
                  </div>

                  {/* Special Requirements */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">Special Dietary Requirements or Notes</label>
                    <textarea
                      rows={3}
                      value={specialNotes}
                      onChange={(e) => setSpecialNotes(e.target.value)}
                      placeholder="Mention any vegan preferences, Jain food requirements, bar add-ons, or custom setup notes..."
                      className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#1E3B2B] focus:outline-none text-sm"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-4 rounded-xl bg-[#1E3B2B] hover:bg-[#0F261A] text-white font-extrabold text-base shadow-xl hover:shadow-emerald-900/30 transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {isSubmitting ? (
                      <span>Processing Inquiry...</span>
                    ) : (
                      <>
                        <span>Submit Corporate Inquiry</span>
                        <ChevronRight className="w-5 h-5" />
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>

          </div>
        </div>
      </section>


      {/* 6. EVENT GALLERY SECTION */}
      <section className="py-16 max-w-screen-2xl mx-auto px-4 lg:px-8 xl:px-10">
        <div className="text-center max-w-3xl mx-auto mb-12 space-y-4">
          <h2 className="text-xs font-bold text-[#C39B54] uppercase tracking-widest">EVENT GALLERY</h2>
          <h3 className="text-3xl sm:text-4xl font-black text-slate-900">
            Corporate Events & Live Stations in Action
          </h3>
          <p className="text-slate-600">
            Take a glance at our corporate setups, live cooking counters, and executive dining arrays.
          </p>

          {/* Gallery Filter Tabs */}
          <div className="flex justify-center gap-2 pt-4 flex-wrap">
            {[
              { id: 'all', label: 'All Photos' },
              { id: 'live', label: 'Live Stations' },
              { id: 'buffet', label: 'Buffet Setups' },
              { id: 'bar', label: 'Drinks & Desserts' }
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setActiveGalleryFilter(f.id as any)}
                className={`px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer ${
                  activeGalleryFilter === f.id
                    ? 'bg-[#1E3B2B] text-white shadow-md'
                    : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-100'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Gallery Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredGallery.map((img, i) => (
            <div key={i} className="group relative bg-white rounded-3xl overflow-hidden shadow-md border border-slate-200/80 hover:shadow-2xl transition-all duration-300">
              <div className="relative h-64 w-full bg-slate-100 overflow-hidden">
                <Image
                  src={img.fallback}
                  alt={img.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-90 group-hover:opacity-95 transition-opacity" />
                <div className="absolute bottom-4 left-4 right-4 text-white">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#F5D77F] bg-black/40 backdrop-blur-md px-2.5 py-1 rounded-md">
                    {img.category}
                  </span>
                  <h4 className="text-lg font-extrabold text-white mt-1.5">{img.title}</h4>
                  <p className="text-xs text-white/80 line-clamp-1">{img.caption}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>


      {/* 7. CLIENT REVIEWS & TESTIMONIALS SECTION */}
      <section className="py-16 bg-[#F4F0EA] border-t border-slate-200/80">
        <div className="max-w-screen-2xl mx-auto px-4 lg:px-8 xl:px-10">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <h2 className="text-xs font-bold text-[#C39B54] uppercase tracking-widest">CORPORATE TESTIMONIALS</h2>
            <h3 className="text-3xl sm:text-4xl font-black text-slate-900">
              Trusted by Leading Companies across London
            </h3>
            <p className="text-slate-600">
              Here is what HR leads and event directors say about our corporate catering service.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                quote: 'The 4ft Jumbo Dosa live station was the absolute highlight of our company annual day! Fresh, piping hot, and served seamlessly to over 150 employees.',
                name: 'Rajesh Patel',
                role: 'Head of Workplace & HR',
                company: 'Fintech Solutions UK',
                stars: 5
              },
              {
                quote: 'Extremely professional corporate setup. The curries and biryanis were packed with authentic flavor, and the drinks station ran perfectly for our evening networking mixer.',
                name: 'Sarah Jenkins',
                role: 'Senior Event Producer',
                company: 'London Tech Summit',
                stars: 5
              },
              {
                quote: 'Punctual delivery, spotless chafing dish setup, and exceptional food quality. Having the PDF menu to share directly with our board members made approval super easy!',
                name: 'Vikram Sharma',
                role: 'Operations Director',
                company: 'Apex Global Consulting',
                stars: 5
              }
            ].map((rev, i) => (
              <div key={i} className="bg-white rounded-3xl p-8 border border-slate-200 shadow-lg flex flex-col justify-between space-y-6">
                <div className="space-y-4">
                  <div className="flex gap-1 text-amber-400">
                    {[...Array(rev.stars)].map((_, s) => (
                      <Star key={s} className="w-5 h-5 fill-amber-400" />
                    ))}
                  </div>
                  <p className="text-slate-700 italic text-sm leading-relaxed">
                    "{rev.quote}"
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center gap-3">
                  <div className="w-11 h-11 rounded-full bg-[#1E3B2B] text-[#F5D77F] flex items-center justify-center font-extrabold text-base">
                    {rev.name.charAt(0)}
                  </div>
                  <div>
                    <h5 className="font-extrabold text-slate-900 text-sm">{rev.name}</h5>
                    <p className="text-xs text-slate-500">{rev.role} • <span className="font-semibold text-[#1E3B2B]">{rev.company}</span></p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>


      {/* 8. POPUP BOOKING MODAL */}
      {isBookingModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl p-6 sm:p-8 max-h-[90vh] overflow-y-auto border border-slate-200">
            <button
              onClick={() => setIsBookingModalOpen(false)}
              className="absolute top-5 right-5 p-2 rounded-full hover:bg-slate-100 text-slate-500 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>

            <div className="mb-6">
              <h3 className="text-2xl font-black text-slate-900">Book Corporate Catering</h3>
              <p className="text-xs text-slate-500">Instant inquiry for live stations, office buffets & corporate events.</p>
            </div>

            <form onSubmit={handleBookingSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700">Company Name *</label>
                  <input
                    type="text"
                    required
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="Company Name"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-[#1E3B2B]"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700">Contact Person *</label>
                  <input
                    type="text"
                    required
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    placeholder="Contact Name"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-[#1E3B2B]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700">Corporate Email *</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="email@company.com"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-[#1E3B2B]"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700">Phone Number *</label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+44 7000 000000"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-[#1E3B2B]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700">Package Format</label>
                  <select
                    value={selectedPackage}
                    onChange={(e) => setSelectedPackage(e.target.value as any)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-[#1E3B2B]"
                  >
                    <option value="live">Live Dosa (£29.99 pp)</option>
                    <option value="standard">Standard Buffet (£24.99 pp)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700">Guest Count (Pax)</label>
                  <input
                    type="number"
                    min={50}
                    value={paxCount}
                    onChange={(e) => setPaxCount(Math.max(50, parseInt(e.target.value) || 50))}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-[#1E3B2B]"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700">Event Date *</label>
                  <input
                    type="date"
                    required
                    value={eventDate}
                    onChange={(e) => setEventDate(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-[#1E3B2B]"
                  />
                </div>
              </div>

              {/* Estimate Pill */}
              <div className="p-4 rounded-xl bg-slate-100 border border-slate-300 flex justify-between items-center">
                <span className="text-xs font-bold text-slate-700">Estimated Total Quote:</span>
                <span className="text-xl font-extrabold text-[#1E3B2B]">£{totalPrice}</span>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 rounded-xl bg-[#1E3B2B] text-white font-extrabold text-sm hover:bg-[#0F261A] transition-all cursor-pointer"
                >
                  {isSubmitting ? 'Submitting Inquiry...' : 'Confirm & Send Inquiry'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
