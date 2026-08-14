import React from 'react';
import { Metadata } from 'next';
import UserNavbar from '@/components/UserNavbar';
import UserFooter from '@/components/UserFooter';
import CorporateCateringClient from './components/CorporateCateringClient';

export const metadata: Metadata = {
  title: 'Corporate Catering Services | DoMeal',
  description:
    'London\'s premier corporate catering service. Authentic South Indian feasts, Live 4ft Jumbo Dosa stations, executive office buffets, licensed bar & fine wines.',
};

export default function CorporateCateringPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8F5]">
      <UserNavbar />
      <main className="flex-1 w-full">
        <CorporateCateringClient />
      </main>
      <UserFooter />
    </div>
  );
}
