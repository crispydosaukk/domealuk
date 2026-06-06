import React from 'react';
import AdminLayout from '@/app/admin-dashboard/components/AdminLayout';
import AdminAnalyticsClient from './AdminAnalyticsClient';

export default function AdminAnalyticsPage() {
  return (
    <AdminLayout activeRoute="/admin-analytics">
      <AdminAnalyticsClient />
    </AdminLayout>
  );
}
