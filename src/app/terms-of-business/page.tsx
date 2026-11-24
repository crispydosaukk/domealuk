import React from 'react';
import type { Metadata } from 'next';
import TermsOfBusinessClient from './components/TermsOfBusinessClient';

export const metadata: Metadata = {
  title: 'Terms of Business',
  description:
    'Review the official DoMeal Terms of Business outlining service standards, order fulfillment, deliveries, and payment terms in the UK.',
  keywords: ['DoMeal terms of business', 'subscription delivery terms UK', 'corporate catering business terms'],
  alternates: {
    canonical: '/terms-of-business',
  },
  openGraph: {
    title: 'Terms of Business | DoMeal London',
    description: 'Commercial terms of business for DoMeal services in London.',
    url: '/terms-of-business',
  },
};

export default function TermsOfBusinessPage() {
  return <TermsOfBusinessClient />;
}
