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
    return { ...item, badge: null, badgeColor: null };
  });

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
        className={`fixed top-0 left-0 h-full z-50 flex flex-col transition-all duration-300 ease-in-out
        ${collapsed ? 'w-16' : 'w-60'}
        ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}
        style={{ background: 'linear-gradient(180deg, #1E3B2B 0%, #10261A 60%, #1E3B2B 100%)' }}
      >
        {/* Sidebar header */}
        <div
          className={`flex items-center border-b border-white/10 h-16 px-3 ${collapsed ? 'justify-center' : 'justify-between'}`}
        >
          {!collapsed && (
            <div className="flex items-center gap-2 overflow-hidden">
              <div className="w-9 h-9 rounded-full overflow-hidden border-2 border-white/20 shrink-0">
                <Image
                  src="/DOMEAL_Logo.jpg"
                  alt="DoMeal logo"
                  width={36}
                  height={36}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="min-w-0">
                <p className="font-800 text-sm text-white truncate">DoMeal</p>
                <p className="text-xs text-blue-300">Admin Panel</p>
              </div>
            </div>
          )}
          {collapsed && (
            <div className="w-9 h-9 rounded-full overflow-hidden border-2 border-white/20">
              <Image
                src="/DOMEAL_Logo.jpg"
                alt="DoMeal logo"
                width={36}
                height={36}
                className="w-full h-full object-cover"
              />
            </div>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="hidden lg:flex w-7 h-7 rounded-lg bg-white/10 hover:bg-white/20 items-center justify-center transition-colors shrink-0"
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? (
              <ChevronRight size={14} className="text-white" />
            ) : (
              <ChevronLeft size={14} className="text-white" />
            )}
          </button>
        </div>

        {!collapsed && (
          <div className="px-3 pt-3">
            <p className="text-xs font-700 uppercase tracking-widest text-blue-300/60 px-3 mb-2">
              Navigation
            </p>
          </div>
        )}

        <nav className="flex-1 px-2 py-2 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = activeRoute === item.href;
            return (
              <Link
                key={item.id}
                href={item.href}
                title={collapsed ? item.label : undefined}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-150 group relative
                  ${isActive ? 'bg-[#C39B54] text-white' : 'text-blue-100 hover:bg-white/10 hover:text-white'}
                  ${collapsed ? 'justify-center' : ''}
                `}
              >
                <item.icon size={18} className="shrink-0" />
                {!collapsed && (
                  <>
                    <span className="text-sm font-600 flex-1">{item.label}</span>
                    {item.badge && (
                      <span
                        className={`${item.badgeColor || 'bg-[#C39B54] text-white'} text-xs font-700 w-5 h-5 rounded-full flex items-center justify-center shrink-0`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </>
                )}
                {collapsed && item.badge && (
                  <span
                    className={`absolute top-1 right-1 w-2 h-2 ${item.badgeColor?.split(' ')[0] || 'bg-[#C39B54]'} rounded-full`}
                  />
                )}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-white/10 p-3">
          <div className={`flex items-center gap-3 px-3 py-2 ${collapsed ? 'justify-center' : ''}`}>
            <div className="w-8 h-8 rounded-full bg-[#C39B54] flex items-center justify-center text-white text-xs font-700 shrink-0">
              DW
            </div>
            {!collapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-600 text-white truncate">DoMeal Admin</p>
                <p className="text-xs text-blue-300">admin@domeal.co.uk</p>
              </div>
            )}
          </div>
          <button
            onClick={() => setShowLogoutConfirm(true)}
            className={`flex w-full items-center gap-3 px-3 py-2 mt-1 rounded-xl text-blue-200 hover:text-red-400 hover:bg-white/5 transition-colors ${collapsed ? 'justify-center' : ''}`}
            title={collapsed ? 'Sign Out' : undefined}
          >
            <LogOut size={16} />
            {!collapsed && <span className="text-sm font-600">Sign Out</span>}
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div
        className={`flex-1 flex flex-col transition-all duration-300 ${collapsed ? 'lg:ml-16' : 'lg:ml-60'}`}
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
          </div>
        </header>

        <main className="flex-1 p-4 lg:p-6 xl:p-8 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
