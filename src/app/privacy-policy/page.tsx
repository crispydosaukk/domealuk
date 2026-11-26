import React from 'react';
import type { Metadata } from 'next';
import PrivacyPolicyClient from './components/PrivacyPolicyClient';
import { getDynamicPageSeo } from '@/lib/dynamic-seo';

export async function generateMetadata(): Promise<Metadata> {
  return getDynamicPageSeo('/privacy-policy');
}

export default function PrivacyPolicyPage() {
  return <PrivacyPolicyClient />;
}
