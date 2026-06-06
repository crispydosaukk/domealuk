import React from 'react';
import AdminLayout from '@/app/admin-dashboard/components/AdminLayout';
import AdminMenuClient from './AdminMenuClient';

export default function AdminMenuPage() {
  return (
    <AdminLayout activeRoute="/admin-menu">
      <AdminMenuClient />
    </AdminLayout>
  );
}
