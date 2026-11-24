import React from 'react';
import type { Metadata } from 'next';
import StudentDiscountsClient from './components/StudentDiscountsClient';

export const metadata: Metadata = {
  title: 'Student Deals & Meal Discounts',
  description:
    'Exclusive student discounts on authentic Indian home-cooked meals. Enjoy nutritious, delicious daily tiffin delivery across London universities and student accommodations.',
  keywords: [
    'Student discount indian food London',
    'Student meal delivery London',
    'Cheap tiffin service London',
    'University tiffin delivery UK',
    'Budget indian meals London',
  ],
  alternates: {
    canonical: '/student-discounts',
  },
  openGraph: {
    title: 'Student Deals & Discounts | DoMeal London',
    description:
      'Nutritious Indian tiffin meals at student-friendly prices delivered right to your door.',
    url: '/student-discounts',
  },
};

export default function StudentDiscountsPage() {
  return <StudentDiscountsClient />;
}
