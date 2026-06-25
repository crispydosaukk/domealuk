import React from 'react';
import UserNavbar from '@/components/UserNavbar';
import UserFooter from '@/components/UserFooter';
import HeroSection from '@/app/components/HeroSection';
import HowItWorksSection from '@/app/components/HowItWorksSection';
import MenuOrderingClient from '@/app/menu/components/MenuOrderingClient';
import TestimonialsSection from '@/app/components/TestimonialsSection';
import WhyChooseSection from '@/app/components/WhyChooseSection';
import PostcodeSearch from '@/app/components/PostcodeSearch';
import FAQSection from '@/app/components/FAQSection';

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
        <TestimonialsSection />
        <FAQSection />
      </main>
      <UserFooter />
    </div>
  );
}