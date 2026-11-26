import React, { Suspense } from 'react';
import type { Metadata } from 'next';
import UserNavbar from '@/components/UserNavbar';
import UserFooter from '@/components/UserFooter';
import GiftClient from './components/GiftClient';
import { getDynamicPageSeo } from '@/lib/dynamic-seo';

export async function generateMetadata(): Promise<Metadata> {
  return getDynamicPageSeo('/gift');
}

export default function GiftPage() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <UserNavbar />

      <main className="flex-1 max-w-screen-xl mx-auto px-4 lg:px-8 xl:px-10 py-6 w-full">
        {/* Breadcrumb */}
        <div className="text-sm text-muted-foreground mb-8">
          <a href="/" className="hover:text-primary">
            Home
          </a>{' '}
          &gt; <span className="text-foreground font-600">Gift Cards</span>
        </div>

        <Suspense
          fallback={
            <div className="flex items-center justify-center min-h-[400px]">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          }
        >
          <GiftClient />
        </Suspense>
      </main>

      <UserFooter />
    </div>
  );
}
