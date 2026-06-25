import React from 'react';
import { ShieldCheck, Clock, Leaf, Heart, Star, Bike } from 'lucide-react';

const reasons = [
  { id: 'r-1', icon: Leaf, title: '100% Vegan and Vegetarian', desc: 'Strictly plant-based and vegetarian options. Perfect for clean eating and conscious dietary preferences.', color: 'text-green-700 bg-green-100' },
  { id: 'r-2', icon: ShieldCheck, title: 'Food Hygiene Certified', desc: 'Our kitchen holds a 5-star Food Hygiene Rating from the local council. Safe food, always.', color: 'text-blue-700 bg-blue-100' },
  { id: 'r-3', icon: Clock, title: 'Punctual Delivery', desc: 'Breakfast by 8:30 AM, Lunch by 1:00 PM, Dinner by 8:30 PM. We respect your schedule.', color: 'text-primary bg-red-100' },
  { id: 'r-4', icon: Heart, title: 'Made with Love', desc: 'Every meal is prepared by experienced home cooks using traditional recipes passed down generations.', color: 'text-red-600 bg-red-100' },
  { id: 'r-5', icon: Star, title: 'No Hidden Charges', desc: 'What you see is what you pay. Free delivery on all subscription plans. No surprise fees.', color: 'text-secondary bg-amber-100' },
  { id: 'r-6', icon: Bike, title: 'London-Wide Delivery', desc: 'We cover East, North, South, West and Central London. Check your postcode above.', color: 'text-primary bg-red-50' },
];

export default function WhyChooseSection() {
  return (
    <section id="about" className="py-16 lg:py-20 bg-white">
      <div className="max-w-screen-2xl mx-auto px-4 lg:px-8 xl:px-10">
        <div className="text-center mb-12">
          <span className="inline-block text-xs font-700 uppercase tracking-widest text-primary bg-blue-50 px-3 py-1.5 rounded-full mb-3">
            Why Us
          </span>
          <h2 className="text-3xl lg:text-4xl font-extrabold text-foreground mb-3">
            Why Choose DoMeal?
          </h2>
          <p className="text-muted-foreground max-w-lg mx-auto">
            More than just food delivery — we bring the warmth of home-cooking to your daily life in London.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {reasons?.map((r) => (
            <div key={r?.id} className="flex gap-4 p-5 rounded-2xl border border-border hover:shadow-md hover:border-primary/20 transition-all duration-200 group">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${r?.color} group-hover:scale-110 transition-transform duration-200`}>
                <r.icon size={22} />
              </div>
              <div>
                <h3 className="font-700 text-foreground text-sm mb-1">{r?.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{r?.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}