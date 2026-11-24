import React from 'react';
import type { Metadata } from 'next';
import TermsOfServiceClient from './components/TermsOfServiceClient';

export const metadata: Metadata = {
  title: 'Terms of Service',
  description:
    'Review the DoMeal Terms of Service governing your use of our Indian meal delivery platform, subscriptions, and website.',
  keywords: ['DoMeal terms of service', 'meal delivery terms London', 'customer agreement tiffin'],
  alternates: {
    canonical: '/terms-of-service',
  },
  openGraph: {
    title: 'Terms of Service | DoMeal London',
    description: 'Terms and conditions for using DoMeal meal delivery services.',
    url: '/terms-of-service',
  },
};

export default function TermsOfServicePage() {
  return <TermsOfServiceClient />;
}
