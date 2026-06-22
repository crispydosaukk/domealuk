import React from 'react';
import { Star, Quote } from 'lucide-react';

const testimonials = [
  {
    id: 'review-001',
    name: 'Priya Raghunathan',
    role: 'Software Engineer, Whitechapel',
    rating: 5,
    text: "I\'ve been subscribing for 8 months now. The Pongal breakfast is exactly like my mom makes. Never missed a delivery. Highly recommend to anyone who misses home food!",
    plan: 'Full Day Plan',
  },
  {
    id: 'review-002',
    name: 'Venkatesh Subramaniam',
    role: 'Teacher, Ilford',
    rating: 5,
    text: 'The no-onion no-garlic option is a blessing. Perfect for our family. Quantity is generous and the food is always hot and fresh. Best tiffin service in London.',
    plan: 'Lunch + Dinner Plan',
  },
  {
    id: 'review-003',
    name: 'Kavitha Moorthi',
    role: 'Homemaker, East Ham',
    rating: 5,
    text: "Even as a homemaker, I order their Full Meals on busy festival days. The curd rice and pickle combo is outstanding. The tiffin boxes are a lovely touch!",
    plan: 'Occasional Orders',
  },
  {
    id: 'review-004',
    name: 'Arun Krishnaswamy',
    role: 'Accountant, Romford',
    rating: 5,
    text: "Switched from another service 6 months ago and never looked back. The variety changes daily so I never get bored. Customer support is also very responsive.",
    plan: 'Breakfast Plan',
  },
];

export default function TestimonialsSection() {
  return (
    <section id="reviews" className="py-16 lg:py-20 bg-white">
      <div className="max-w-screen-2xl mx-auto px-4 lg:px-8 xl:px-10">
        <div className="text-center mb-12">
          <span className="inline-block text-xs font-700 uppercase tracking-widest text-primary bg-blue-50 px-3 py-1.5 rounded-full mb-3">
            Customer Love
          </span>
          <h2 className="text-3xl lg:text-4xl font-extrabold text-foreground mb-3">
            What Our Customers Say
          </h2>
          <p className="text-muted-foreground">
            Over 1,200 happy customers across London trust DoMeal daily.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
          {testimonials?.map((t) => (
            <div key={t?.id} className="bg-background rounded-2xl border border-border p-5 hover:shadow-md hover:border-primary/20 transition-all duration-200">
              <Quote size={24} className="text-primary/20 mb-3" />
              <p className="text-sm text-foreground leading-relaxed mb-4">{t?.text}</p>
              <div className="flex gap-0.5 mb-3">
                {Array.from({ length: t?.rating }, (_, i) => (
                  <Star key={`star-${t?.id}-${i}`} size={14} className="text-yellow-400 fill-yellow-400" />
                ))}
              </div>
              <div className="border-t border-border pt-3">
                <p className="font-700 text-sm text-foreground">{t?.name}</p>
                <p className="text-xs text-muted-foreground">{t?.role}</p>
                <span className="inline-block text-xs bg-blue-50 text-primary font-600 px-2 py-0.5 rounded-full mt-1.5">
                  {t?.plan}
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-10 bg-gradient-to-r from-primary via-[#10261A] to-[#0A160E] rounded-2xl p-8 text-white text-center relative overflow-hidden">
          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle, #C39B54 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
          <div className="relative z-10">
            <h3 className="text-2xl font-extrabold mb-2">Ready to taste the difference?</h3>
            <p className="text-blue-200 mb-6 text-sm">Join 1,200+ happy customers. First week free on any subscription plan.</p>
            <div className="flex flex-wrap gap-3 justify-center">
              <a
                href="/menu"
                className="bg-secondary text-white font-700 px-6 py-3 rounded-xl hover:bg-red-700 transition-all active:scale-95"
              >
                Order Now
              </a>
              <a
                href="/sign-up-login-screen"
                className="bg-white/20 text-white font-600 px-6 py-3 rounded-xl hover:bg-white/30 transition-all active:scale-95 border border-white/30"
              >
                Create Account
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}