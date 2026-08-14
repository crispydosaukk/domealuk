import React from 'react';
import AdminLayout from '../admin-dashboard/components/AdminLayout';
import AdminCorporateClient from './components/AdminCorporateClient';

export const metadata = {
  title: 'Corporate Inquiries | DoMeal Admin',
  description: 'Manage corporate catering inquiries and booking leads.',
};

export default function AdminCorporatePage() {
  return (
    <AdminLayout activeRoute="/admin-corporate">
      <AdminCorporateClient />
    </AdminLayout>
  );
}
