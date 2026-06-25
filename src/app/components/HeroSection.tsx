import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Star, Clock, Leaf, Check } from 'lucide-react';

export default function HeroSection() {
  return (
    <section
      className="relative overflow-hidden bg-cover bg-center bg-no-repeat"
      style={{
        backgroundImage: `linear-gradient(to right, rgba(30, 59, 43, 0.95) 0%, rgba(30, 59, 43, 0.5) 100%), url('/banner.png')`
      }}
    >
      {/* Decorative blobs */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-0 left-0 w-96 h-96 bg-[#C39B54] rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-[#C39B54] rounded-full blur-3xl translate-x-1/4 translate-y-1/4" />
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-[#C39B54] rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 opacity-20" />
      </div>
      {/* Subtle dot pattern */}
      <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'radial-gradient(circle, #C39B54 1px, transparent 1px)', backgroundSize: '32px 32px' }} />

      <div className="max-w-screen-2xl mx-auto px-4 lg:px-8 xl:px-10 pt-32 pb-12 lg:pt-40 lg:pb-16 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 items-center">
          {/* Left content */}
          <div>


            <h1 className="text-4xl lg:text-5xl xl:text-6xl font-extrabold text-white leading-tight mb-4">
              Fresh Indian Food,
              <br />
              <span className="text-[#C39B54]">Delivered with Love</span>
            </h1>

            <p className="text-lg text-gray-300 leading-relaxed mb-8 max-w-lg">
              Drawing on 21 years of restaurant expertise, we prepare nutritious vegetarian meals using authentic recipes, fresh ingredients, and sustainable packaging.
            </p>

            <div className="flex flex-wrap gap-4 mb-10">
              <Link
                href="/menu"
                className="inline-flex items-center gap-2 bg-[#C39B54] text-white font-700 px-6 py-3.5 rounded-xl hover:bg-yellow-700 transition-all duration-150 active:scale-95 shadow-lg shadow-yellow-900/40"
              >
                Start Your DoMeal Journey
                <ArrowRight size={18} />
              </Link>
              <Link
                href="/#plans"
                className="inline-flex items-center gap-2 bg-white/10 text-white font-600 px-6 py-3.5 rounded-xl border border-white/20 hover:bg-white/20 transition-all duration-150 active:scale-95"
              >
                View Meal Plans
              </Link>
            </div>

            <div className="flex flex-wrap gap-6">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 bg-yellow-500/20 rounded-lg flex items-center justify-center">
                  <Star size={16} className="text-yellow-400 fill-yellow-400" />
                </div>
                <div>
                  <p className="text-sm font-700 text-white">4.9 / 5</p>
                  <p className="text-xs text-gray-400">1,200+ Reviews</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 bg-green-500/20 rounded-lg flex items-center justify-center">
                  <Leaf size={16} className="text-green-400" />
                </div>
                <div>
                  <p className="text-sm font-700 text-white">100% Vegan</p>
                  <p className="text-xs text-gray-400">and Vegetarian</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 bg-[#C39B54]/20 rounded-lg flex items-center justify-center">
                  <Clock size={16} className="text-[#C39B54]" />
                </div>
                <div>
                  <p className="text-sm font-700 text-white">On Time</p>
                  <p className="text-xs text-gray-400">Guaranteed Delivery</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right: visual card */}
          <div className="flex justify-center lg:justify-end">
            <div className="relative">
              {/* Main card */}
              <div className="w-full max-w-sm sm:max-w-lg lg:max-w-[520px] bg-white/10 backdrop-blur-sm border border-white/20 rounded-3xl p-6 sm:p-8 shadow-2xl">
                {/* Logo */}
                <div className="w-32 h-32 mx-auto rounded-full overflow-hidden border-4 border-[#C39B54]/50 shadow-xl mb-6">
                  <Image
                    src="/DOMEAL_Logo.jpg"
                    alt="DoMeal — authentic Indian tiffin delivery London"
                    width={128}
                    height={128}
                    className="w-full h-full object-cover"
                  />
                </div>
                <h2 className="text-white text-2xl font-extrabold text-center mb-1">DoMeal</h2>
                <p className="text-[#C39B54] text-xs font-600 text-center tracking-widest uppercase mb-6">Home Food Away From Home</p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
                  {[
                    'Freshly Cooked Daily',
                    'Vegetarian & Vegan Options',
                    'Balanced Nutrition',
                    'Reusable Packaging',
                    '21 Years of Culinary Excellence',
                  ].map((point, idx) => (
                    <div key={idx} className={`flex items-center gap-3 bg-white/15 rounded-xl px-4 py-3 border border-white/10 shadow-sm ${idx === 4 ? 'sm:col-span-2 sm:justify-center' : ''}`}>
                      <div className="w-7 h-7 rounded-full bg-[#1E3B2B] flex items-center justify-center flex-shrink-0">
                        <Check size={16} strokeWidth={3} className="text-white" />
                      </div>
                      <p className="text-white text-xs sm:text-sm font-bold leading-snug drop-shadow-sm">{point}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Floating badge */}
              <div className="absolute -top-4 -right-4 bg-[#C39B54] text-white rounded-2xl shadow-xl p-3 text-center border-2 border-yellow-400">
                <p className="text-2xl font-extrabold tabular-nums">500+</p>
                <p className="text-xs font-600">Daily Orders</p>
              </div>

              {/* Bottom badge */}
              <div className="absolute -bottom-4 -left-4 bg-white rounded-2xl shadow-xl p-3 border border-border">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                    <Leaf size={16} className="text-green-600" />
                  </div>
                  <div>
                    <p className="text-xs font-700 text-foreground">Today&apos;s Special</p>
                    <p className="text-xs text-primary font-600">Dal Makhani + Roti</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}