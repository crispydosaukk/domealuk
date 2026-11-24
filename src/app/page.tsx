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

export const metadata: Metadata = {
  title: 'DoMeal — Home Food Away From Home | Indian Tiffin London',
  description:
    'Authentic, fresh, home-cooked Indian tiffin delivered daily across London. Daily lunch & dinner meal plans, flexible weekly subscriptions, pure vegetarian & healthy home food.',
  keywords: [
    'Indian meal delivery London',
    'Tiffin service London',
    'Home cooked food delivery London',
    'Daily vegetarian meal subscription UK',
    'Authentic Indian tiffin service',
    'Pure veg tiffin London',
    'Healthy Indian lunch delivery',
    'DoMeal UK',
    'Tiffin service Canary Wharf',
    'Indian meal delivery Wembley',
    'Daily tiffin service East London',
    'South Indian tiffin London',
    'North Indian tiffin London',
  ],
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'DoMeal — Authentic Indian Tiffin & Meal Delivery London',
    description:
      'Home-cooked Indian meals delivered to your doorstep across London. Flexible meal plans, no cooking stress, authentic traditional recipes.',
    url: '/',
    images: ['/banner.png'],
  },
};

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
        <ExploreLocationsSection />
        <TestimonialsSection />
        <FAQSection />
      </main>
      <UserFooter />
    </div>
  );
}
