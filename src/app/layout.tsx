import React from 'react';
import type { Metadata, Viewport } from 'next';
import '../styles/tailwind.css';
import { Toaster } from 'sonner';
import { AuthProvider } from '@/context/AuthContext';
import { CartProvider } from '@/context/CartContext';
import GlobalPopup from '@/components/GlobalPopup';
import JsonLd from '@/components/JsonLd';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://domeal.co.uk';

export const viewport: Viewport = {
  themeColor: '#FF6B00',
  width: 'device-width',
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: 'DoMeal — Home Food Away From Home | Indian Tiffin London',
    template: '%s | DoMeal London',
  },
  description:
    'Authentic, fresh, home-cooked Indian tiffin delivered daily across London. Daily lunch & dinner meal plans, flexible weekly subscriptions, pure vegetarian & healthy home food.',
  applicationName: 'DoMeal',
  authors: [{ name: 'DoMeal Culinary Team', url: BASE_URL }],
  generator: 'Next.js 15',
  keywords: [
    'Indian meal delivery London',
    'Tiffin service London',
    'Home cooked food delivery London',
    'Daily vegetarian meal subscription UK',
    'Authentic Indian tiffin service',
    'Pure veg tiffin London',
    'Healthy Indian lunch delivery',
    'DoMeal UK',
    'South Indian tiffin London',
    'North Indian tiffin London',
    'Student meal delivery London',
    'Corporate Indian catering London',
  ],
  referrer: 'origin-when-cross-origin',
  creator: 'DoMeal Ltd',
  publisher: 'DoMeal Ltd',
  formatDetection: {
    email: false,
    address: true,
    telephone: true,
  },
  alternates: {
    canonical: '/',
    languages: {
      'en-GB': '/',
    },
  },
  openGraph: {
    title: 'DoMeal — Authentic Indian Tiffin & Meal Delivery in London',
    description:
      'Home-cooked Indian meals delivered to your doorstep across London. Flexible meal plans, no cooking stress, authentic traditional recipes.',
    url: BASE_URL,
    siteName: 'DoMeal',
    images: [
      {
        url: '/banner.png',
        width: 1200,
        height: 630,
        alt: 'DoMeal - Authentic Indian Tiffin & Meal Delivery London',
      },
    ],
    locale: 'en_GB',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'DoMeal — Home Food Away From Home',
    description:
      'Fresh, authentic Indian tiffin delivered daily across London. Healthy home food without cooking.',
    images: ['/banner.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: [
      { url: '/favicon.ico', type: 'image/x-icon' },
      { url: '/favicon.png', type: 'image/png' },
    ],
    apple: [{ url: '/favicon.png', type: 'image/png' }],
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <JsonLd />
      </head>
      <body className="font-sans antialiased" suppressHydrationWarning>
        <AuthProvider>
          <CartProvider>
            {children}
            <GlobalPopup />
          </CartProvider>
        </AuthProvider>
        <Toaster
          position="top-center"
          toastOptions={{ className: 'my-custom-toast', duration: 1500 }}
          richColors
          visibleToasts={1}
        />
      </body>
    </html>
  );
}
