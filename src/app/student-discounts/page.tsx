'use client';
import React, { useState, useEffect } from 'react';
import UserNavbar from '@/components/UserNavbar';
import UserFooter from '@/components/UserFooter';
import Image from 'next/image';
import Link from 'next/link';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { getApiUrl } from '@/lib/api';

export default function StudentDiscountsPage() {
  const [settings, setSettings] = useState({
    studentDiscount: 30,
    studentHeaderTitle: 'Student Deals',
    studentHeaderDesc:
      "Are you a student looking to eat nutritious and delicious authentic Indian meals without lifting a finger? Try DoMeal and get a taste of South Asia delivered to your doorstep. And without fail, you'll make your DoMeal day, you, your friends, and flatmates' favourite day of the week.",
    studentImage: '/banner.png',
    studentTitle: '{percentage}% off all your DoMeal orders',
    studentContent:
      'Fuel your studies with our healthy, authentic, and delicious tiffins. Verify your student status to claim your exclusive discount code.',
    studentBtnText: 'Verify Student Status',
    studentTermsText: 'See discount Terms & Conditions',
  });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch(getApiUrl('/api/public-settings'), { method: 'POST' });
        if (res.ok) {
          const data = await res.json();
          if (data.studentDiscount !== undefined) {
            setSettings((prev) => ({ ...prev, ...data }));
          }
        }
      } catch (error) {}
    };
    fetchSettings();
  }, []);
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <UserNavbar />

      <main className="flex-1 w-full pb-20">
        {/* Header Section */}
        <div className="bg-[#1E3B2B] w-full px-4 sm:px-6 lg:px-8 py-16 md:py-20 text-center relative overflow-hidden">
          {/* Background blobs for brand alignment */}
          <div className="absolute top-0 left-0 w-64 h-64 bg-[#C39B54] rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 opacity-20" />
          <div className="absolute bottom-0 right-0 w-64 h-64 bg-[#C39B54] rounded-full blur-3xl translate-x-1/4 translate-y-1/4 opacity-20" />

          <div className="max-w-4xl mx-auto relative z-10">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-900 text-white mb-6 tracking-tight">
              {settings.studentHeaderTitle}
            </h1>
            <p className="text-lg md:text-xl text-white/95 max-w-3xl mx-auto leading-relaxed font-500 whitespace-pre-line">
              {settings.studentHeaderDesc}
            </p>
          </div>
        </div>

        {/* Content Section */}
        <div className="max-w-screen-xl mx-auto px-4 lg:px-8 xl:px-10 mt-12 md:mt-16">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16 items-center">
            {/* Image Side */}
            <div className="relative w-full aspect-square md:aspect-[4/3] rounded-3xl overflow-hidden shadow-2xl">
              <Image
                src={settings.studentImage || '/banner.png'}
                alt="DoMeal Student Feast"
                fill
                className="object-cover"
              />
            </div>

            {/* Discount Card Side */}
            <div className="bg-white p-8 md:p-12 rounded-3xl shadow-xl border border-border flex flex-col justify-center">
              <h2 className="text-4xl md:text-5xl font-900 text-[#1E3B2B] mb-6 leading-tight whitespace-pre-line">
                {settings.studentTitle.replace(
                  /\{percentage\}/g,
                  settings.studentDiscount.toString()
                )}
              </h2>
              <p className="text-muted-foreground mb-8 text-lg leading-relaxed whitespace-pre-line">
                {settings.studentContent}
              </p>

              <div className="flex flex-col items-start gap-5">
                <Link
                  href="/sign-up-login-screen"
                  className="w-full sm:w-auto text-center bg-[#C39B54] text-white font-800 px-8 py-4 rounded-xl hover:bg-[#a17e41] transition-all shadow-lg shadow-yellow-900/20 text-lg"
                >
                  {settings.studentBtnText}
                </Link>
                <Link
                  href="#"
                  className="text-sm font-700 text-muted-foreground hover:text-primary underline underline-offset-4 transition-colors"
                >
                  {settings.studentTermsText}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>

      <UserFooter />
    </div>
  );
}
