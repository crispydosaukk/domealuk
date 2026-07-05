'use client';
import React from 'react';
import MenuTab from '@/app/order-menu-management-screen/components/MenuTab';

export default function AdminMenuClient() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-foreground">Menu Management</h1>
        <p className="text-sm text-muted-foreground">
          Add, edit, and manage your DoMeal menu items
        </p>
      </div>
      <MenuTab />
    </div>
  );
}
