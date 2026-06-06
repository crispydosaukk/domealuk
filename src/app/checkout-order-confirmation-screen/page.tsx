import React from 'react';
import UserNavbar from '@/components/UserNavbar';
import UserFooter from '@/components/UserFooter';
import CheckoutClient from '@/app/checkout-order-confirmation-screen/components/CheckoutClient';

export default function CheckoutPage() {
  return (
    <div className="min-h-screen bg-background">
      <UserNavbar />
      <main>
        <CheckoutClient />
      </main>
      <UserFooter />
    </div>
  );
}