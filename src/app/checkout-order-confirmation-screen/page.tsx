import React, { Suspense } from 'react';
import UserNavbar from '@/components/UserNavbar';
import UserFooter from '@/components/UserFooter';
import CheckoutClient from '@/app/checkout-order-confirmation-screen/components/CheckoutClient';

export default function CheckoutPage() {
  return (
    <div className="min-h-screen bg-background">
      <UserNavbar />
      <main>
        <Suspense
          fallback={
            <div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#1E3B2B]"></div>
              <p className="text-sm text-muted-foreground font-600">Loading checkout...</p>
            </div>
          }
        >
          <CheckoutClient />
        </Suspense>
      </main>
      <UserFooter />
    </div>
  );
}
