import { Metadata } from 'next';
import ItemDetailsClient from './ItemDetailsClient';
import { Suspense } from 'react';
import { Loader2 } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Menu Item Details | DoMeal UK',
};

export default function MenuItemPage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
          <Loader2 size={32} className="animate-spin text-primary" />
          <p className="text-sm font-500 text-muted-foreground">Loading...</p>
        </div>
      }
    >
      <ItemDetailsClient />
    </Suspense>
  );
}
