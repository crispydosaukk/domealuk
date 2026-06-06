import React from 'react';
import AdminLayout from '@/app/admin-dashboard/components/AdminLayout';
import AdminDashboardClient from '@/app/admin-dashboard/components/AdminDashboardClient';

export default function AdminDashboardPage() {
  return (
    <AdminLayout activeRoute="/admin-dashboard">
      <AdminDashboardClient />
    </AdminLayout>
  );
}