import React, { Suspense } from 'react';
import { Metadata } from 'next';
import ResetPasswordClient from './components/ResetPasswordClient';
import { Loader2 } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Reset Password | DoMeal - Authentic Indian Tiffin Delivery London',
  description: 'Reset your password for your DoMeal account.',
};

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <Loader2 size={32} className="animate-spin text-primary" />
        </div>
      }
    >
      <ResetPasswordClient />
    </Suspense>
  );
}
