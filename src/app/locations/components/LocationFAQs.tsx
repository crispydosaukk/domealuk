'use client';

import React, { useState } from 'react';
import { LocationFAQ } from '@/lib/locations-data';
import { ChevronDown, HelpCircle, Mail, Phone } from 'lucide-react';

interface LocationFAQsProps {
  locationName: string;
  faqs: LocationFAQ[];
  title?: string;
  badge?: string;
  subtitle?: string;
}

export default function LocationFAQs({ locationName, faqs, title, badge, subtitle }: LocationFAQsProps) {
  // Initialized to null so all questions are closed by default
  const [openIdx, setOpenIdx] = useState<number | null>(null);

  const toggle = (idx: number) => {
    setOpenIdx((prev) => (prev === idx ? null : idx));
  };

  return (
    <section className="py-16 lg:py-24 bg-white font-sans">
      <div className="max-w-4xl mx-auto px-4 lg:px-8">
        <div className="text-center mb-12 space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#142A1E]/10 text-[#142A1E] text-xs font-black uppercase tracking-widest border border-[#142A1E]/15">
            <HelpCircle size={13} className="text-[#C39B54]" />
            <span>{badge || 'Local Questions & Answers'}</span>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#142A1E] tracking-tight leading-[1.15] font-sans">
            {title || `${locationName} Tiffin Delivery FAQs`}
          </h2>
          <p className="text-stone-600 text-sm max-w-xl mx-auto leading-relaxed">
            {subtitle ||
              `Everything you need to know about our home-cooked meal subscriptions, delivery days, and reusable packaging in ${locationName}.`}
          </p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => {
            const isOpen = openIdx === idx;
            return (
              <div
                key={idx}
                className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
                  isOpen
                    ? 'border-[#142A1E] bg-[#FAF7F2] shadow-sm ring-1 ring-[#142A1E]/10'
                    : 'border-stone-200 bg-white hover:border-stone-300'
                }`}
              >
                <button
                  type="button"
                  onClick={() => toggle(idx)}
                  aria-expanded={isOpen}
                  aria-controls={`faq-answer-${idx}`}
                  className="w-full flex items-center justify-between p-5 sm:p-6 text-left cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#142A1E]"
                >
                  <span className="font-sans font-bold text-base sm:text-lg text-stone-900 pr-4 leading-snug">
                    {faq.question}
                  </span>
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-transform duration-200 ${
                      isOpen ? 'bg-[#142A1E] text-[#C39B54] rotate-180 shadow-sm' : 'bg-stone-100 text-stone-500'
                    }`}
                  >
                    <ChevronDown size={16} />
                  </div>
                </button>

                {isOpen && (
                  <div
                    id={`faq-answer-${idx}`}
                    className="px-5 pb-6 sm:px-6 text-stone-700 text-sm leading-relaxed border-t border-stone-200/60 pt-3"
                  >
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Highly Visible Support Contact Box */}
        <div className="mt-10 p-6 rounded-2xl bg-[#FAF7F2] border border-stone-200 text-center shadow-xs">
          <p className="font-bold text-stone-900 text-sm sm:text-base mb-3">
            Have a question about a specific address or concierge in {locationName}?
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 text-xs sm:text-sm font-bold">
            <a
              href="mailto:support@domeal.co.uk"
              className="inline-flex items-center gap-2 bg-white text-[#142A1E] border border-stone-300 hover:border-[#142A1E] px-4 py-2 rounded-xl transition-all shadow-2xs"
            >
              <Mail size={15} className="text-[#C39B54]" />
              <span>support@domeal.co.uk</span>
            </a>
            <a
              href="tel:+442079460912"
              className="inline-flex items-center gap-2 bg-white text-[#142A1E] border border-stone-300 hover:border-[#142A1E] px-4 py-2 rounded-xl transition-all shadow-2xs"
            >
              <Phone size={15} className="text-[#C39B54]" />
              <span>+44 20 7946 0912</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
