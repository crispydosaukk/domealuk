import React from 'react';
import type { Metadata } from 'next';
import HowToHeatClient from './components/HowToHeatClient';

export const metadata: Metadata = {
  title: 'How to Heat & Food Storage Guide',
  description:
    'Step-by-step instructions on how to heat and store your authentic Indian tiffin meals. Oven and microwave recommendations for fresh, delicious dining.',
  keywords: [
    'How to heat indian tiffin',
    'Reheating curry and dal instructions',
    'Tiffin box microwave temperature',
    'Indian meal storage guide London',
  ],
  alternates: {
    canonical: '/how-to-heat',
  },
  openGraph: {
    title: 'How to Heat Your DoMeal Tiffins | DoMeal London',
    description:
      'Easy instructions to heat your homestyle Indian meals to perfection.',
    url: '/how-to-heat',
  },
};

export default function HowToHeatPage() {
  return <HowToHeatClient />;
}
