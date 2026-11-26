'use client';

import React, { useState, useEffect } from 'react';
import {
  Users,
  ShieldCheck,
  Crown,
  UserPlus,
  KeyRound,
  CheckCircle2,
  Trash2,
  Mail,
  Shield,
  Info,
  Edit,
  Save,
  X,
  Lock,
  Check,
  Eye,
  EyeOff,
  Copy,
} from 'lucide-react';
import { SUPER_ADMIN_EMAILS, registerDynamicAdminEmails } from '@/lib/adminAuth';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';

export interface AdminStaff {
  email: string;
  role: 'Super Admin' | 'Operations Admin' | 'Menu Editor';
  addedDate: string;
  lastActive: string;
  permissions: string[];
  status?: 'Active' | 'Suspended';
  initialPassword?: string;
}

const AVAILABLE_PERMISSIONS = [
  'Orders & Dispatch',
  'Menu Management',
  'Financial Access & Refunds',
  'System Controls & Settings',
  'User & Student Approvals',
  'CMS & Page Content',
  'Customer Support',
];

const INITIAL_STAFF: AdminStaff[] = [
  {
    email: 'superadmin@domeal.co.uk',
    role: 'Super Admin',
    addedDate: '2024-03-10',
    lastActive: 'Just now',
    permissions: AVAILABLE_PERMISSIONS,
    status: 'Active',
  },
  {
    email: 'admin@vegchennaisrilalitha.co.uk',
    role: 'Operations Admin',
    addedDate: '2024-01-15',
    lastActive: 'Just now',
    permissions: [
      'Orders & Dispatch',
      'Menu Management',
      'User & Student Approvals',
      'Customer Support',
    ],
    status: 'Active',
  },
];

