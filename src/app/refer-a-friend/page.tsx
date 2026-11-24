import React from 'react';
import type { Metadata } from 'next';
import ReferAFriendClient from './components/ReferAFriendClient';

export const metadata: Metadata = {
  title: 'Refer a Friend & Earn Meal Credits',
  description:
    'Share authentic home-cooked Indian meals with your friends. Give £10 and get £10 towards your next tiffin order with DoMeal London.',
  keywords: [
    'Refer a friend meal credits',
    'DoMeal referral programme',
    'Free indian food credit London',
    'Food delivery referral discount',
  ],
  alternates: {
    canonical: '/refer-a-friend',
  },
  openGraph: {
    title: 'Refer a Friend | DoMeal London',
    description:
      'Give £10, Get £10. Share authentic Indian food with your friends and family.',
    url: '/refer-a-friend',
  },
};

export default function ReferAFriendPage() {
  return <ReferAFriendClient />;
}
