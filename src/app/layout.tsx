import React from 'react';
import type { Metadata, Viewport } from 'next';
import { Plus_Jakarta_Sans } from 'next/font/google';
import '../styles/tailwind.css';
import { Toaster } from 'sonner';
import { AuthProvider } from '@/context/AuthContext';
import { CartProvider } from '@/context/CartContext';
import GlobalPopup from '@/components/GlobalPopup';

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-plus-jakarta-sans',
  display: 'swap',
});

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

export const metadata: Metadata = {
  title: 'DoMeal — Home Food Away From Home',
  description: 'Authentic home-cooked Indian tiffin delivered fresh to your door in London. Daily meal plans and weekly subscriptions. domeal.co.uk',
  icons: {
    icon: [
      { url: '/favicon.ico', type: 'image/x-icon' },
      { url: '/favicon.png', type: 'image/png' },
    ],
    apple: [
      { url: '/favicon.png', type: 'image/png' },
    ],
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={plusJakartaSans.variable} suppressHydrationWarning>
      <body className={plusJakartaSans.className} suppressHydrationWarning>
        <AuthProvider>
          <CartProvider>
            {children}
            <GlobalPopup />
          </CartProvider>
        </AuthProvider>
        <Toaster position="top-center" toastOptions={{ className: 'my-custom-toast', duration: 1500 }} richColors visibleToasts={1} />
      </body>
    </html>
  );
}