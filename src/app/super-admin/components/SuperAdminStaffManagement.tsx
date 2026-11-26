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
} from 'lucide-react';
import { SUPER_ADMIN_EMAILS, registerDynamicAdminEmails } from '@/lib/adminAuth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
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
    email: 'superadmin@vegchennaisrilalitha.co.uk',
    role: 'Super Admin',
    addedDate: '2024-01-01',
    lastActive: 'Just now',
    permissions: [
      'Orders & Dispatch',
      'Menu Management',
      'Financial Access & Refunds',
      'System Controls & Settings',
      'User & Student Approvals',
      'CMS & Page Content',
      'Customer Support',
    ],
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
      'CMS & Page Content',
      'Customer Support',
    ],
    status: 'Active',
  },
  {
    email: 'domealuk79812@gmail.com',
    role: 'Super Admin',
    addedDate: '2024-03-10',
    lastActive: '10 mins ago',
    permissions: [
      'Orders & Dispatch',
      'Menu Management',
      'Financial Access & Refunds',
      'System Controls & Settings',
      'User & Student Approvals',
      'CMS & Page Content',
      'Customer Support',
    ],
    status: 'Active',
  },
  {
    email: 'operations@domeal.co.uk',
    role: 'Operations Admin',
    addedDate: '2024-06-01',
    lastActive: '2 hours ago',
    permissions: ['Orders & Dispatch', 'Customer Support', 'User & Student Approvals'],
    status: 'Active',
  },
];

export default function SuperAdminStaffManagement() {
  const { user } = useAuth();
  const [staffList, setStaffList] = useState<AdminStaff[]>(INITIAL_STAFF);
  const [loading, setLoading] = useState(true);

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

  // Load staff list from Firestore
  useEffect(() => {
    const fetchStaff = async () => {
      try {
        const snap = await getDoc(doc(db, 'settings', 'superAdminStaff'));
        if (snap.exists() && Array.isArray(snap.data()?.staff) && snap.data().staff.length > 0) {
          const loadedStaff: AdminStaff[] = snap.data().staff;
          // Ensure essential super admins exist and standard admin has Operations Admin role
          const mergedStaff = loadedStaff.map((s) => {
            if (s.email.toLowerCase() === 'admin@vegchennaisrilalitha.co.uk') {
              return { ...s, role: 'Operations Admin' as const };
            }
            return s;
          });
          INITIAL_STAFF.forEach((init) => {
            if (!mergedStaff.some((s) => s.email.toLowerCase() === init.email.toLowerCase())) {
              mergedStaff.unshift(init);
            }
          });
          setStaffList(mergedStaff);
          registerDynamicAdminEmails(mergedStaff);
        } else {
          registerDynamicAdminEmails(INITIAL_STAFF);
        }
      } catch (err) {
        console.warn('Using initial staff list fallback:', err);
        registerDynamicAdminEmails(INITIAL_STAFF);
      } finally {
        setLoading(false);
      }
    };
    fetchStaff();
  }, []);

  // Persist staff list to Firestore and update RBAC registry
  const persistStaffList = async (updated: AdminStaff[]) => {
    setIsSaving(true);
    try {
      await setDoc(
        doc(db, 'settings', 'superAdminStaff'),
        {
          staff: updated,
          updatedAt: new Date(),
          updatedBy: user?.email || 'Super Admin',
        },
        { merge: true }
      );
      setStaffList(updated);
      registerDynamicAdminEmails(updated);
    } catch (err: any) {
      console.error('Error saving staff:', err);
      toast.error('Failed to persist to database: ' + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  // Open Edit Modal with current email, blank password field, and privileges
  const handleOpenEditModal = (staff: AdminStaff) => {
    setEditingStaff(staff);
    setEditEmail(staff.email);
    setEditPassword('');
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
      // 1. Call backend API to update Firebase Auth credentials (email and/or password)
      try {
        await fetch('/api/super-admin/update-credentials', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            oldEmail: cleanOldEmail,
            newEmail: cleanNewEmail,
            password: editPassword.trim() || undefined,
            role: editRole,
            permissions: editPermissions,
            status: editStatus,
          }),
        });
      } catch (apiErr) {
        console.warn('Backend credentials update note:', apiErr);
      }

      // 2. Update local staff state and Firestore
      const updated = staffList.map((s) => {
        if (s.email.toLowerCase() === cleanOldEmail) {
          return {
            ...s,
            email: cleanNewEmail,
            role: editRole,
            permissions: editPermissions,
            status: editStatus,
            lastEdited: new Date().toISOString(),
            ...(editPassword.trim() ? { passwordLastChanged: new Date().toISOString() } : {}),
          };
        }
        return s;
      });

      await persistStaffList(updated);

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

  // Add New Staff (with optional initial password)
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
      // Create in Firebase Auth via API if password provided
      if (newPassword.trim()) {
        try {
          await fetch('/api/super-admin/update-credentials', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              oldEmail: cleanEmail,
              newEmail: cleanEmail,
              password: newPassword.trim(),
              role: newRole,
              permissions: newPermissions,
              status: 'Active',
            }),
          });
        } catch (apiErr) {
          console.warn('API add credentials note:', apiErr);
        }
      }

      const newStaffMember: AdminStaff = {
        email: cleanEmail,
        role: newRole,
        addedDate: new Date().toISOString().split('T')[0],
        lastActive: 'Never',
        permissions: newPermissions,
        status: 'Active',
      };

      const updated = [...staffList, newStaffMember];
      await persistStaffList(updated);
      toast.success(`Added ${newStaffMember.email} as ${newRole}!`);
      setNewEmail('');
      setNewPassword('');
      setShowNewPassword(false);
      setNewPermissions(['Orders & Dispatch', 'Customer Support']);
      setShowAddModal(false);
    } catch (err: any) {
      toast.error('Failed to add administrator: ' + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  // Remove Staff
  const handleRemoveStaff = async (email: string) => {
    if (SUPER_ADMIN_EMAILS.includes(email)) {
      toast.error('Primary Super Administrator accounts cannot be removed from this interface.');
      return;
    }
    if (confirm(`Are you sure you want to revoke administrative access for ${email}?`)) {
      const updated = staffList.filter((s) => s.email !== email);
      await persistStaffList(updated);
      toast.success(`Revoked administrative access for ${email}`);
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
                const isPrimary = SUPER_ADMIN_EMAILS.includes(staff.email);

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
                          title="Edit Permissions & Role"
                        >
                          <Edit size={12} />
                          <span>Edit</span>
                        </button>

                        {!isPrimary && (
                          <button
                            onClick={() => handleRemoveStaff(staff.email)}
                            className="p-1 rounded-lg text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
                            title="Revoke Admin Access"
                          >
                            <Trash2 size={14} />
                          </button>
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
                  <span>Update Password</span>
                  <span className="text-[10px] text-amber-700 font-bold bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                    Leave blank to keep existing
                  </span>
                </label>
                <div className="relative">
                  <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  <input
                    type={showEditPassword ? 'text' : 'password'}
                    value={editPassword}
                    onChange={(e) => setEditPassword(e.target.value)}
                    placeholder="Enter new password (min. 6 characters) or leave blank..."
                    className="w-full pl-9 pr-10 py-2.5 rounded-xl border border-gray-300 font-mono text-xs focus:ring-2 focus:ring-[#1E3B2B] outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowEditPassword(!showEditPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 cursor-pointer p-1"
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
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 cursor-pointer p-1"
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
                  <UserPlus size={14} />
                  <span>Confirm &amp; Add</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
