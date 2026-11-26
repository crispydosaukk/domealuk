import React from 'react';
import type { Metadata } from 'next';
import UserNavbar from '@/components/UserNavbar';
import UserFooter from '@/components/UserFooter';
import HeroSection from '@/app/components/HeroSection';
import HowItWorksSection from '@/app/components/HowItWorksSection';
import MenuOrderingClient from '@/app/menu/components/MenuOrderingClient';
import TestimonialsSection from '@/app/components/TestimonialsSection';
import WhyChooseSection from '@/app/components/WhyChooseSection';
import ExploreLocationsSection from '@/app/components/ExploreLocationsSection';
import PostcodeSearch from '@/app/components/PostcodeSearch';
import FAQSection from '@/app/components/FAQSection';
import { getDynamicPageSeo } from '@/lib/dynamic-seo';

export async function generateMetadata(): Promise<Metadata> {
  return getDynamicPageSeo('/');
}

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <UserNavbar />
      <main>
        <HeroSection />
        <PostcodeSearch />
        <HowItWorksSection />
        <MenuOrderingClient hideExtras={true} />
        <WhyChooseSection />
        {/* ExploreLocationsSection hidden from home page as requested (code preserved) */}
        {/* <ExploreLocationsSection /> */}
        <TestimonialsSection />
        <FAQSection />
      </main>
      <UserFooter />
    </div>
  );
}
