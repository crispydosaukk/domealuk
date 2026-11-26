import React, { Suspense } from 'react';
import type { Metadata } from 'next';
import AuthClient from '@/app/sign-up-login-screen/components/AuthClient';
import { getDynamicPageSeo } from '@/lib/dynamic-seo';

export async function generateMetadata(): Promise<Metadata> {
  return getDynamicPageSeo('/sign-up-login-screen');
}

export default function SignUpLoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      }
    >
      <AuthClient />
    </Suspense>
  );
}
