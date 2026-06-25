import React from 'react';
import Link from 'next/link';
import { Check, Star } from 'lucide-react';

const plans = [
  {
    id: 'plan-breakfast',
    name: 'Breakfast Plan',
    price: 45,
    period: 'month',
    desc: 'Fresh morning tiffin delivered daily. Perfect for working professionals.',
    meals: '30 breakfasts/month',
    features: ['Idli, Dosa, Pongal rotation', 'Sambar + 2 chutneys', 'Delivered by 8:30 AM', 'Skip days anytime', 'Free delivery'],
    highlight: false,
    badge: null,
  },
  {
    id: 'plan-full',
    name: 'Full Day Meals',
    price: 105,
    period: 'month',
    desc: 'Complete nutrition — Breakfast + Lunch + Dinner. Best value for families.',
    meals: '3 meals × 30 days',
    features: ['All 3 meal slots', 'Varied daily menu', '100% Vegan and Vegetarian', 'Priority delivery', 'Free delivery', 'Monthly recipe booklet'],
    highlight: true,
    badge: 'Most Popular',
  },
  {
    id: 'plan-lunch',
    name: 'Lunch + Dinner',
    price: 75,
    period: 'month',
    desc: 'Full meals plan for those who manage their own breakfast.',
    meals: '60 meals/month',
    features: ['Thali + chapati rotation', 'Dal, sabzi, raita', 'Delivered on time', 'Pause anytime', 'Free delivery'],
    highlight: false,
    badge: null,
  },
];

export default function PlansSection() {
  return (
    <section id="plans" className="py-16 lg:py-20 bg-background">
      <div className="max-w-screen-2xl mx-auto px-4 lg:px-8 xl:px-10">
        <div className="text-center mb-12">
          <span className="inline-block text-xs font-700 uppercase tracking-widest text-primary bg-blue-50 px-3 py-1.5 rounded-full mb-3">
            Subscription Plans
          </span>
          <h2 className="text-3xl lg:text-4xl font-extrabold text-foreground mb-3">
            Pick Your Meal Plan
          </h2>
          <p className="text-muted-foreground max-w-lg mx-auto">
            Flexible monthly subscriptions. Cancel or pause anytime. No commitment required.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {plans?.map((plan) => (
            <div
              key={plan?.id}
              className={`relative rounded-2xl p-6 border-2 transition-all duration-200 ${
                plan?.highlight
                  ? 'border-primary bg-gradient-to-b from-blue-50 to-background shadow-xl shadow-blue-100'
                  : 'border-border bg-white hover:border-primary/30 hover:shadow-md'
              }`}
            >
              {plan?.badge && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                  <span className="inline-flex items-center gap-1 bg-primary text-white text-xs font-700 px-3 py-1 rounded-full shadow-md">
                    <Star size={10} className="fill-white" />
                    {plan?.badge}
                  </span>
                </div>
              )}

              <h3 className="font-800 text-lg text-foreground mb-1">{plan?.name}</h3>
              <p className="text-xs text-muted-foreground mb-4 leading-relaxed">{plan?.desc}</p>

              <div className="mb-2">
                <span className="text-3xl font-extrabold text-foreground tabular-nums">£{plan?.price}</span>
                <span className="text-sm text-muted-foreground">/{plan?.period}</span>
              </div>
              <p className="text-xs text-primary font-600 mb-5">{plan?.meals}</p>

              <ul className="space-y-2 mb-6">
                {plan?.features?.map((f) => (
                  <li key={`${plan?.id}-${f}`} className="flex items-center gap-2 text-sm text-foreground">
                    <Check size={14} className="text-green-600 shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>

              <Link
                href="/sign-up-login-screen"
                className={`block text-center font-700 py-3 rounded-xl transition-all duration-150 active:scale-95 ${
                  plan?.highlight
                    ? 'bg-secondary text-white hover:bg-yellow-700 shadow-md shadow-yellow-200'
                    : 'bg-primary text-white hover:bg-[#1E3B2B]'
                }`}
              >
                Subscribe Now
              </Link>
            </div>
          ))}
        </div>

        <p className="text-center text-xs text-muted-foreground mt-6">
          All plans include free delivery. Cancel anytime with 3 days notice. VAT included in price.
        </p>
      </div>
    </section>
  );
}