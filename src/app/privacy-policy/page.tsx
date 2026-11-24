import React from 'react';
import type { Metadata } from 'next';
import PrivacyPolicyClient from './components/PrivacyPolicyClient';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description:
    'Read the DoMeal Privacy Policy to learn how we protect your personal data, manage orders, and ensure transparency in our meal delivery services.',
  keywords: ['DoMeal privacy policy', 'customer data protection', 'GDPR compliance UK food delivery'],
  alternates: {
    canonical: '/privacy-policy',
  },
  openGraph: {
    title: 'Privacy Policy | DoMeal London',
    description: 'Learn how DoMeal collects, uses, and protects your personal information.',
    url: '/privacy-policy',
  },
};

export default function PrivacyPolicyPage() {
  return <PrivacyPolicyClient />;
}
