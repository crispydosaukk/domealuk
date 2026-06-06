import React from 'react';
import AdminLayout from '@/app/admin-dashboard/components/AdminLayout';
import AdminHistoryClient from './AdminHistoryClient';

export default function AdminHistoryPage() {
  return (
    <AdminLayout activeRoute="/admin-history">
      <AdminHistoryClient />
    </AdminLayout>
  );
}
