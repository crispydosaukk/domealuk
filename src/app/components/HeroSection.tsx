import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Star, Clock, Leaf } from 'lucide-react';

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #1A2B5E 0%, #0F1A3E 50%, #1A2B5E 100%)' }}>
      {/* Decorative blobs */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-0 left-0 w-96 h-96 bg-[#CC1B1B] rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-[#4A90D9] rounded-full blur-3xl translate-x-1/4 translate-y-1/4" />
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-[#CC1B1B] rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 opacity-20" />
      </div>
      {/* Subtle dot pattern */}
      <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'radial-gradient(circle, #4A90D9 1px, transparent 1px)', backgroundSize: '32px 32px' }} />

      <div className="max-w-screen-2xl mx-auto px-4 lg:px-8 xl:px-10 py-20 lg:py-28 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 items-center">
          {/* Left content */}
          <div>
            <div className="inline-flex items-center gap-2 bg-[#CC1B1B]/20 text-red-300 text-xs font-700 px-3 py-1.5 rounded-full mb-6 border border-[#CC1B1B]/30">
              <span className="w-2 h-2 bg-[#CC1B1B] rounded-full animate-pulse" />
              Home Food Away From Home · London
            </div>

            <h1 className="text-4xl lg:text-5xl xl:text-6xl font-extrabold text-white leading-tight mb-4">
              Authentic Indian
              <br />
              <span className="text-[#CC1B1B]">Tiffin Delivered</span>
              <br />
              <span className="text-[#4A90D9]">Fresh Daily 🍱</span>
            </h1>

            <p className="text-lg text-gray-300 leading-relaxed mb-8 max-w-lg">
              Home-cooked Indian meals delivered to your door across London. No preservatives, no shortcuts — just the taste of home, every single day.
            </p>

            <div className="flex flex-wrap gap-4 mb-10">
              <Link
                href="/menu-ordering-screen"
                className="inline-flex items-center gap-2 bg-[#CC1B1B] text-white font-700 px-6 py-3.5 rounded-xl hover:bg-red-700 transition-all duration-150 active:scale-95 shadow-lg shadow-red-900/40"
              >
                Order Today&apos;s Tiffin
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
                  <p className="text-sm font-700 text-white">100% Veg</p>
                  <p className="text-xs text-gray-400">No Onion/Garlic Option</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 bg-[#4A90D9]/20 rounded-lg flex items-center justify-center">
                  <Clock size={16} className="text-[#4A90D9]" />
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
              <div className="w-80 lg:w-96 bg-white/10 backdrop-blur-sm border border-white/20 rounded-3xl p-8 shadow-2xl">
                {/* Logo */}
                <div className="w-32 h-32 mx-auto rounded-full overflow-hidden border-4 border-[#CC1B1B]/50 shadow-xl mb-6">
                  <Image
                    src="/assets/images/Adobe_Express_-_file-1778877049653.jpg"
                    alt="DoMeal — authentic Indian tiffin delivery London"
                    width={128}
                    height={128}
                    className="w-full h-full object-cover"
                  />
                </div>
                <h2 className="text-white text-2xl font-extrabold text-center mb-1">DoMeal</h2>
                <p className="text-[#CC1B1B] text-xs font-600 text-center tracking-widest uppercase mb-6">Home Food Away From Home</p>

                <div className="space-y-3">
                  {[
                    { label: 'Breakfast Tiffin', time: '7:30 AM', price: '£3.99' },
                    { label: 'Lunch Thali', time: '12:00 PM', price: '£6.99' },
                    { label: 'Dinner Special', time: '7:30 PM', price: '£5.99' },
                  ]?.map((slot) => (
                    <div key={slot?.label} className="flex items-center justify-between bg-white/10 rounded-xl px-4 py-2.5">
                      <div>
                        <p className="text-white text-sm font-600">{slot?.label}</p>
                        <p className="text-gray-400 text-xs">{slot?.time}</p>
                      </div>
                      <span className="text-[#CC1B1B] font-800 text-sm">{slot?.price}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Floating badge */}
              <div className="absolute -top-4 -right-4 bg-[#CC1B1B] text-white rounded-2xl shadow-xl p-3 text-center border-2 border-red-400">
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