import React from 'react';
import { ClipboardList, UtensilsCrossed, Bike } from 'lucide-react';

const steps = [
  {
    id: 'step-1',
    icon: ClipboardList,
    title: 'Choose Your Meals',
    description: "Browse today's fresh menu or subscribe to a weekly plan. Select from Breakfast, Lunch, Dinner, or a Full Day combo.",
    color: 'bg-primary/10 text-primary',
    border: 'border-primary/20',
  },
  {
    id: 'step-2',
    icon: UtensilsCrossed,
    title: 'We Cook Fresh',
    description: 'Our home-cooks prepare your meals fresh every morning using traditional Indian recipes with no preservatives.',
    color: 'bg-secondary/10 text-secondary',
    border: 'border-secondary/20',
  },
  {
    id: 'step-3',
    icon: Bike,
    title: 'Delivered to You',
    description: 'Hot tiffin delivered right to your doorstep across London. Track your order in real-time and enjoy a home-cooked meal.',
    color: 'bg-accent/10 text-amber-700',
    border: 'border-amber-200',
  },
];

export default function HowItWorksSection() {
  return (
    <section id="how-it-works" className="py-16 lg:py-20 bg-white">
      <div className="max-w-screen-2xl mx-auto px-4 lg:px-8 xl:px-10">
        <div className="text-center mb-12">
          <span className="inline-block text-xs font-700 uppercase tracking-widest text-primary bg-blue-50 px-3 py-1.5 rounded-full mb-3">
            Simple Process
          </span>
          <h2 className="text-3xl lg:text-4xl font-extrabold text-foreground mb-3">
            How DoMeal Works
          </h2>
          <p className="text-muted-foreground max-w-lg mx-auto">
            From your phone to your plate in 3 easy steps. No fuss, no hassle — just great food delivered on time.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">


          {steps?.map((step, idx) => (
            <div key={step?.id} className={`relative flex flex-col items-center text-center group p-6 rounded-2xl border-2 ${step?.border} hover:shadow-lg transition-all duration-200`}>
              <div className="relative mb-6">
                <div className={`w-20 h-20 ${step?.color} rounded-2xl flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform duration-200`}>
                  <step.icon size={36} />
                </div>
                <span className="absolute -top-2 -right-2 w-7 h-7 bg-primary text-white text-xs font-800 rounded-full flex items-center justify-center">
                  {idx + 1}
                </span>
              </div>
              <h3 className="text-lg font-700 text-foreground mb-2">{step?.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{step?.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}