export default function SuperAdminStaffManagement() {
  const { user } = useAuth();
  const [staffList, setStaffList] = useState<AdminStaff[]>(INITIAL_STAFF);
  const [loading, setLoading] = useState(true);

  // Password visibility state in table
  const [visiblePasswords, setVisiblePasswords] = useState<Record<string, boolean>>({});
  const [copiedEmail, setCopiedEmail] = useState<string | null>(null);

  // Add Staff Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [newRole, setNewRole] = useState<'Operations Admin' | 'Menu Editor' | 'Super Admin'>('Operations Admin');
  const [newPermissions, setNewPermissions] = useState<string[]>([
    'Orders & Dispatch',
    'Customer Support',
  ]);

  // Edit Staff Modal State (with Email & Password Editing)
  const [editingStaff, setEditingStaff] = useState<AdminStaff | null>(null);
  const [editEmail, setEditEmail] = useState('');
  const [editPassword, setEditPassword] = useState('');
  const [showEditPassword, setShowEditPassword] = useState(false);
  const [editRole, setEditRole] = useState<'Super Admin' | 'Operations Admin' | 'Menu Editor'>('Operations Admin');
  const [editPermissions, setEditPermissions] = useState<string[]>([]);
  const [editStatus, setEditStatus] = useState<'Active' | 'Suspended'>('Active');
  const [isSaving, setIsSaving] = useState(false);

  // Delete Confirmation Modal State
  const [deletingStaff, setDeletingStaff] = useState<AdminStaff | null>(null);

  const togglePasswordVisibility = (email: string) => {
    setVisiblePasswords((prev) => ({
      ...prev,
      [email]: !prev[email],
    }));
  };

  const copyToClipboard = (text: string, email: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedEmail(email);
    toast.success(`Copied password for ${email}`);
    setTimeout(() => {
      setCopiedEmail(null);
    }, 2000);
  };

  // Load staff list from API (with Firestore client fallback)
  useEffect(() => {
    const fetchStaff = async () => {
      try {
        const apiRes = await fetch('/api/super-admin/update-credentials');
        if (apiRes.ok) {
          const data = await apiRes.json();
          if (Array.isArray(data.staff) && data.staff.length > 0) {
            setStaffList(data.staff);
            registerDynamicAdminEmails(data.staff);
            setLoading(false);
            return;
          }
        }
      } catch (apiErr) {
        console.warn('API fetch staff fallback to client:', apiErr);
      }

      try {
        const snap = await getDoc(doc(db, 'settings', 'superAdminStaff'));
        if (snap.exists() && Array.isArray(snap.data()?.staff)) {
          const loadedStaff: AdminStaff[] = snap.data().staff;
          setStaffList(loadedStaff);
          registerDynamicAdminEmails(loadedStaff);
        } else {
          setStaffList(INITIAL_STAFF);
          registerDynamicAdminEmails(INITIAL_STAFF);
        }
      } catch (err) {
        console.warn('Using initial staff list fallback:', err);
        setStaffList(INITIAL_STAFF);
        registerDynamicAdminEmails(INITIAL_STAFF);
      } finally {
        setLoading(false);
      }
    };
    fetchStaff();
  }, []);

  // Persist staff list via backend Admin API directly
  const persistStaffList = async (updated: AdminStaff[]) => {
    setIsSaving(true);
    try {
      const res = await fetch('/api/super-admin/update-credentials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'sync_all',
          staffList: updated,
          updatedBy: user?.email || 'Super Admin',
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || 'Server failed to save staff list');
      }

      setStaffList(updated);
      registerDynamicAdminEmails(updated);
    } catch (err: any) {
      console.error('Error saving staff:', err);
      toast.error('Failed to persist to database: ' + err.message);
      throw err;
    } finally {
      setIsSaving(false);
    }
  };

  // Open Edit Modal with current email, password, and privileges
  const handleOpenEditModal = (staff: AdminStaff) => {
    setEditingStaff(staff);
    setEditEmail(staff.email);
    setEditPassword(staff.initialPassword || '');
    setShowEditPassword(false);
    setEditRole(staff.role);
    setEditPermissions(staff.permissions || []);
    setEditStatus(staff.status || 'Active');
  };

  // Save Staff Edits (Email, Password, Role, Status, Permissions)
  const handleSaveStaffEdits = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStaff) return;

    const cleanOldEmail = editingStaff.email.trim().toLowerCase();
    const cleanNewEmail = editEmail.trim().toLowerCase();

    if (!cleanNewEmail || !cleanNewEmail.includes('@')) {
      toast.error('Please enter a valid administrator email address.');
      return;
    }

    // Check if new email conflicts with another staff member
    if (cleanNewEmail !== cleanOldEmail) {
      const emailConflict = staffList.some(
        (s) => s.email.toLowerCase() === cleanNewEmail && s.email.toLowerCase() !== cleanOldEmail
      );
      if (emailConflict) {
        toast.error('Another administrator is already using this email address.');
        return;
      }
    }

    // Validate password if provided
    if (editPassword.trim() && editPassword.trim().length < 6) {
      toast.error('Password must be at least 6 characters long.');
      return;
    }

    setIsSaving(true);

    try {
      const res = await fetch('/api/super-admin/update-credentials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update',
          oldEmail: cleanOldEmail,
          newEmail: cleanNewEmail,
          password: editPassword.trim() || undefined,
          role: editRole,
          permissions: editPermissions,
          status: editStatus,
          updatedBy: user?.email || 'Super Admin',
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to update credentials');
      }

      const updated = Array.isArray(data.staff) && data.staff.length > 0
        ? data.staff
        : staffList.map((s) => {
            if (s.email.toLowerCase() === cleanOldEmail) {
              return {
                ...s,
                email: cleanNewEmail,
                role: editRole,
                permissions: editPermissions,
                status: editStatus,
                lastEdited: new Date().toISOString(),
                ...(editPassword.trim()
                  ? { initialPassword: editPassword.trim(), passwordLastChanged: new Date().toISOString() }
                  : {}),
              };
            }
            return s;
          });

      setStaffList(updated);
      registerDynamicAdminEmails(updated);

      toast.success(
        editPassword.trim()
          ? `Updated email, password, and privileges for ${cleanNewEmail}!`
          : cleanNewEmail !== cleanOldEmail
          ? `Updated email to ${cleanNewEmail} and saved privileges!`
          : `Updated privileges for ${cleanNewEmail}!`
      );
      setEditingStaff(null);
    } catch (err: any) {
      console.error('Error saving staff edits:', err);
      toast.error('Failed to save changes: ' + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  // Add New Staff (single fast atomic API call)
  const handleAddStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail.trim()) return;

    const cleanEmail = newEmail.trim().toLowerCase();
    const exists = staffList.some((s) => s.email.toLowerCase() === cleanEmail);
    if (exists) {
      toast.error('This administrator email is already registered.');
      return;
    }

    if (newPassword.trim() && newPassword.trim().length < 6) {
      toast.error('Password must be at least 6 characters.');
      return;
    }

    setIsSaving(true);

    try {
      const res = await fetch('/api/super-admin/update-credentials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'add',
          oldEmail: cleanEmail,
          newEmail: cleanEmail,
          password: newPassword.trim() || undefined,
          role: newRole,
          permissions: newPermissions,
          status: 'Active',
          updatedBy: user?.email || 'Super Admin',
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to add administrator');
      }

      let updated: AdminStaff[];
      if (Array.isArray(data.staff) && data.staff.length > 0) {
        updated = data.staff;
      } else {
        const newStaffMember: AdminStaff = {
          email: cleanEmail,
          role: newRole,
          addedDate: new Date().toISOString().split('T')[0],
          lastActive: 'Never',
          permissions: newPermissions,
          status: 'Active',
          initialPassword: newPassword.trim() || undefined,
        };
        updated = [...staffList, newStaffMember];
      }

      setStaffList(updated);
      registerDynamicAdminEmails(updated);
      toast.success(`Added ${cleanEmail} as ${newRole}!`);
      setNewEmail('');
      setNewPassword('');
      setShowNewPassword(false);
      setNewPermissions(['Orders & Dispatch', 'Customer Support']);
      setShowAddModal(false);
    } catch (err: any) {
      console.error('Error adding administrator:', err);
      toast.error('Failed to add administrator: ' + (err.message || 'Unknown error'));
    } finally {
      setIsSaving(false);
    }
  };

  // Trigger Staff Deletion Modal
  const handleRemoveStaff = (staff: AdminStaff) => {
    if (user?.email && staff.email.toLowerCase() === user.email.toLowerCase()) {
      toast.error('You cannot delete your own active administrator account.');
      return;
    }
    setDeletingStaff(staff);
  };

  // Permanently Revoke Access & Remove Staff (single fast atomic API call)
  const confirmDeleteStaff = async () => {
    if (!deletingStaff) return;
    const targetEmail = deletingStaff.email;
    setIsSaving(true);

    try {
      const res = await fetch('/api/super-admin/update-credentials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete', oldEmail: targetEmail }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to revoke access');
      }

      const updated = Array.isArray(data.staff)
        ? data.staff
        : staffList.filter((s) => s.email.toLowerCase() !== targetEmail.toLowerCase());

      setStaffList(updated);
      registerDynamicAdminEmails(updated);
      toast.success(`Revoked administrative access for ${targetEmail}`);
      setDeletingStaff(null);
    } catch (err: any) {
      console.error('Error deleting administrator:', err);
      toast.error('Failed to revoke access: ' + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const togglePermission = (
    perm: string,
    list: string[],
    setList: React.Dispatch<React.SetStateAction<string[]>>
  ) => {
    if (list.includes(perm)) {
      setList(list.filter((p) => p !== perm));
    } else {
      setList([...list, perm]);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Overview Card */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-border shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-900 border border-amber-200 text-xs font-bold mb-2">
            <KeyRound size={13} className="text-[#C39B54]" />
            <span>Role-Based Access Control (RBAC) &bull; Live Editable</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-foreground">
            Admin Staff &amp; Privilege Management
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1 max-w-2xl">
            Control which team members have operational admin rights vs. executive Super Admin privileges.
            Assign granular feature permissions with instant live effect.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2.5 rounded-xl bg-[#1E3B2B] hover:bg-[#284f3a] text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-md active:scale-95 cursor-pointer shrink-0"
        >
          <UserPlus size={15} />
          <span>Add Admin User</span>
        </button>
      </div>

      {/* Staff Roster Table with Edit Actions */}
      <div className="bg-white rounded-2xl border border-border shadow-xs overflow-hidden">
        <div className="p-5 border-b border-border flex items-center justify-between">
          <div>
            <h3 className="font-bold text-foreground text-sm">Registered Administrative Staff</h3>
            <p className="text-xs text-muted-foreground">
              {staffList.length} authenticated administrators with platform permissions
            </p>
          </div>
          <span className="text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">
            Firestore Synchronized
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 text-gray-600 font-bold uppercase tracking-wider text-[10px] border-b border-border">
              <tr>
                <th className="py-3 px-4">Administrator Email</th>
                <th className="py-3 px-4">Password</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4">Granular Permissions</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Added Date</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {staffList.map((staff) => {
                const isSuper = staff.role === 'Super Admin';
                const isCurrentUser = user?.email
                  ? staff.email.toLowerCase() === user.email.toLowerCase()
                  : false;
                const isPrimary = staff.email.toLowerCase() === 'superadmin@domeal.co.uk';

                return (
                  <tr key={staff.email} className="hover:bg-gray-50/70 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold ${
                            isSuper ? 'bg-[#1E3B2B] text-white' : 'bg-gray-100 text-gray-700'
                          }`}
                        >
                          {staff.email.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-bold text-gray-900 flex items-center gap-1.5">
                            <span>{staff.email}</span>
                            {isPrimary && (
                              <span title="Primary Super Admin">
                                <Crown size={12} className="text-[#C39B54]" />
                              </span>
                            )}
                          </div>
                          <div className="text-[10px] text-gray-400">Active credentials</div>
                        </div>
                      </div>
                    </td>

                    {/* Password display with Show/Hide and Copy */}
                    <td className="py-3.5 px-4">
                      {staff.initialPassword ? (
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono text-[11px] bg-gray-100 text-gray-800 px-2 py-0.5 rounded border border-gray-200">
                            {visiblePasswords[staff.email] ? staff.initialPassword : '••••••••'}
                          </span>
                          <button
                            type="button"
                            onClick={() => togglePasswordVisibility(staff.email)}
                            className="p-1 text-gray-400 hover:text-gray-700 rounded hover:bg-gray-100 transition-colors cursor-pointer"
                            title={visiblePasswords[staff.email] ? 'Hide password' : 'Show password'}
                          >
                            {visiblePasswords[staff.email] ? <EyeOff size={13} /> : <Eye size={13} />}
                          </button>
                          <button
                            type="button"
                            onClick={() => copyToClipboard(staff.initialPassword!, staff.email)}
                            className="p-1 text-gray-400 hover:text-gray-700 rounded hover:bg-gray-100 transition-colors cursor-pointer"
                            title="Copy password"
                          >
                            {copiedEmail === staff.email ? (
                              <Check size={13} className="text-emerald-600" />
                            ) : (
                              <Copy size={13} />
                            )}
                          </button>
                        </div>
                      ) : (
                        <span className="text-[10px] text-gray-400 italic">Auth Managed</span>
                      )}
                    </td>

                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          staff.role === 'Super Admin'
                            ? 'bg-purple-100 text-purple-800 border border-purple-200'
                            : staff.role === 'Operations Admin'
                            ? 'bg-blue-100 text-blue-800 border border-blue-200'
                            : 'bg-amber-100 text-amber-800 border border-amber-200'
                        }`}
                      >
                        {staff.role === 'Super Admin' && <Crown size={11} />}
                        {staff.role}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="flex flex-wrap gap-1 max-w-xs">
                        {staff.permissions?.map((p, pIdx) => (
                          <span
                            key={pIdx}
                            className="px-2 py-0.5 rounded-md bg-gray-100 text-gray-700 text-[10px] font-medium"
                          >
                            {p}
                          </span>
                        ))}
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          staff.status === 'Suspended'
                            ? 'bg-red-100 text-red-700'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {staff.status || 'Active'}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-gray-500 font-mono text-[11px]">
                      {staff.addedDate}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenEditModal(staff)}
                          className="px-2.5 py-1 rounded-lg text-[#1E3B2B] bg-[#1E3B2B]/5 hover:bg-[#1E3B2B] hover:text-white transition-all text-xs font-bold flex items-center gap-1 cursor-pointer"
                          title="Edit Administrator"
                        >
                          <Edit size={12} />
                          <span>Edit</span>
                        </button>

                        {!isCurrentUser ? (
                          <button
                            onClick={() => handleRemoveStaff(staff)}
                            className="p-1 rounded-lg text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
                            title="Delete Administrator"
                          >
                            <Trash2 size={14} />
                          </button>
                        ) : (
                          <span className="text-[10px] text-gray-400 font-semibold px-2 py-0.5 bg-gray-100 rounded">
                            You
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Staff Modal */}
      {editingStaff && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full space-y-4 shadow-2xl border border-border">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-[#1E3B2B]/10 text-[#1E3B2B] flex items-center justify-center">
                  <Edit size={18} />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-base">Edit Administrator Privileges</h3>
                  <p className="text-xs text-muted-foreground font-mono">{editingStaff.email}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEditingStaff(null)}
                className="p-1 rounded-lg text-gray-400 hover:text-gray-700 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveStaffEdits} className="space-y-4 text-xs">
              {/* 1. Editable Administrator Email */}
              <div>
                <label className="block text-gray-700 font-bold mb-1 flex items-center justify-between">
                  <span>Administrator Email</span>
                  <span className="text-[10px] text-gray-400 font-normal">Active login identifier</span>
                </label>
                <div className="relative">
                  <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  <input
                    type="email"
                    required
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                    placeholder="admin@domeal.co.uk"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-gray-300 font-semibold text-xs focus:ring-2 focus:ring-[#1E3B2B] outline-none"
                  />
                </div>
              </div>

              {/* 2. Editable Administrator Password */}
              <div>
                <label className="block text-gray-700 font-bold mb-1 flex items-center justify-between">
                  <span>Password</span>
                  <span className="text-[10px] text-amber-700 font-bold bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                    {editingStaff.initialPassword ? 'Current or new password' : 'Leave blank to keep existing'}
                  </span>
                </label>
                <div className="relative">
                  <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  <input
                    type={showEditPassword ? 'text' : 'password'}
                    value={editPassword}
                    onChange={(e) => setEditPassword(e.target.value)}
                    placeholder="Enter password (min. 6 characters)..."
                    className="w-full pl-9 pr-10 py-2.5 rounded-xl border border-gray-300 font-mono text-xs focus:ring-2 focus:ring-[#1E3B2B] outline-none"
                  />
                  <button
                    type="button"
                    tabIndex={-1}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setShowEditPassword(!showEditPassword);
                    }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 cursor-pointer p-1.5 z-10 select-none"
                    title={showEditPassword ? 'Hide password' : 'Show password'}
                  >
                    {showEditPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
                <p className="text-[10px] text-muted-foreground mt-1">
                  Updating this field immediately syncs the administrator&apos;s password credentials.
                </p>
              </div>

              {/* 3. Assigned Role and Status */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-700 font-bold mb-1">Assigned Role</label>
                  <select
                    value={editRole}
                    onChange={(e) => setEditRole(e.target.value as any)}
                    className="w-full p-2.5 rounded-xl border border-gray-300 font-semibold text-xs focus:ring-2 focus:ring-[#1E3B2B] outline-none cursor-pointer"
                  >
                    <option value="Operations Admin">Operations Admin</option>
                    <option value="Menu Editor">Menu Editor</option>
                    <option value="Super Admin">Super Admin (Executive)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-gray-700 font-bold mb-1">Account Status</label>
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value as any)}
                    className="w-full p-2.5 rounded-xl border border-gray-300 font-semibold text-xs focus:ring-2 focus:ring-[#1E3B2B] outline-none cursor-pointer"
                  >
                    <option value="Active">Active</option>
                    <option value="Suspended">Suspended</option>
                  </select>
                </div>
              </div>

              {/* 4. Granular Permissions */}
              <div>
                <label className="block text-gray-700 font-bold mb-2">Granular Module Permissions</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 bg-gray-50 p-3 rounded-2xl border border-border">
                  {AVAILABLE_PERMISSIONS.map((perm) => (
                    <label key={perm} className="flex items-center gap-2 cursor-pointer p-1.5 rounded-lg hover:bg-white transition-colors">
                      <input
                        type="checkbox"
                        checked={editPermissions.includes(perm)}
                        onChange={() => togglePermission(perm, editPermissions, setEditPermissions)}
                        className="rounded border-gray-300 text-[#1E3B2B] focus:ring-[#1E3B2B]"
                      />
                      <span className="text-xs font-semibold text-gray-800">{perm}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-border">
                <button
                  type="button"
                  onClick={() => setEditingStaff(null)}
                  className="px-4 py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2.5 rounded-xl bg-[#1E3B2B] hover:bg-[#284f3a] text-white text-xs font-extrabold flex items-center gap-1.5 transition-all shadow-md active:scale-95 cursor-pointer disabled:opacity-50"
                >
                  {isSaving ? (
                    <>
                      <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Save size={14} />
                      <span>Save Changes</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Staff Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full space-y-4 shadow-2xl border border-border">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-[#1E3B2B]/10 text-[#1E3B2B] flex items-center justify-center">
                  <UserPlus size={18} />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-base">Grant Administrator Access</h3>
                  <p className="text-xs text-muted-foreground">Add new staff credentials to platform RBAC</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="p-1 rounded-lg text-gray-400 hover:text-gray-700 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddStaff} className="space-y-4 text-xs">
              <div>
                <label className="block text-gray-700 font-bold mb-1">Administrator Email</label>
                <div className="relative">
                  <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  <input
                    type="email"
                    required
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    placeholder="e.g. manager@domeal.co.uk"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-gray-300 text-xs focus:ring-2 focus:ring-[#1E3B2B] outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-700 font-bold mb-1">Set Password (Optional)</label>
                <div className="relative">
                  <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Initial account password (min. 6 chars)..."
                    className="w-full pl-9 pr-10 py-2.5 rounded-xl border border-gray-300 font-mono text-xs focus:ring-2 focus:ring-[#1E3B2B] outline-none"
                  />
                  <button
                    type="button"
                    tabIndex={-1}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setShowNewPassword(!showNewPassword);
                    }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 cursor-pointer p-1.5 z-10 select-none"
                    title={showNewPassword ? 'Hide password' : 'Show password'}
                  >
                    {showNewPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-gray-700 font-bold mb-1">Role Type</label>
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value as any)}
                  className="w-full p-2.5 rounded-xl border border-gray-300 font-semibold text-xs focus:ring-2 focus:ring-[#1E3B2B] outline-none cursor-pointer"
                >
                  <option value="Operations Admin">Operations Admin</option>
                  <option value="Menu Editor">Menu Editor</option>
                  <option value="Super Admin">Super Admin</option>
                </select>
              </div>

              <div>
                <label className="block text-gray-700 font-bold mb-2">Assign Permissions</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 bg-gray-50 p-3 rounded-2xl border border-border">
                  {AVAILABLE_PERMISSIONS.map((perm) => (
                    <label key={perm} className="flex items-center gap-2 cursor-pointer p-1.5 rounded-lg hover:bg-white transition-colors">
                      <input
                        type="checkbox"
                        checked={newPermissions.includes(perm)}
                        onChange={() => togglePermission(perm, newPermissions, setNewPermissions)}
                        className="rounded border-gray-300 text-[#1E3B2B] focus:ring-[#1E3B2B]"
                      />
                      <span className="text-xs font-semibold text-gray-800">{perm}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-border">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2.5 rounded-xl bg-[#1E3B2B] hover:bg-[#284f3a] text-white text-xs font-extrabold flex items-center gap-1.5 transition-all shadow-md active:scale-95 cursor-pointer disabled:opacity-50"
                >
                  {isSaving ? (
                    <>
                      <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Adding...</span>
                    </>
                  ) : (
                    <>
                      <UserPlus size={14} />
                      <span>Confirm &amp; Add</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Staff Confirmation Modal */}
      {deletingStaff && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full space-y-4 shadow-xl text-center">
            <div className="w-12 h-12 rounded-full bg-red-50 text-red-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-gray-900">Are you sure to delete?</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Are you sure you want to permanently delete <span className="font-bold text-gray-900 break-all">{deletingStaff.email}</span>? This will revoke all administrative access to the platform.
            </p>
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeletingStaff(null)}
                disabled={isSaving}
                className="flex-1 py-2.5 rounded-xl border border-border text-gray-700 font-semibold text-xs hover:bg-gray-50 transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDeleteStaff}
                disabled={isSaving}
                className="flex-1 py-2.5 rounded-xl bg-red-600 text-white font-semibold text-xs hover:bg-red-700 transition-all shadow-sm cursor-pointer disabled:opacity-50"
              >
                {isSaving ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
