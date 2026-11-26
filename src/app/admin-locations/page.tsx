import React, { Suspense } from 'react';
import type { Metadata } from 'next';
import SuperAdminLayout from '@/app/super-admin/components/SuperAdminLayout';
import AdminLocationsClient from './components/AdminLocationsClient';
import { Loader2 } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Locations CMS | DoMeal Super Admin',
  description: 'Manage London regional landing pages, postcodes, neighbourhoods, FAQs, and local SEO.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function AdminLocationsPage() {
  return (
    <SuperAdminLayout activeTab="locations-cms">
      <Suspense
        fallback={
          <div className="min-h-[50vh] flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-[#142A1E]" />
          </div>
        }
      >
        <AdminLocationsClient />
      </Suspense>
    </SuperAdminLayout>
  );
}
