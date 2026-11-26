import React, { Suspense } from 'react';
import type { Metadata } from 'next';
import SuperAdminLayout from './components/SuperAdminLayout';
import SuperAdminDashboardClient from './components/SuperAdminDashboardClient';
import { Loader2 } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Super Admin Master Console | DoMeal London',
  description: 'Executive management portal with full operational replica and elevated platform controls.',
  robots: {
    index: false,
    follow: false,
  },
};

interface PageProps {
  searchParams: Promise<{ tab?: string }>;
}

export default async function SuperAdminPage({ searchParams }: PageProps) {
  const { tab = 'overview' } = await searchParams;

  return (
    <SuperAdminLayout activeTab={tab}>
      <Suspense
        fallback={
          <div className="min-h-[50vh] flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-[#142A1E]" />
          </div>
        }
      >
        <SuperAdminDashboardClient />
      </Suspense>
    </SuperAdminLayout>
  );
}
