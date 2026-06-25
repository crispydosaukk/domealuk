import React, { Suspense } from 'react';
import UserNavbar from '@/components/UserNavbar';
import UserFooter from '@/components/UserFooter';
import WalletClient from './components/WalletClient';

export default function WalletPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <UserNavbar />
      <main className="flex-1 max-w-4xl mx-auto w-full px-4 py-8 lg:py-12">
        <Suspense fallback={
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        }>
          <WalletClient />
        </Suspense>
      </main>
      <UserFooter />
    </div>
  );
}
