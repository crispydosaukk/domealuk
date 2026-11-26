import React from 'react';
import type { Metadata } from 'next';
import BasketClient from './BasketClient';

export const metadata: Metadata = {
  title: 'Your Basket',
  description: 'Review your meal selections and proceed to checkout.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function BasketPage() {
  return <BasketClient />;
}
