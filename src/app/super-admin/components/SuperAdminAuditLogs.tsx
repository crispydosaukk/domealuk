'use client';

import React, { useState } from 'react';
import {
  FileCode,
  Search,
  Filter,
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  Clock,
  User,
  ShoppingBag,
  CreditCard,
  Settings,
} from 'lucide-react';

interface AuditLogEntry {
  id: string;
  timestamp: string;
  adminEmail: string;
  action: string;
  category: 'Orders' | 'Users' | 'Finance' | 'System' | 'Menu';
  severity: 'info' | 'warning' | 'critical';
  details: string;
}

const INITIAL_LOGS: AuditLogEntry[] = [
  {
    id: 'log-001',
    timestamp: '25 Nov 2026, 01:10',
    adminEmail: 'admin@vegchennaisrilalitha.co.uk',
    action: 'Super Admin Login',
    category: 'System',
    severity: 'info',
    details: 'Authenticated via Google OAuth from London, UK (IP: 82.163.x.x)',
  },
  {
    id: 'log-002',
    timestamp: '24 Nov 2026, 20:30',
    adminEmail: 'domealuk79812@gmail.com',
    action: 'Delivery Route Update',
    category: 'Orders',
    severity: 'info',
    details: 'Verified London Zones 1–3 coverage for West London sector route dispatch.',
  },
  {
    id: 'log-003',
    timestamp: '24 Nov 2026, 18:45',
    adminEmail: 'admin@vegchennaisrilalitha.co.uk',
    action: 'Student ID Verification Approved',
    category: 'Users',
    severity: 'info',
    details: 'Approved 25% student discount for Imperial College London student (student ID #ICL-8821).',
  },
  {
    id: 'log-004',
    timestamp: '24 Nov 2026, 15:20',
    adminEmail: 'operations@domeal.co.uk',
    action: 'Tiffin Batch Status Changed',
    category: 'Orders',
    severity: 'info',
    details: 'Updated status of 18 Monday orders to "Out for Delivery" on West London loop.',
  },
  {
    id: 'log-005',
    timestamp: '24 Nov 2026, 12:15',
    adminEmail: 'domealuk79812@gmail.com',
    action: 'Menu Item Availability Updated',
    category: 'Menu',
    severity: 'info',
    details: 'Toggled "Chilli Garlic Broccoli Thali" availability to Active on rotating weekly feast.',
  },
  {
    id: 'log-006',
    timestamp: '23 Nov 2026, 19:10',
    adminEmail: 'admin@vegchennaisrilalitha.co.uk',
    action: 'Subscription Renewal Pre-Debit Run',
    category: 'Finance',
    severity: 'info',
    details: 'Automated 48-hour pre-debit notices dispatched to 42 active recurring subscribers.',
  },
];

export default function SuperAdminAuditLogs() {
  const [logs] = useState<AuditLogEntry[]>(INITIAL_LOGS);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.adminEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.details.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory = selectedCategory === 'All' || log.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-border shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-900 border border-blue-200 text-xs font-bold mb-2">
            <FileCode size={13} className="text-blue-600" />
            <span>Immutable Security Audit Log</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-foreground">
            Master Administrative Activity Trail
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1 max-w-2xl">
            Realtime audit log tracking every administrative change, status update, student verification, and platform action.
          </p>
        </div>

        <span className="text-xs font-semibold text-muted-foreground bg-gray-100 px-3 py-1.5 rounded-xl border border-border self-start sm:self-auto">
          {logs.length} Logged Events
        </span>
      </div>

      {/* Filters & Search */}
      <div className="bg-white p-4 rounded-2xl border border-border shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search actions, emails, or notes..."
            className="w-full bg-gray-50 border border-border rounded-xl pl-9 pr-3 py-2 text-xs font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#1E3B2B]"
          />
        </div>

        <div className="flex items-center gap-1.5 flex-wrap w-full sm:w-auto">
          {['All', 'Orders', 'Users', 'Finance', 'Menu', 'System'].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-[#1E3B2B] text-white shadow-xs'
                  : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border border-border'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-white rounded-2xl border border-border shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 text-gray-600 font-bold uppercase tracking-wider text-[10px] border-b border-border">
              <tr>
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Administrator</th>
                <th className="py-3 px-4">Action Executed</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Action Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredLogs.map((entry) => (
                <tr key={entry.id} className="hover:bg-gray-50/70 transition-colors">
                  <td className="py-3.5 px-4 text-gray-500 font-mono text-[11px] whitespace-nowrap">
                    <div className="flex items-center gap-1.5">
                      <Clock size={13} className="text-gray-400" />
                      <span>{entry.timestamp}</span>
                    </div>
                  </td>

                  <td className="py-3.5 px-4 font-semibold text-gray-900 whitespace-nowrap">
                    <div className="flex items-center gap-1.5">
                      <User size={13} className="text-[#C39B54]" />
                      <span>{entry.adminEmail}</span>
                    </div>
                  </td>

                  <td className="py-3.5 px-4 font-bold text-gray-900">
                    {entry.action}
                  </td>

                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-gray-100 text-gray-800 border border-border">
                      {entry.category}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 text-gray-600 font-medium leading-relaxed max-w-md">
                    {entry.details}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
