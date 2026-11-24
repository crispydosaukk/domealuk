'use client';

import React from 'react';
import { Star, Quote, Heart, CheckCircle2 } from 'lucide-react';

interface LocationEditorialReviewsProps {
  locationName: string;
}

export default function LocationEditorialReviews({ locationName }: LocationEditorialReviewsProps) {
  const reviews = [
    {
      quote:
        'The reusable dabba system has completely transformed our evenings. The rotis are soft, the dal is rich and comforting, and there is zero plastic waste going into our recycling bin every week.',
      author: 'Priya & Rahul S.',
      neighbourhood: `${locationName} Residents`,
      plan: '3-Day Family Feast Plan',
      rating: 5,
    },
    {
      quote:
        'As an NHS doctor working grueling shifts, having fresh, nutritious Indian food ready in the fridge is an absolute lifesaver. It tastes just like my mother cooks at home—light, authentic, and satisfying.',
      author: 'Dr. Arjun M.',
      neighbourhood: `${locationName}`,
      plan: 'Weekly Lunch & Dinner Plan',
      rating: 5,
    },
    {
      quote:
        'So much lighter and fresher than restaurant takeaways! You can taste the quality of the cold-pressed oils and whole spices. We swap our dabbas every Thursday and could not be happier.',
      author: 'Sarah & Deepak T.',
      neighbourhood: `${locationName}`,
      plan: '2-Day Weekly Feast Plan',
      rating: 5,
    },
  ];

  return (
    <section className="py-20 lg:py-28 bg-[#F5EFE6] text-stone-900 border-b border-stone-200">
      <div className="max-w-screen-2xl mx-auto px-4 lg:px-8 xl:px-12">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#1E3B2B]/10 text-[#1E3B2B] text-xs font-black uppercase tracking-widest">
            <Heart size={14} className="text-[#C39B54]" />
            <span>Loved Across {locationName}</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#142A1E] tracking-tight leading-tight font-sans">
            What {locationName} Is Saying
          </h2>

          <div className="flex items-center justify-center gap-2 text-sm text-stone-600 font-medium">
            <div className="flex text-amber-500">
              {'★★★★★'.split('').map((s, i) => (
                <span key={i} className="text-base">★</span>
              ))}
            </div>
            <span className="font-bold text-stone-900">4.9 / 5.0 Average</span>
            <span>· 1,200+ Verified London Orders</span>
          </div>
        </div>

        {/* 3 Review Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {reviews.map((rev, idx) => (
            <div
              key={idx}
              className="bg-white rounded-3xl p-8 border border-stone-200 shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                <Quote size={32} className="text-[#C39B54]/40 mb-4" />
                <div className="flex text-amber-400 mb-4">
                  {'★'.repeat(rev.rating).split('').map((s, i) => (
                    <span key={i} className="text-sm">★</span>
                  ))}
                </div>
                <p className="text-stone-700 text-base leading-relaxed italic mb-6">
                  &ldquo;{rev.quote}&rdquo;
                </p>
              </div>

              <div className="pt-5 border-t border-stone-100 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-stone-900 text-sm">{rev.author}</h4>
                  <p className="text-xs text-stone-500">{rev.neighbourhood}</p>
                </div>
                <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                  {rev.plan}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
