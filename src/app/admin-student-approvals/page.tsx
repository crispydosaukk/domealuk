import React from 'react';
import AdminLayout from '@/app/admin-dashboard/components/AdminLayout';
import StudentApprovalsClient from './StudentApprovalsClient';

export default function AdminStudentApprovalsPage() {
  return (
    <AdminLayout activeRoute="/admin-student-approvals">
      <StudentApprovalsClient />
    </AdminLayout>
  );
}
