import React from 'react';
import AdminLayout from '@/app/admin-dashboard/components/AdminLayout';
import OrderMenuClient from '@/app/order-menu-management-screen/components/OrderMenuClient';

export default function OrderMenuManagementPage() {
  return (
    <AdminLayout activeRoute="/order-menu-management-screen">
      <OrderMenuClient />
    </AdminLayout>
  );
}