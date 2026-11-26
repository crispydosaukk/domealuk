import React from 'react';
import type { Metadata } from 'next';
import HowToHeatClient from './components/HowToHeatClient';
import { getDynamicPageSeo } from '@/lib/dynamic-seo';

export async function generateMetadata(): Promise<Metadata> {
  return getDynamicPageSeo('/how-to-heat');
}

export default function HowToHeatPage() {
  return <HowToHeatClient />;
}
