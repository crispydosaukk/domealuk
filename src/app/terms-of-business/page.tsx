import React from 'react';
import type { Metadata } from 'next';
import TermsOfBusinessClient from './components/TermsOfBusinessClient';
import { getDynamicPageSeo } from '@/lib/dynamic-seo';

export async function generateMetadata(): Promise<Metadata> {
  return getDynamicPageSeo('/terms-of-business');
}

export default function TermsOfBusinessPage() {
  return <TermsOfBusinessClient />;
}
