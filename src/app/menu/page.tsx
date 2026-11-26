import React from 'react';
import type { Metadata } from 'next';
import UserNavbar from '@/components/UserNavbar';
import UserFooter from '@/components/UserFooter';
import MenuOrderingClient from '@/app/menu/components/MenuOrderingClient';
import { getDynamicPageSeo } from '@/lib/dynamic-seo';

export async function generateMetadata(): Promise<Metadata> {
  return getDynamicPageSeo('/menu');
}

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
