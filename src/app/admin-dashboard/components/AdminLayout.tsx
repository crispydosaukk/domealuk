'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  LayoutDashboard,
  ClipboardList,
  UtensilsCrossed,
  Users,
  TrendingUp,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Bell,
  Menu,
  History,
  Loader2,
  CreditCard,
  GraduationCap,
  Building,
  X,
} from 'lucide-react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

const baseNavItems = [
  { id: 'nav-dashboard', label: 'Dashboard', href: '/admin-dashboard', icon: LayoutDashboard },
  {
    id: 'nav-orders',
    label: 'Orders & Menu',
    href: '/order-menu-management-screen',
    icon: ClipboardList,
  },
  { id: 'nav-history', label: 'Order History', href: '/admin-history', icon: History },
  { id: 'nav-customers', label: 'Customers', href: '/admin-customers', icon: Users },
  { id: 'nav-corporate', label: 'Corporate', href: '/admin-corporate', icon: Building },
  { id: 'nav-payments', label: 'Transactions', href: '/admin-payments', icon: CreditCard },
  {
    id: 'nav-student-approvals',
    label: 'Student Approvals',
    href: '/admin-student-approvals',
    icon: GraduationCap,
  },
  { id: 'nav-analytics', label: 'Analytics', href: '/admin-analytics', icon: TrendingUp },
  { id: 'nav-menu', label: 'Menu Management', href: '/admin-menu', icon: UtensilsCrossed },
  { id: 'nav-settings', label: 'Settings', href: '/admin-settings', icon: Settings },
];

interface AdminLayoutProps {
  children: React.ReactNode;
  activeRoute: string;
}

