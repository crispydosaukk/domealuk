import React from 'react';
import AdminLayout from '@/app/admin-dashboard/components/AdminLayout';
import AdminCustomersClient from './AdminCustomersClient';

export default function AdminCustomersPage() {
  return (
    <AdminLayout activeRoute="/admin-customers">
      <AdminCustomersClient />
    </AdminLayout>
  );
}
