import React from 'react';
import type { Metadata } from 'next';
import UserNavbar from '@/components/UserNavbar';
import UserFooter from '@/components/UserFooter';
import OrderHistoryClient from './components/OrderHistoryClient';

export const metadata: Metadata = {
  title: 'Order History',
  description: 'View your past DoMeal orders, subscriptions, and deliveries.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function OrderHistoryPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <UserNavbar />
      <main className="flex-1 max-w-4xl mx-auto w-full px-4 py-8 lg:py-12">
        <OrderHistoryClient />
      </main>
      <UserFooter />
    </div>
  );
}
