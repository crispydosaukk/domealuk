'use client';
import React, { useState, useEffect, useMemo } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';
import { getApiUrl } from '@/lib/api';

export interface FAQItem {
  question: string;
  answer: string;
  category?: string;
}

const DEFAULT_FAQS: FAQItem[] = [
  {
    category: 'About DoMeal',
    question: 'What is DoMeal?',
    answer:
      'DoMeal is a meal delivery concept designed to bring the comfort of Indian cooking straight to your doorstep. Our aim is to make enjoying delicious, satisfying meals easier, without the shopping, chopping or cooking.',
  },
  {
    category: 'About DoMeal',
    question: 'How does DoMeal work?',
    answer:
      "Simply explore our available menus, select your preferred meal plan or order, enter your delivery details and complete checkout. We'll prepare your food and arrange delivery according to your confirmed order.",
  },
  {
    category: 'About DoMeal',
    question: 'Is DoMeal a takeaway or a meal kit?',
    answer:
      'DoMeal is designed around ready-prepared meals rather than ingredients you have to cook from scratch. Just follow the instructions provided with your meal to enjoy it.',
  },
  {
    category: 'About DoMeal',
    question: 'What makes DoMeal different from ordinary takeaways?',
    answer:
      'DoMeal aims to offer the convenience of delivered food with the comfort of thoughtfully prepared Indian meals, making it easier to plan regular lunches and dinners.',
  },
  {
    category: 'About DoMeal',
    question: 'Are DoMeal meals vegetarian?',
    answer:
      'Our menu will clearly identify vegetarian options and any other dietary categories available. Please check individual meal descriptions before ordering.',
  },
  {
    category: 'Meals and Menus',
    question: 'What comes with a DoMeal meal?',
    answer:
      'Each meal or meal package will have a description showing the dishes included, portion information and any available extras.',
  },
  {
    category: 'Meals and Menus',
    question: 'Does the menu change every week?',
    answer:
      "Where rotating menus are offered, upcoming dishes will be displayed in advance so you can see what's available before placing or confirming an order.",
  },
  {
    category: 'Meals and Menus',
    question: 'Can I choose my own dishes?',
    answer:
      'You can choose from the meal combinations and customisation options offered on the website. Some set meals may have a fixed selection of dishes.',
  },
  {
    category: 'Meals and Menus',
    question: 'How many people does each meal serve?',
    answer:
      'Portion information will be shown alongside each meal or package, helping you choose the right quantity for yourself, your family or your guests.',
  },
  {
    category: 'Meals and Menus',
    question: 'Can I add extras to my meal?',
    answer:
      'Available sides, breads, snacks, desserts and other extras will be shown when ordering.',
  },
  {
    category: 'Delivery and Food Storage',
    question: 'Where does DoMeal deliver?',
    answer:
      'Enter your postcode on our website to check whether delivery is available in your area. Delivery coverage may vary depending on the service and order type.',
  },
  {
    category: 'Delivery and Food Storage',
    question: 'When will my food arrive?',
    answer:
      'Available delivery dates and any applicable delivery windows will be shown during ordering or in your confirmation.',
  },
  {
    category: 'Delivery and Food Storage',
    question: "What if I'm not home when my order arrives?",
    answer:
      'Please follow the delivery instructions provided with your order. For food-safety reasons, we cannot guarantee that perishable food can be left unattended.',
  },
  {
    category: 'Delivery and Food Storage',
    question: 'Will my food arrive hot or chilled?',
    answer:
      'Your order information will specify the applicable delivery format. Please follow the storage and serving instructions supplied with your food.',
  },
  {
    category: 'Delivery and Food Storage',
    question: 'How should I store my DoMeal food?',
    answer:
      'Follow the storage instructions and use-by information provided with each order. Food requiring refrigeration should be refrigerated promptly and kept at the stated temperature.',
  },
  {
    category: 'Delivery and Food Storage',
    question: 'How do I reheat my meals?',
    answer:
      'Follow the reheating instructions provided with your order. Ensure food is thoroughly reheated, piping hot throughout, and do not reheat it more than once.',
  },
  {
    category: 'Plans, Payments and Changes',
    question: 'Do I need a subscription to order DoMeal?',
    answer:
      'Available ordering options, including any one-off purchases or subscription plans, will be clearly displayed before checkout.',
  },
  {
    category: 'Plans, Payments and Changes',
    question: 'Can I pause, skip or cancel a subscription?',
    answer:
      'If subscription plans are offered, the applicable pause, skip, cancellation and cut-off rules will be displayed in your account and subscription terms.',
  },
  {
    category: 'Plans, Payments and Changes',
    question: 'How much does DoMeal cost?',
    answer:
      'Current meal prices, delivery charges and any applicable extras will be shown before you confirm payment.',
  },
  {
    category: 'Plans, Payments and Changes',
    question: 'Can I change or cancel an order?',
    answer:
      'Please contact us as soon as possible if you need to change an order. Whether changes or cancellation are possible depends on the order status and applicable terms.',
  },
  {
    category: 'Allergens and Special Requirements',
    question: 'Do your meals contain allergens?',
    answer:
      'Some dishes may contain allergens such as milk, nuts, peanuts, sesame, wheat or other ingredients. Please review the allergen information and contact us before ordering if you have an allergy.',
  },
  {
    category: 'Allergens and Special Requirements',
    question: 'Can you guarantee allergen-free meals?',
    answer:
      "In addition to the recipe-specific allergen information provided for each Domeal dish in our emails, we'd like to alert you to the fact that the kitchen we use for production and packing may also contain low levels of the following allergens: Soya, Nuts, Peanuts, Sesame, Gluten, Sulphates and Mustard.\n\nAllergen information is available on request. If you need to update us of any changes to your allergen or dietary requirements, please email us at orders@domeal.co.uk",
  },
  {
    category: 'Packaging, Catering and Support',
    question: 'Does DoMeal use reusable or recyclable packaging?',
    answer:
      'Packaging information will be provided according to the materials used for each service. Please follow any applicable recycling or return instructions.',
  },
  {
    category: 'Packaging, Catering and Support',
    question: 'Can I order meals for my office or a group?',
    answer:
      'DoMeal may accommodate group and corporate catering enquiries, subject to availability, quantities, location and advance notice. Contact our team to discuss your requirements.',
  },
  {
    category: 'Packaging, Catering and Support',
    question: 'What if something is wrong with my order?',
    answer:
      "Please contact customer support promptly with your order number and details of the issue. We'll review the concern and explain the available resolution.",
  },
  {
    category: 'Packaging, Catering and Support',
    question: 'How can I contact DoMeal?',
    answer:
      'You can reach us through the contact details published on the DoMeal website for questions about orders, delivery, dietary requirements and customer support.',
  },
];

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [settings, setSettings] = useState<{
    faqBadge: string;
    faqTitle: string;
    faqDesc: string;
    faqsList: FAQItem[];
  }>({
    faqBadge: 'FAQs',
    faqTitle: "Questions?\nWe've got answers.",
    faqDesc:
      "Everything you need to know about DoMeal tiffin delivery in London. Can't find your answer?",
    faqsList: DEFAULT_FAQS,
  });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch(getApiUrl('/api/public-settings'), { method: 'POST' });
        if (res.ok) {
          const data = await res.json();
          setSettings((prev) => ({
            ...prev,
            ...data,
            faqsList:
              data.faqsList && data.faqsList.length > 0 ? data.faqsList : prev.faqsList,
          }));
        }
      } catch (error) {}
    };
    fetchSettings();
  }, []);

  const categories = useMemo(() => {
    const list = settings.faqsList || [];
    const unique = Array.from(
      new Set(list.map((item) => item.category?.trim()).filter(Boolean) as string[])
    );
    return unique.length > 1 ? ['All', ...unique] : [];
  }, [settings.faqsList]);

  const filteredFaqs = useMemo(() => {
    const list = settings.faqsList || [];
    if (!activeCategory || activeCategory === 'All') return list;
    return list.filter((item) => item.category?.trim() === activeCategory);
  }, [settings.faqsList, activeCategory]);

  const toggle = (idx: number) => setOpenIndex((prev) => (prev === idx ? null : idx));

  return (
    <section id="faq" className="py-16 lg:py-20 bg-background">
      <div className="max-w-screen-2xl mx-auto px-4 lg:px-8 xl:px-10">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 items-start">
          {/* Left sticky header */}
          <div className="lg:col-span-2 lg:sticky lg:top-24">
            <div className="inline-flex items-center gap-2 bg-blue-50 text-primary text-xs font-700 px-3 py-1.5 rounded-full mb-4">
              <HelpCircle size={12} />
              {settings.faqBadge}
            </div>
            <h2 className="text-3xl lg:text-4xl font-extrabold text-foreground mb-4 leading-tight">
              {settings.faqTitle.split('\n').map((line, i) => (
                <React.Fragment key={i}>
                  {i === 1 ? <span className="text-primary">{line}</span> : line}
                  {i < settings.faqTitle.split('\n').length - 1 && <br />}
                </React.Fragment>
              ))}
            </h2>
            <p className="text-muted-foreground text-sm leading-relaxed mb-6">{settings.faqDesc}</p>
            <a
              href="mailto:orders@domeal.co.uk"
              className="inline-flex items-center gap-2 bg-primary text-white font-700 px-5 py-3 rounded-xl hover:bg-[#1E3B2B] transition-all active:scale-95 text-sm"
            >
              Contact Us
            </a>
          </div>

          {/* Right: categories & accordion */}
          <div className="lg:col-span-3 space-y-4">
            {categories.length > 0 && (
              <div className="relative">
                {/* Horizontal scroll on mobile, flex-wrap on tablet/desktop */}
                <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0 -mx-4 px-4 sm:mx-0 sm:px-0 sm:flex-wrap [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                  {categories.map((cat) => {
                    const isActive = activeCategory === cat;
                    const count =
                      cat === 'All'
                        ? settings.faqsList.length
                        : settings.faqsList.filter((f) => f.category?.trim() === cat).length;
                    return (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => {
                          setActiveCategory(cat);
                          setOpenIndex(null);
                        }}
                        className={`shrink-0 inline-flex items-center gap-1.5 text-xs sm:text-sm px-4 py-2 rounded-full font-600 sm:font-700 transition-all cursor-pointer ${
                          isActive
                            ? 'bg-[#1e3b2b] text-white shadow-sm'
                            : 'bg-white text-gray-700 border border-gray-300 hover:border-[#1e3b2b] hover:text-[#1e3b2b] shadow-xs'
                        }`}
                      >
                        <span>{cat}</span>
                        <span className={`text-[11px] ${isActive ? 'text-white/80' : 'text-gray-500'}`}>
                          ({count})
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Accordion list */}
            <div className="space-y-3">
              {filteredFaqs.map((faq, idx) => {
                const isOpen = openIndex === idx;
                return (
                  <div
                    key={`${activeCategory}-${idx}`}
                    className={`rounded-2xl border-2 transition-all duration-200 overflow-hidden ${
                      isOpen
                        ? 'border-primary bg-blue-50'
                        : 'border-border bg-white hover:border-primary/30'
                    }`}
                  >
                    <button
                      onClick={() => toggle(idx)}
                      className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left cursor-pointer"
                    >
                      <span
                        className={`text-sm font-700 leading-snug ${isOpen ? 'text-primary' : 'text-foreground'}`}
                      >
                        {faq.question}
                      </span>
                      <ChevronDown
                        size={18}
                        className={`shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180 text-primary' : 'text-muted-foreground'}`}
                      />
                    </button>
                    {isOpen && (
                      <div className="px-5 pb-5 animate-in fade-in duration-200">
                        <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                          {faq.answer}
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
