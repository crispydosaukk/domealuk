import React from 'react';
import { Metadata } from 'next';
import UserNavbar from '@/components/UserNavbar';
import UserFooter from '@/components/UserFooter';
import CorporateCateringClient from './components/CorporateCateringClient';
import { getDynamicPageSeo } from '@/lib/dynamic-seo';

export async function generateMetadata(): Promise<Metadata> {
  return getDynamicPageSeo('/corporate-catering');
}

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
