import React from 'react';
import AdminLayout from '@/app/admin-dashboard/components/AdminLayout';
import AdminPaymentsClient from './AdminPaymentsClient';

export default function AdminPaymentsPage() {
  return (
    <AdminLayout activeRoute="/admin-payments">
      <AdminPaymentsClient />
    </AdminLayout>
  );
}
