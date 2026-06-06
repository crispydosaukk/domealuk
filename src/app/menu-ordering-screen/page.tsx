import React from 'react';
import UserNavbar from '@/components/UserNavbar';
import UserFooter from '@/components/UserFooter';
import MenuOrderingClient from '@/app/menu-ordering-screen/components/MenuOrderingClient';

export default function MenuOrderingPage() {
  return (
    <div className="min-h-screen bg-background">
      <UserNavbar />
      <main>
        <MenuOrderingClient />
      </main>
      <UserFooter />
    </div>
  );
}