export default function AdminLayout({ children, activeRoute }: AdminLayoutProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [pendingOrders, setPendingOrders] = useState(0);
  const [pendingStudents, setPendingStudents] = useState(0);
  const [pendingCorporate, setPendingCorporate] = useState(0);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const { user, loading, logout } = useAuth();
  const router = useRouter();

  React.useEffect(() => {
    if (!loading && (!user || user.email !== 'domealuk79812@gmail.com')) {
      router.push('/admin-login');
    }
  }, [user, loading, router]);

  React.useEffect(() => {
    if (!user || user.email !== 'domealuk79812@gmail.com') return;

    // Only count orders that are explicitly 'Order Received' or 'Pending' or 'Preparing' or 'Confirmed'
    // Alternatively, just count everything that isn't 'Delivered' or 'Cancelled'
    const q = query(collection(db, 'orders'));
    const unsub = onSnapshot(q, (snap) => {
      let count = 0;
      snap.docs.forEach((doc) => {
        const data = doc.data();
        if (data.status !== 'Delivered' && data.status !== 'Cancelled') {
          count++;
        }
      });
      setPendingOrders(count);
    });
    return () => unsub();
  }, [user]);

  React.useEffect(() => {
    if (!user || user.email !== 'domealuk79812@gmail.com') return;

    const q = query(collection(db, 'users'), where('studentStatus', '==', 'Pending'));
    const unsub = onSnapshot(q, (snap) => {
      setPendingStudents(snap.size);
    });
    return () => unsub();
  }, [user]);

  React.useEffect(() => {
    if (!user || user.email !== 'domealuk79812@gmail.com') return;

    const updateBadgeCount = () => {
      try {
        const { getLocalCorporateInquiries } = require('@/lib/corporateInquiriesStorage');
        const items = getLocalCorporateInquiries();
        const newCount = items.filter((i: any) => i.status === 'New').length;
        setPendingCorporate(newCount);
      } catch (_e) {}
    };

    updateBadgeCount();

    window.addEventListener('domeal-corporate-updated', updateBadgeCount);
    window.addEventListener('storage', updateBadgeCount);

    let unsub = () => {};
    try {
      const q = query(collection(db, 'corporateInquiries'), where('status', '==', 'New'));
      unsub = onSnapshot(
        q,
        (snap) => {
          if (!snap.empty) {
            setPendingCorporate(snap.size);
          }
        },
        (_err) => {
          // Graceful fallback to local storage
        }
      );
    } catch (_err) {}

    return () => {
      window.removeEventListener('domeal-corporate-updated', updateBadgeCount);
      window.removeEventListener('storage', updateBadgeCount);
      unsub();
    };
  }, [user]);

  const navItems = baseNavItems.map((item) => {
    if (item.id === 'nav-orders') {
      const isActive = activeRoute === item.href;
      return {
        ...item,
        badge: pendingOrders > 0 ? pendingOrders.toString() : null,
        badgeColor: isActive ? 'bg-white text-[#1E3B2B]' : 'bg-[#C39B54] text-white',
      };
    }
    if (item.id === 'nav-student-approvals') {
      return {
        ...item,
        badge: pendingStudents > 0 ? pendingStudents.toString() : null,
        badgeColor: 'bg-red-500 text-white',
      };
    }
    if (item.id === 'nav-corporate') {
      return {
        ...item,
        badge: pendingCorporate > 0 ? pendingCorporate.toString() : null,
        badgeColor: 'bg-[#C39B54] text-white',
      };
    }
    return { ...item, badge: null, badgeColor: null };
  });

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/admin-login');
    } catch (err) {
      console.error('Failed to log out:', err);
    }
  };

  if (loading || !user || user.email !== 'domealuk79812@gmail.com') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="animate-spin text-primary w-10 h-10" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:sticky lg:top-0 h-screen z-40 bg-[#1E3B2B] text-white flex flex-col shrink-0 transition-all duration-300 ${
          collapsed ? 'w-16' : 'w-60'
        } ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        {/* Header */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-white/10 shrink-0">
          {!collapsed && (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-white p-1 flex items-center justify-center">
                <Image
                  src="/DOMEAL_Logo.jpg"
                  alt="DoMeal Logo"
                  width={32}
                  height={32}
                  className="w-full h-full object-contain"
                />
              </div>
              <span className="font-700 text-white text-base">DoMeal</span>
            </div>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="hidden lg:flex p-1.5 rounded-lg hover:bg-white/10 text-white/70 hover:text-white transition-colors"
          >
            <ChevronLeft
              size={18}
              className={`transition-transform duration-300 ${collapsed ? 'rotate-180' : ''}`}
            />
          </button>
          <button
            onClick={() => setMobileOpen(false)}
            className="lg:hidden p-1.5 rounded-lg hover:bg-white/10 text-white/70 hover:text-white"
          >
            <X size={18} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          <p className={`text-[10px] font-700 text-[#C39B54] uppercase tracking-wider px-3 mb-2 ${collapsed ? 'hidden' : 'block'}`}>
            Navigation
          </p>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeRoute === item.href;
            return (
              <Link
                key={item.id}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-150 ${
                  isActive
                    ? 'bg-[#C39B54] text-white font-600 shadow-md'
                    : 'text-white/70 hover:bg-white/10 hover:text-white font-500'
                } ${collapsed ? 'justify-center' : ''}`}
                title={collapsed ? item.label : undefined}
              >
                <Icon size={18} className="shrink-0" />
                {!collapsed && (
                  <>
                    <span className="flex-1 text-sm">{item.label}</span>
                    {item.badge && (
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full font-700 ${item.badgeColor || 'bg-[#C39B54] text-white'}`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </>
                )}
              </Link>
            );
          })}


        </nav>

        <div className="border-t border-white/10 p-3 shrink-0 bg-[#1E3B2B]">
          <button
            onClick={() => setShowLogoutConfirm(true)}
            className={`flex w-full items-center gap-3 px-3 py-2 rounded-xl text-red-300 hover:text-red-100 hover:bg-red-500/20 transition-colors ${collapsed ? 'justify-center' : ''}`}
            title={collapsed ? 'Sign Out' : undefined}
          >
            <LogOut size={18} className="text-red-400 shrink-0" />
            {!collapsed && <span className="text-sm font-700">Sign Out</span>}
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div
        className={`flex-1 flex flex-col transition-all duration-300 min-w-0`}
      >
        {/* Topbar */}
        <header className="h-16 bg-white border-b border-border flex items-center justify-between px-4 lg:px-6 sticky top-0 z-30 shadow-sm">
          <button
            onClick={() => setMobileOpen(true)}
            className="lg:hidden p-2 rounded-lg hover:bg-muted transition-colors"
          >
            <Menu size={20} />
          </button>
          <div className="hidden lg:block">
            <p className="text-sm font-600 text-foreground">Good morning, Admin 👋</p>
            <p className="text-xs text-muted-foreground">DoMeal · domeal.co.uk · London</p>
          </div>
          <div className="flex items-center gap-3 ml-auto">
            <button className="relative p-2 rounded-lg hover:bg-muted transition-colors">
              <Bell size={18} className="text-foreground" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-[#C39B54] rounded-full" />
            </button>
            <Link
              href="/"
              className="text-xs font-600 text-primary bg-blue-50 px-3 py-1.5 rounded-lg hover:bg-blue-100 transition-colors"
            >
              View Site
            </Link>
            <button
              onClick={() => setShowLogoutConfirm(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 text-xs font-700 transition-colors cursor-pointer"
            >
              <LogOut size={14} />
              <span>Sign Out</span>
            </button>
          </div>
        </header>

        <main className="flex-1 p-4 lg:p-6 xl:p-8 overflow-auto">{children}</main>
      </div>

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full space-y-4 shadow-2xl text-center">
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">
              <LogOut className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Sign Out of Admin Panel?</h3>
            <p className="text-xs text-slate-500">You will be logged out of your session and returned to the admin login screen.</p>
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="flex-1 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-600 text-xs hover:bg-slate-50 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleLogout}
                className="flex-1 py-2.5 rounded-xl bg-red-600 text-white font-600 text-xs hover:bg-red-700 transition-all shadow-md"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
