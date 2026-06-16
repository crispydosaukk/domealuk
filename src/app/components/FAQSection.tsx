'use client';
import React, { useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';

const faqs = [
  {
    id: 'faq-1',
    question: 'What areas in London do you deliver to?',
    answer: 'We currently deliver across East London (E1–E18), North London (N1, N4, N5, N7, N16), South East London (SE1–SE17), South West London (SW1–SW11), West London, Central London (WC1, WC2), City of London (EC1–EC4), Ilford (IG1–IG6), and Romford (RM1–RM3). Use our postcode checker above to confirm your area.',
  },
  {
    id: 'faq-2',
    question: 'What time do you deliver?',
    answer: 'We offer three delivery slots: Breakfast (7:30 AM – 8:30 AM), Lunch (12:00 PM – 1:00 PM), and Dinner (7:30 PM – 8:30 PM). You can choose your preferred slot when placing your order.',
  },
  {
    id: 'faq-3',
    question: 'Is the food 100% vegetarian?',
    answer: 'Yes! All our food is 100% pure vegetarian. We also offer a No Onion–No Garlic option for those who follow a Jain or Sattvic diet. Just select the option when ordering.',
  },
  {
    id: 'faq-4',
    question: 'How do I subscribe to a meal plan?',
    answer: 'Simply create an account, choose your preferred plan (Breakfast, Lunch + Dinner, or Full Day Meals), select your delivery slot, and complete payment. Your subscription starts the next working day.',
  },
  {
    id: 'faq-5',
    question: 'Can I pause or cancel my subscription?',
    answer: 'Absolutely. You can pause your subscription anytime with 24 hours notice, or cancel with 3 days notice. There are no cancellation fees. Manage everything from your account dashboard.',
  },
  {
    id: 'faq-6',
    question: 'What is your pricing and currency?',
    answer: 'All our prices are in British Pounds (£). Our plans start from £45/month for the Breakfast Plan, £75/month for Lunch + Dinner, and £105/month for Full Day Meals. Individual orders are also available.',
  },
  {
    id: 'faq-7',
    question: 'How is the food packaged?',
    answer: 'We use eco-friendly, food-safe containers. Tiffin boxes are sealed to maintain freshness and temperature during delivery. All packaging is recyclable.',
  },
  {
    id: 'faq-8',
    question: 'What if I have allergies or dietary requirements?',
    answer: 'Please mention your dietary requirements in the special instructions when placing your order. We handle common allergens carefully, but our kitchen does use nuts, dairy, and gluten. Contact us directly for severe allergies.',
  },
];

export default function FAQSection() {
  const [openId, setOpenId] = useState<string | null>('faq-1');

  const toggle = (id: string) => setOpenId(prev => prev === id ? null : id);

  return (
    <section id="faq" className="py-16 lg:py-20 bg-background">
      <div className="max-w-screen-2xl mx-auto px-4 lg:px-8 xl:px-10">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 items-start">
          {/* Left sticky header */}
          <div className="lg:col-span-2 lg:sticky lg:top-24">
            <div className="inline-flex items-center gap-2 bg-blue-50 text-primary text-xs font-700 px-3 py-1.5 rounded-full mb-4">
              <HelpCircle size={12} />
              FAQs
            </div>
            <h2 className="text-3xl lg:text-4xl font-extrabold text-foreground mb-4 leading-tight">
              Questions?<br />
              <span className="text-primary">We&apos;ve got answers.</span>
            </h2>
            <p className="text-muted-foreground text-sm leading-relaxed mb-6">
              Everything you need to know about DoMeal tiffin delivery in London. Can&apos;t find your answer?
            </p>
            <a
              href="mailto:orders@domeal.co.uk"
              className="inline-flex items-center gap-2 bg-primary text-white font-700 px-5 py-3 rounded-xl hover:bg-[#1E3B2B] transition-all active:scale-95 text-sm"
            >
              Contact Us
            </a>
          </div>

          {/* Right: accordion */}
          <div className="lg:col-span-3 space-y-3">
            {faqs.map((faq) => {
              const isOpen = openId === faq.id;
              return (
                <div
                  key={faq.id}
                  className={`rounded-2xl border-2 transition-all duration-200 overflow-hidden ${
                    isOpen ? 'border-primary bg-blue-50' : 'border-border bg-white hover:border-primary/30'
                  }`}
                >
                  <button
                    onClick={() => toggle(faq.id)}
                    className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left"
                  >
                    <span className={`text-sm font-700 leading-snug ${isOpen ? 'text-primary' : 'text-foreground'}`}>
                      {faq.question}
                    </span>
                    <ChevronDown
                      size={18}
                      className={`shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180 text-primary' : 'text-muted-foreground'}`}
                    />
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-5">
                      <p className="text-sm text-muted-foreground leading-relaxed">{faq.answer}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
