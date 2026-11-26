import React from 'react';
import type { Metadata } from 'next';
import TermsOfServiceClient from './components/TermsOfServiceClient';
import { getDynamicPageSeo } from '@/lib/dynamic-seo';

export async function generateMetadata(): Promise<Metadata> {
  return getDynamicPageSeo('/terms-of-service');
}

export default function TermsOfServicePage() {
  return <TermsOfServiceClient />;
}
