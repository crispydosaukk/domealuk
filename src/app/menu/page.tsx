import React from 'react';
import type { Metadata } from 'next';
import UserNavbar from '@/components/UserNavbar';
import UserFooter from '@/components/UserFooter';
import MenuOrderingClient from '@/app/menu/components/MenuOrderingClient';

export const metadata: Metadata = {
  title: 'Our Menu & Daily Meal Plans',
  description:
    'Explore our rotating daily menu of authentic home-cooked Indian meals. Order fresh lunch or dinner tiffins, vegetarian curries, dal, roti, and rice delivered across London.',
  keywords: [
    'Daily Indian tiffin menu',
    'Pure vegetarian tiffin London',
    'Weekly tiffin subscription London',
    'South Indian meals London',
    'North Indian daily menu London',
    'Home food lunch delivery London',
  ],
  alternates: {
    canonical: '/menu',
  },
  openGraph: {
    title: 'Daily Indian Tiffin Menu | DoMeal London',
    description:
      'Delicious home-cooked Indian tiffin delivered daily. Rotating lunch & dinner menus with authentic flavours.',
    url: '/menu',
  },
};

export default function MenuOrderingPage() {
  return (
    <div className="min-h-screen bg-background">
      <UserNavbar />
      <main>
        <MenuOrderingClient />
      </main>
      <UserFooter />
    </div>
  );
}
