import React from 'react';
import type { Metadata } from 'next';
import StudentDiscountsClient from './components/StudentDiscountsClient';
import { getDynamicPageSeo } from '@/lib/dynamic-seo';

export async function generateMetadata(): Promise<Metadata> {
  return getDynamicPageSeo('/student-discounts');
}

export default function StudentDiscountsPage() {
  return <StudentDiscountsClient />;
}
