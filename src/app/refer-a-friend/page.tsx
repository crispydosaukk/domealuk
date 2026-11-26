import React from 'react';
import type { Metadata } from 'next';
import ReferAFriendClient from './components/ReferAFriendClient';
import { getDynamicPageSeo } from '@/lib/dynamic-seo';

export async function generateMetadata(): Promise<Metadata> {
  return getDynamicPageSeo('/refer-a-friend');
}

export default function ReferAFriendPage() {
  return <ReferAFriendClient />;
}
