import React, { Suspense } from 'react';
import AuthClient from '@/app/sign-up-login-screen/components/AuthClient';

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
