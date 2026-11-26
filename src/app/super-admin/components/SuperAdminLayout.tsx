'use client';

import React, { useState, useEffect } from 'react';
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
  Bell,
  Menu,
  History,
  Loader2,
  CreditCard,
  GraduationCap,
  Building,
  FileText,
  X,
  Globe,
  ShieldCheck,
  Crown,
  KeyRound,
  Sliders,
  FileCode,
  ArrowUpRight,
  MapPin,
} from 'lucide-react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { isSuperAdminEmail, isAdminEmail, getTimeGreeting } from '@/lib/adminAuth';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

export interface SuperAdminNavSection {
  title: string;
  items: {
    id: string;
    label: string;
    href: string;
    icon: React.ComponentType<{ size?: number; className?: string }>;
    badge?: string | null;
    badgeColor?: string | null;
    isSuperExclusive?: boolean;
  }[];
}

interface SuperAdminLayoutProps {
  children: React.ReactNode;
  activeTab?: string;
}

export default function SuperAdminLayout({ children, activeTab = 'overview' }: SuperAdminLayoutProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [pendingOrders, setPendingOrders] = useState(0);
  const [pendingStudents, setPendingStudents] = useState(0);
  const [pendingCorporate, setPendingCorporate] = useState(0);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [greeting, setGreeting] = useState<string>('Good day');
  const [mounted, setMounted] = useState(false);
  const [cachedSuperAdmin, setCachedSuperAdmin] = useState<boolean>(false);
  const { user, loading, logout } = useAuth();
  const router = useRouter();

  // Mark component mounted to guarantee server-client hydration parity
  useEffect(() => {
    setMounted(true);
    if (typeof window !== 'undefined') {
      const directEmail = auth?.currentUser?.email;
      if (directEmail && isSuperAdminEmail(directEmail)) {
        setCachedSuperAdmin(true);
        try {
          sessionStorage.setItem('domeal_superadmin_session', directEmail);
        } catch {}
      } else {
        const cached = sessionStorage.getItem('domeal_superadmin_session');
        if (cached && isSuperAdminEmail(cached)) {
          setCachedSuperAdmin(true);
        }
      }
    }
  }, []);

  useEffect(() => {
    const activeEmail = user?.email || auth?.currentUser?.email;
    if (activeEmail && isSuperAdminEmail(activeEmail)) {
      setCachedSuperAdmin(true);
      try {
        sessionStorage.setItem('domeal_superadmin_session', activeEmail);
      } catch {}
    }
  }, [user]);

  // Dynamic system greeting based on time of day
  useEffect(() => {
    setGreeting(getTimeGreeting());
    const timer = setInterval(() => {
      setGreeting(getTimeGreeting());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  // Route security: Only Super Admin emails allowed
  useEffect(() => {
    if (!mounted || loading) return;

    const activeUser = user || auth?.currentUser;
    const cached = typeof window !== 'undefined' ? sessionStorage.getItem('domeal_superadmin_session') : null;
    const isCachedOk = cached ? isSuperAdminEmail(cached) : false;

    if (!activeUser) {
      if (!cachedSuperAdmin && !isCachedOk) {
        router.push('/super-admin-login');
      }
    } else if (!isSuperAdminEmail(activeUser.email)) {
      try {
        sessionStorage.removeItem('domeal_superadmin_session');
      } catch {}
      if (isAdminEmail(activeUser.email)) {
        router.push('/admin-dashboard');
      } else {
        router.push('/super-admin-login');
      }
    }
  }, [mounted, user, loading, cachedSuperAdmin, router]);

  // Realtime badge listeners
  useEffect(() => {
    if (!user || !isSuperAdminEmail(user.email)) return;

    // 1. Pending Orders
    const qOrders = query(collection(db, 'orders'));
    const unsubOrders = onSnapshot(
      qOrders,
      (snap) => {
        let count = 0;
        snap.docs.forEach((doc) => {
          const data = doc.data();
          if (data.status !== 'Delivered' && data.status !== 'Cancelled') {
            count++;
          }
        });
        setPendingOrders(count);
      },
      (err) => {
        console.warn('SuperAdminLayout orders snapshot handled:', err.message);
      }
    );

    // 2. Pending Student Approvals
    const qStudents = query(collection(db, 'users'), where('studentStatus', '==', 'Pending'));
    const unsubStudents = onSnapshot(
      qStudents,
      (snap) => {
        setPendingStudents(snap.size);
      },
      (err) => {
        console.warn('SuperAdminLayout students snapshot handled:', err.message);
      }
    );

    // 3. Corporate Inquiries
    let unsubCorp = () => {};
    try {
      const qCorp = query(collection(db, 'corporateInquiries'), where('status', '==', 'New'));
      unsubCorp = onSnapshot(
        qCorp,
        (snap) => {
          setPendingCorporate(snap.size);
        },
        (err) => {
          console.warn('SuperAdminLayout corporate snapshot handled:', err.message);
        }
      );
    } catch (_err) {}

    return () => {
      unsubOrders();
      unsubStudents();
      unsubCorp();
    };
  }, [user]);

  const handleLogout = async () => {
    try {
      try {
        sessionStorage.removeItem('domeal_superadmin_session');
      } catch {}
      await logout();
      router.push('/super-admin-login');
    } catch (err) {
      console.error('Failed to log out:', err);
    }
  };

  if (!mounted) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#0F1E15] text-stone-100">
        <Crown className="w-10 h-10 text-[#C39B54] animate-pulse mb-3" />
        <p className="text-xs font-bold tracking-wider uppercase text-stone-400">
          Loading Super Admin Workspace...
        </p>
      </div>
    );
  }

  const activeEmail = user?.email || auth?.currentUser?.email;
  const isAuthorized = (activeEmail && isSuperAdminEmail(activeEmail)) || cachedSuperAdmin;

  if (!isAuthorized) {
    if (!loading && !user && !auth?.currentUser) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-[#0F1E15] text-stone-100">
          <Crown className="w-10 h-10 text-[#C39B54] animate-pulse mb-3" />
          <p className="text-xs font-bold tracking-wider uppercase text-stone-400">
            Redirecting to Super Admin Portal...
          </p>
        </div>
      );
    }

    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#0F1E15] text-stone-100">
        <Crown className="w-10 h-10 text-[#C39B54] animate-pulse mb-3" />
        <p className="text-xs font-bold tracking-wider uppercase text-stone-400">
          Loading Super Admin Workspace...
        </p>
      </div>
    );
  }

  const navSections: SuperAdminNavSection[] = [
    {
      title: 'Executive Super Admin',
      items: [
        {
          id: 'overview',
          label: 'Super Dashboard',
          href: '/super-admin',
          icon: LayoutDashboard,
        },
        /* Locations CMS hidden from sidebar navigation as requested (code preserved)
        {
          id: 'locations-cms',
          label: 'Locations CMS',
          href: '/admin-locations',
          icon: MapPin,
          isSuperExclusive: true,
        },
        */
        {
          id: 'seo',
          label: 'SEO & AI Ranking',
          href: '/admin-seo',
          icon: Globe,
          isSuperExclusive: true,
        },
        {
          id: 'staff',
          label: 'Admin Staff & Roles',
          href: '/super-admin?tab=staff',
          icon: KeyRound,
          isSuperExclusive: true,
        },
        {
          id: 'system',
          label: 'System Controls',
          href: '/super-admin?tab=system',
          icon: Sliders,
          isSuperExclusive: true,
        },
        {
          id: 'logs',
          label: 'Audit Logs',
          href: '/super-admin?tab=logs',
          icon: FileCode,
          isSuperExclusive: true,
        },
      ],
    },
    {
      title: 'Operations (Replica)',
      items: [
        {
          id: 'orders',
          label: 'Orders & Menu',
          href: '/order-menu-management-screen',
          icon: ClipboardList,
          badge: pendingOrders > 0 ? String(pendingOrders) : null,
          badgeColor: 'bg-[#C39B54] text-white',
        },
        {
          id: 'history',
          label: 'Order History',
          href: '/admin-history',
          icon: History,
        },
        {
          id: 'customers',
          label: 'Customers',
          href: '/admin-customers',
          icon: Users,
        },
        {
          id: 'corporate',
          label: 'Corporate',
          href: '/admin-corporate',
          icon: Building,
          badge: pendingCorporate > 0 ? String(pendingCorporate) : null,
          badgeColor: 'bg-[#C39B54] text-white',
        },
        {
          id: 'payments',
          label: 'Transactions',
          href: '/admin-payments',
          icon: CreditCard,
        },
        {
          id: 'students',
          label: 'Student Approvals',
          href: '/admin-student-approvals',
          icon: GraduationCap,
          badge: pendingStudents > 0 ? String(pendingStudents) : null,
          badgeColor: 'bg-red-500 text-white',
        },
      ],
    },
    {
      title: 'Platform Content',
      items: [
        {
          id: 'analytics',
          label: 'Analytics',
          href: '/admin-analytics',
          icon: TrendingUp,
        },
        {
          id: 'menu',
          label: 'Menu Management',
          href: '/admin-menu',
          icon: UtensilsCrossed,
        },
        {
          id: 'cms',
          label: 'CMS & Page Content',
          href: '/admin-cms',
          icon: FileText,
        },
        {
          id: 'settings',
          label: 'Settings',
          href: '/admin-settings',
          icon: Settings,
        },
      ],
    },
  ];

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Mobile Drawer Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Super Admin Sidebar - Exact Admin Theme (#1E3B2B) */}
      <aside
        className={`fixed lg:sticky lg:top-0 h-screen z-40 bg-[#1E3B2B] text-white flex flex-col shrink-0 transition-all duration-300 ${
          collapsed ? 'w-16' : 'w-60'
        } ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        {/* Sidebar Header */}
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
              <div className="flex items-center gap-1.5">
                <span className="font-700 text-white text-base">DoMeal</span>
                <span className="text-[9px] font-bold uppercase tracking-wider bg-[#C39B54] text-white px-1.5 py-0.5 rounded">
                  SUPER
                </span>
              </div>
            </div>
          )}

          {collapsed && (
            <div className="w-8 h-8 rounded-lg bg-white p-1 flex items-center justify-center mx-auto">
              <Image
                src="/DOMEAL_Logo.jpg"
                alt="DoMeal Logo"
                width={32}
                height={32}
                className="w-full h-full object-contain"
              />
            </div>
          )}

          <button
            onClick={() => setCollapsed(!collapsed)}
            className="hidden lg:flex p-1.5 rounded-lg hover:bg-white/10 text-white/70 hover:text-white transition-colors cursor-pointer"
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            <ChevronLeft
              size={18}
              className={`transition-transform duration-300 ${collapsed ? 'rotate-180' : ''}`}
            />
          </button>

          <button
            onClick={() => setMobileOpen(false)}
            className="lg:hidden p-1.5 rounded-lg hover:bg-white/10 text-white/70 hover:text-white cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Sidebar Navigation */}
        <nav className="flex-1 p-3 space-y-4 overflow-y-auto">
          {navSections.map((sec, secIdx) => (
            <div key={secIdx} className="space-y-1">
              {!collapsed && (
                <p className="text-[10px] font-700 text-[#C39B54] uppercase tracking-wider px-3 mb-1.5">
                  {sec.title}
                </p>
              )}

              {sec.items.map((item) => {
                const Icon = item.icon;
                const isTabActive = activeTab === item.id;

                return (
                  <Link
                    key={item.id}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-150 ${
                      isTabActive
                        ? 'bg-[#C39B54] text-white font-600 shadow-md'
                        : 'text-white/70 hover:bg-white/10 hover:text-white font-500'
                    } ${collapsed ? 'justify-center' : ''}`}
                    title={collapsed ? item.label : undefined}
                  >
                    <Icon size={18} className="shrink-0" />

                    {!collapsed && (
                      <>
                        <span className="flex-1 text-sm truncate">{item.label}</span>
                        {item.isSuperExclusive && (
                          <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-white/15 text-white">
                            Super
                          </span>
                        )}
                        {item.badge && (
                          <span
                            className={`text-xs px-2 py-0.5 rounded-full font-700 ${
                              isTabActive ? 'bg-white text-[#1E3B2B]' : item.badgeColor || 'bg-[#C39B54] text-white'
                            }`}
                          >
                            {item.badge}
                          </span>
                        )}
                      </>
                    )}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        {/* Sidebar Footer */}
        <div className="border-t border-white/10 p-3 shrink-0 bg-[#1E3B2B] space-y-2">
          {!collapsed && (
            <div className="px-3 py-2 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between">
              <div className="truncate pr-1">
                <p className="text-[11px] font-bold text-white truncate">{user?.email || 'superadmin@vegchennaisrilalitha.co.uk'}</p>
                <p className="text-[10px] font-medium text-emerald-400 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Super Admin Role
                </p>
              </div>
              <Crown size={15} className="text-[#C39B54] shrink-0" />
            </div>
          )}

          <button
            onClick={() => setShowLogoutConfirm(true)}
            className={`flex w-full items-center gap-2.5 px-3 py-2 rounded-xl text-red-400 hover:text-white hover:bg-red-500/20 transition-colors text-xs font-semibold cursor-pointer ${
              collapsed ? 'justify-center' : ''
            }`}
            title={collapsed ? 'Sign Out' : undefined}
          >
            <LogOut size={16} className="text-red-400 shrink-0" />
            {!collapsed && <span>Sign Out</span>}
          </button>
        </div>
      </aside>

      {/* Main Container */}
      <div className="flex-1 flex flex-col min-w-0 bg-gray-50">
        {/* Top Header Bar - Exact Match to Admin Dashboard */}
        <header className="h-16 bg-white border-b border-border flex items-center justify-between px-4 lg:px-6 sticky top-0 z-30 shadow-xs">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileOpen(true)}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100 text-gray-700"
            >
              <Menu size={20} />
            </button>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-sm sm:text-base font-bold text-foreground" suppressHydrationWarning>
                  {greeting}, Super Admin
                </span>
                <span>👑</span>
              </div>
              <p className="text-xs text-muted-foreground hidden sm:block">
                DoMeal · domeal.co.uk · London
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 ml-auto">
            {/* Notification Bell */}
            <button className="relative p-2 rounded-lg hover:bg-muted transition-colors cursor-pointer">
              <Bell size={18} className="text-foreground" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-[#C39B54] rounded-full" />
            </button>

            {/* Quick Switch to Standard Admin */}
            <Link
              href="/admin-dashboard"
              className="text-xs font-bold text-[#142A1E] bg-[#C39B54] hover:bg-[#8C6B28] hover:text-white px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
            >
              <span>Standard Admin</span>
            </Link>

            {/* View Live Store */}
            <Link
              href="/"
              target="_blank"
              className="text-xs font-600 text-primary bg-blue-50 px-3 py-1.5 rounded-lg hover:bg-blue-100 transition-colors"
            >
              View Site
            </Link>

            {/* Sign Out */}
            <button
              onClick={() => setShowLogoutConfirm(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 text-xs font-700 transition-colors cursor-pointer"
            >
              <LogOut size={14} />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        </header>

        {/* Content Body */}
        <main className="flex-1 p-4 lg:p-6 overflow-auto">{children}</main>
      </div>

      {/* Sign Out Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full space-y-4 shadow-xl text-center">
            <div className="w-12 h-12 rounded-full bg-red-50 text-red-600 flex items-center justify-center mx-auto">
              <LogOut className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-gray-900">Sign Out of Super Admin?</h3>
            <p className="text-xs text-muted-foreground">
              You will be signed out of your super administrator session and redirected to the super admin login screen.
            </p>
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="flex-1 py-2.5 rounded-xl border border-border text-gray-700 font-semibold text-xs hover:bg-gray-50 transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleLogout}
                className="flex-1 py-2.5 rounded-xl bg-red-600 text-white font-semibold text-xs hover:bg-red-700 transition-all shadow-sm cursor-pointer"
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
