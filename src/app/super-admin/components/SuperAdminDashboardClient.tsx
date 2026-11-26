'use client';

import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  Package,
  PoundSterling,
  Users,
  Truck,
  TrendingUp,
  AlertTriangle,
  Eye,
  X,
  Wallet,
  Repeat,
  Crown,
  KeyRound,
  Sliders,
  FileCode,
  ArrowRight,
  ClipboardList,
  UtensilsCrossed,
  GraduationCap,
  Building,
  CreditCard,
  FileText,
  Globe,
  Settings,
  ShieldCheck,
  CheckCircle2,
  Edit,
  Save,
  Check,
  Calendar,
  Clock,
  Phone,
  Mail,
  MapPin,
  FileSignature,
  RotateCcw,
  Trash2,
} from 'lucide-react';
import { collection, query, orderBy, limit, onSnapshot, getDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/context/AuthContext';
import { isSuperAdminEmail } from '@/lib/adminAuth';
import SuperAdminStaffManagement from './SuperAdminStaffManagement';
import SuperAdminSystemControls from './SuperAdminSystemControls';
import SuperAdminAuditLogs from './SuperAdminAuditLogs';
import TestMenuToggleCard from '@/components/admin/TestMenuToggleCard';
import { toast } from 'sonner';

const OrderVolumeChart = dynamic(() => import('@/app/admin-dashboard/components/OrderVolumeChart'), {
  ssr: false,
});
const RevenueChart = dynamic(() => import('@/app/admin-dashboard/components/RevenueChart'), {
  ssr: false,
});

const statusColors: Record<string, string> = {
  'Order Received': 'bg-blue-100 text-blue-700 border-blue-200',
  Delivered: 'bg-green-100 text-green-700 border-green-200',
  'Out for Delivery': 'bg-cyan-100 text-cyan-800 border-cyan-200',
  Preparing: 'bg-amber-100 text-amber-800 border-amber-200',
  Confirmed: 'bg-purple-100 text-purple-700 border-purple-200',
  Pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  Cancelled: 'bg-red-100 text-red-600 border-red-200',
};

const ORDER_STATUS_OPTIONS = [
  'Order Received',
  'Confirmed',
  'Preparing',
  'Out for Delivery',
  'Delivered',
  'Cancelled',
];

const defaultSlotNames: Record<string, string> = {
  'slot-1': 'Morning (10:00 AM - 1:00 PM)',
  'slot-2': 'Afternoon (1:00 PM - 5:00 PM)',
  'slot-3': 'Evening (5:00 PM - 8:30 PM)',
};

export default function SuperAdminDashboardClient() {
  const searchParams = useSearchParams();
  const currentTab = searchParams.get('tab') || 'overview';

  const [liveOrders, setLiveOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [isEditingOrder, setIsEditingOrder] = useState(false);
  const [editFormData, setEditFormData] = useState<any>({
    status: 'Order Received',
    deliveryDate: '',
    deliverySlot: 'slot-1',
    total: 0,
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    addressLine1: '',
    city: 'London',
    postcode: '',
    instructions: '',
    adminNotes: '',
  });
  const [savingOrder, setSavingOrder] = useState(false);
  const [slotNames, setSlotNames] = useState<Record<string, string>>(defaultSlotNames);
  const { user } = useAuth();

  useEffect(() => {
    if (!user || !isSuperAdminEmail(user.email)) return;

    // Fetch dynamic slot configuration
    const fetchSlots = async () => {
      try {
        const snap = await getDoc(doc(db, 'settings', 'global'));
        if (snap.exists() && Array.isArray(snap.data()?.deliverySlots)) {
          const map: Record<string, string> = {};
          snap.data().deliverySlots.forEach((s: any) => {
            map[s.id] = s.time ? `${s.label} (${s.time})` : s.label;
          });
          setSlotNames((prev) => ({ ...prev, ...map }));
        }
      } catch (err) {
        console.error('Error fetching delivery slots in SuperAdminDashboardClient:', err);
      }
    };
    fetchSlots();

    const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'), limit(100));
    const unsub = onSnapshot(
      q,
      (snap) => {
        const fetched = snap.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        }));
        setLiveOrders(fetched);
        setLoading(false);
      },
      (err) => {
        console.warn('SuperAdminDashboardClient orders snapshot handled:', err.message);
        setLoading(false);
      }
    );

    return () => unsub();
  }, [user]);

  // Open Edit Modal for a given order
  const handleOpenOrderModal = (order: any, startInEditMode = false) => {
    setSelectedOrder(order);
    setIsEditingOrder(startInEditMode);
    setEditFormData({
      status: order.status || 'Order Received',
      deliveryDate: order.deliveryDate || '',
      deliverySlot: order.deliverySlot || 'slot-1',
      total: order.total !== undefined ? order.total : 0,
      customerName: order.customerName || order.userName || '',
      customerEmail: order.customerEmail || order.email || '',
      customerPhone: order.customerPhone || order.phone || '',
      addressLine1: order.deliveryAddress?.addressLine1 || order.deliveryAddress?.street || '',
      city: order.deliveryAddress?.city || 'London',
      postcode: order.deliveryAddress?.postcode || '',
      instructions: order.deliveryAddress?.instructions || order.specialInstructions || '',
      adminNotes: order.adminNotes || '',
    });
  };

  // Direct Inline Status Update from Table
  const handleInlineStatusChange = async (orderId: string, newStatus: string) => {
    try {
      await updateDoc(doc(db, 'orders', orderId), {
        status: newStatus,
        updatedAt: new Date(),
        updatedBy: user?.email || 'Super Admin',
      });
      toast.success(`Order #${orderId.slice(0, 8)} status updated to ${newStatus}`);
    } catch (err: any) {
      console.error('Error updating status:', err);
      toast.error(`Failed to update status: ${err.message || 'Error'}`);
    }
  };

  // Save full order edits
  const handleSaveOrderEdits = async () => {
    if (!selectedOrder) return;
    setSavingOrder(true);
    try {
      const orderRef = doc(db, 'orders', selectedOrder.id);
      const updatedFields: any = {
        status: editFormData.status,
        deliveryDate: editFormData.deliveryDate,
        deliverySlot: editFormData.deliverySlot,
        total: parseFloat(editFormData.total) || 0,
        customerName: editFormData.customerName,
        customerEmail: editFormData.customerEmail,
        customerPhone: editFormData.customerPhone,
        adminNotes: editFormData.adminNotes,
        updatedAt: new Date(),
        lastEditedBy: user?.email || 'Super Admin',
        deliveryAddress: {
          ...(selectedOrder.deliveryAddress || {}),
          addressLine1: editFormData.addressLine1,
          city: editFormData.city,
          postcode: editFormData.postcode,
          instructions: editFormData.instructions,
        },
      };

      await updateDoc(orderRef, updatedFields);
      toast.success(`Order #${selectedOrder.id.slice(0, 8)} updated successfully!`);
      setSelectedOrder({
        ...selectedOrder,
        ...updatedFields,
      });
      setIsEditingOrder(false);
    } catch (err: any) {
      console.error('Error saving order edits:', err);
      toast.error(`Failed to save edits: ${err.message || 'Error'}`);
    } finally {
      setSavingOrder(false);
    }
  };

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const ordersToday = liveOrders.filter(
    (o) => o.createdAt && o.createdAt.toDate && o.createdAt.toDate() >= todayStart
  );
  const revenueToday = ordersToday.reduce((sum, o) => sum + (o.total || 0), 0);
  const pendingOrders = liveOrders.filter((o) =>
    ['Order Received', 'Preparing', 'Pending'].includes(o.status || 'Order Received')
  );
  const uniqueCustomers = new Set(liveOrders.map((o) => o.userId)).size;

  const activeSubsCount = new Set(
    liveOrders
      .filter((o) => (o.stripeSubscriptionId || o.subscriptionFrequency) && o.subscriptionStatus === 'active')
      .map((o) => o.userId || o.customerEmail || o.email)
  ).size;

  const cancelledSubsCount = new Set(
    liveOrders
      .filter((o) => o.subscriptionStatus === 'cancelled' || o.status === 'Cancelled')
      .map((o) => o.userId || o.customerEmail || o.email)
  ).size;

  const totalGrossRevenue = liveOrders
    .filter((o) => o.status !== 'Cancelled')
    .reduce((sum, o) => sum + (o.total || 0), 0);

  // Core 5 Bento KPI cards matching screenshot + 2 Super Admin exclusive cards
  const kpiCards = [
    {
      id: 'kpi-orders-today',
      label: 'Orders Today',
      value: ordersToday.length.toString(),
      change: 'Live',
      trend: 'up',
      icon: Package,
      color: 'bg-red-50 text-primary',
      borderColor: 'border-red-200',
    },
    {
      id: 'kpi-revenue',
      label: 'Revenue Today',
      value: `£${revenueToday.toFixed(2)}`,
      change: 'Live',
      trend: 'up',
      icon: PoundSterling,
      color: 'bg-amber-50 text-secondary',
      borderColor: 'border-amber-200',
    },
    {
      id: 'kpi-subscriptions',
      label: 'Active Plans',
      value: activeSubsCount.toString(),
      change: `${cancelledSubsCount} Cancelled`,
      trend: cancelledSubsCount > 0 ? 'warn' : 'up',
      icon: Repeat,
      color: 'bg-emerald-50 text-emerald-700',
      borderColor: 'border-emerald-200',
    },
    {
      id: 'kpi-customers',
      label: 'Total Customers',
      value: uniqueCustomers.toString(),
      change: 'Recent unique',
      trend: 'up',
      icon: Users,
      color: 'bg-blue-50 text-blue-600',
      borderColor: 'border-blue-200',
    },
    {
      id: 'kpi-pending',
      label: 'Pending Deliveries',
      value: pendingOrders.length.toString(),
      change: 'Needs attention',
      trend: pendingOrders.length > 0 ? 'alert' : 'up',
      icon: Truck,
      color: 'bg-red-50 text-red-600',
      borderColor: 'border-red-200',
    },
    {
      id: 'kpi-gross-revenue',
      label: 'Gross Revenue',
      value: `£${totalGrossRevenue.toFixed(2)}`,
      change: `${liveOrders.length} orders total`,
      trend: 'up',
      icon: PoundSterling,
      color: 'bg-amber-50 text-[#C39B54]',
      borderColor: 'border-amber-200',
    },
    {
      id: 'kpi-super-staff',
      label: 'Admin Staff',
      value: '3',
      change: 'Full RBAC Access',
      trend: 'up',
      icon: Crown,
      color: 'bg-purple-50 text-purple-700',
      borderColor: 'border-purple-200',
    },
  ];

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="h-7 w-36 bg-gray-200 rounded-xl" />
            <div className="h-4 w-60 bg-gray-200 rounded-lg" />
          </div>
          <div className="h-8 w-24 bg-gray-200 rounded-lg" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border-2 border-border p-5 space-y-3">
              <div className="flex items-start justify-between">
                <div className="w-10 h-10 rounded-xl bg-gray-200" />
                <div className="w-4 h-4 rounded bg-gray-200" />
              </div>
              <div className="h-3 w-24 bg-gray-200 rounded" />
              <div className="h-8 w-16 bg-gray-200 rounded" />
              <div className="h-3 w-12 bg-gray-200 rounded" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header matching Admin Dashboard */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-foreground">Dashboard</h1>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#C39B54]/15 text-[#8C6B28] border border-[#C39B54]/30">
              <Crown size={12} className="text-[#C39B54]" />
              Super Admin Console
            </span>
          </div>
          <p className="text-sm text-muted-foreground mt-0.5">
            Overview for today — DoMeal · domeal.co.uk · London
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground bg-white border border-border rounded-lg px-3 py-2 shadow-xs">
          <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          Live data &bull; Full Edit Authority
        </div>
      </div>

      {/* Super Admin Module Tabs */}
      <div className="flex items-center gap-2 border-b border-border pb-3 overflow-x-auto">
        <Link
          href="/super-admin"
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 shrink-0 ${
            currentTab === 'overview'
              ? 'bg-[#1E3B2B] text-white shadow-sm'
              : 'bg-white text-gray-700 hover:bg-gray-100 border border-border'
          }`}
        >
          <Crown size={13} className={currentTab === 'overview' ? 'text-[#C39B54]' : 'text-gray-400'} />
          <span>Executive Overview</span>
        </Link>

        <Link
          href="/admin-locations"
          className="px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 shrink-0 bg-white text-gray-700 hover:bg-gray-100 border border-border"
        >
          <MapPin size={13} className="text-[#C39B54]" />
          <span>Locations CMS</span>
          <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-full bg-purple-100 text-purple-800">
            Super
          </span>
        </Link>

        <Link
          href="/admin-seo"
          className="px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 shrink-0 bg-white text-gray-700 hover:bg-gray-100 border border-border"
        >
          <Globe size={13} className="text-[#C39B54]" />
          <span>SEO &amp; AI Ranking</span>
          <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-full bg-purple-100 text-purple-800">
            Super
          </span>
        </Link>

        <Link
          href="/super-admin?tab=staff"
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 shrink-0 ${
            currentTab === 'staff'
              ? 'bg-[#1E3B2B] text-white shadow-sm'
              : 'bg-white text-gray-700 hover:bg-gray-100 border border-border'
          }`}
        >
          <KeyRound size={13} className={currentTab === 'staff' ? 'text-[#C39B54]' : 'text-gray-400'} />
          <span>Staff &amp; Roles</span>
          <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-800">
            Editable
          </span>
        </Link>

        <Link
          href="/super-admin?tab=system"
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 shrink-0 ${
            currentTab === 'system'
              ? 'bg-[#1E3B2B] text-white shadow-sm'
              : 'bg-white text-gray-700 hover:bg-gray-100 border border-border'
          }`}
        >
          <Sliders size={13} className={currentTab === 'system' ? 'text-[#C39B54]' : 'text-gray-400'} />
          <span>System Controls</span>
          <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-800">
            Editable
          </span>
        </Link>

        <Link
          href="/super-admin?tab=logs"
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 shrink-0 ${
            currentTab === 'logs'
              ? 'bg-[#1E3B2B] text-white shadow-sm'
              : 'bg-white text-gray-700 hover:bg-gray-100 border border-border'
          }`}
        >
          <FileCode size={13} className={currentTab === 'logs' ? 'text-[#C39B54]' : 'text-gray-400'} />
          <span>Audit Logs</span>
          <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-800">
            Activity
          </span>
        </Link>
      </div>

      {/* Conditionally Render Active Tab */}
      {currentTab === 'staff' && <SuperAdminStaffManagement />}
      {currentTab === 'system' && <SuperAdminSystemControls />}
      {currentTab === 'logs' && <SuperAdminAuditLogs />}

      {currentTab === 'overview' && (
        <div className="space-y-6">
          {/* Executive Super Admin Exclusive Modules Banner (Locations CMS & SEO Suite) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Locations CMS Card */}
            <div className="bg-gradient-to-br from-[#1E3B2B] to-[#12241A] rounded-2xl p-5 text-white border border-[#C39B54]/30 shadow-md relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#C39B54]/10 rounded-full blur-2xl pointer-events-none" />
              <div className="flex items-start justify-between">
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-[#C39B54] border border-white/10">
                  <MapPin size={20} />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-[#C39B54] text-stone-950 px-2 py-0.5 rounded-full shadow-xs">
                  Super Admin Exclusive
                </span>
              </div>
              <div className="mt-3">
                <h4 className="text-base font-extrabold text-white flex items-center gap-2">
                  <span>Locations Master CMS</span>
                </h4>
                <p className="text-xs text-stone-300 mt-1 leading-relaxed">
                  Manage all London regional delivery corridors, active postcodes, hero stories, rotating dishes, and real-time live preview.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between">
                <span className="text-[11px] text-emerald-400 font-mono font-bold">12 Active London Routes</span>
                <Link
                  href="/admin-locations"
                  className="px-3.5 py-1.5 rounded-xl bg-[#C39B54] hover:bg-[#A98440] text-stone-950 text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm active:scale-95"
                >
                  <span>Open Locations CMS</span>
                  <ArrowRight size={13} />
                </Link>
              </div>
            </div>

            {/* SEO & AI Ranking Card */}
            <div className="bg-gradient-to-br from-[#1E3B2B] to-[#12241A] rounded-2xl p-5 text-white border border-[#C39B54]/30 shadow-md relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
              <div className="flex items-start justify-between">
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-[#C39B54] border border-white/10">
                  <Globe size={20} />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-[#C39B54] text-stone-950 px-2 py-0.5 rounded-full shadow-xs">
                  Super Admin Exclusive
                </span>
              </div>
              <div className="mt-3">
                <h4 className="text-base font-extrabold text-white flex items-center gap-2">
                  <span>SEO &amp; AI Citations Suite</span>
                </h4>
                <p className="text-xs text-stone-300 mt-1 leading-relaxed">
                  Automated sitemap.xml, llms.txt AI crawler feeds, search keyword ranks, JSON-LD Schema markup, and OpenGraph social meta.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between">
                <span className="text-[11px] text-emerald-400 font-mono font-bold">AI Crawler Indexing Active</span>
                <Link
                  href="/admin-seo"
                  className="px-3.5 py-1.5 rounded-xl bg-[#C39B54] hover:bg-[#A98440] text-stone-950 text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm active:scale-95"
                >
                  <span>Open SEO Suite</span>
                  <ArrowRight size={13} />
                </Link>
              </div>
            </div>
          </div>

          {/* £1 Test Subscription Menu Toggle Banner (Exact Replica from Screenshot) */}
          <TestMenuToggleCard />

          {/* Bento KPI Cards Grid - Exact Theme, Pastel Borders, & Component Structure */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
            {kpiCards.map((card) => {
              const Icon = card.icon;
              return (
                <div
                  key={card.id}
                  className={`bg-white rounded-2xl border-2 ${card.borderColor} p-5 hover:shadow-md transition-all duration-200 relative ${
                    card.trend === 'alert' ? 'ring-1 ring-red-300' : ''
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className={`p-2.5 rounded-xl ${card.color}`}>
                      <Icon size={20} />
                    </div>
                    {card.trend === 'up' && (
                      <span className="text-emerald-500 text-xs flex items-center font-bold">
                        <TrendingUp size={14} />
                      </span>
                    )}
                    {card.trend === 'alert' && (
                      <span className="text-red-500 text-xs flex items-center font-bold">
                        <AlertTriangle size={14} />
                      </span>
                    )}
                    {card.trend === 'warn' && (
                      <span className="text-amber-500 text-xs flex items-center font-bold">
                        <AlertTriangle size={14} />
                      </span>
                    )}
                  </div>
                  <div className="mt-3">
                    <p className="text-[11px] font-bold tracking-wider text-gray-400 uppercase">
                      {card.label}
                    </p>
                    <p className="text-2xl sm:text-3xl font-extrabold text-gray-900 mt-1">
                      {card.value}
                    </p>
                    <p
                      className={`text-xs font-semibold mt-1 flex items-center gap-1 ${
                        card.trend === 'alert'
                          ? 'text-red-600'
                          : card.trend === 'warn'
                          ? 'text-amber-600'
                          : 'text-emerald-600'
                      }`}
                    >
                      {card.change}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Dynamic Financial & Order Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <RevenueChart orders={liveOrders} />
            <OrderVolumeChart orders={liveOrders} />
          </div>

          {/* Connected Operational Admin Modules Grid (Full Replica) */}
          <div className="bg-white p-5 rounded-2xl border border-border shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div>
                <h3 className="font-bold text-foreground text-sm">
                  Connected Operations Modules (Full Replica)
                </h3>
                <p className="text-xs text-muted-foreground">
                  Direct one-click access into all administrative modules with super administrator authority.
                </p>
              </div>
              <span className="text-xs font-semibold text-[#8C6B28] bg-amber-50 border border-amber-200 px-3 py-1 rounded-lg">
                12 Modules Connected
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {[
                { label: 'Orders & Menu', href: '/order-menu-management-screen', icon: ClipboardList, desc: 'Live dispatch & prep' },
                { label: 'Order History', href: '/admin-history', icon: TrendingUp, desc: 'Past orders & receipts' },
                { label: 'Customers', href: '/admin-customers', icon: Users, desc: 'Profiles & subscriptions' },
                { label: 'Corporate', href: '/admin-corporate', icon: Building, desc: 'Catering inquiries' },
                { label: 'Transactions', href: '/admin-payments', icon: CreditCard, desc: 'Worldpay & Stripe ledger' },
                { label: 'Student Approvals', href: '/admin-student-approvals', icon: GraduationCap, desc: 'ID verifications' },
                { label: 'Analytics', href: '/admin-analytics', icon: TrendingUp, desc: 'Revenue & cohorts' },
                { label: 'Menu Management', href: '/admin-menu', icon: UtensilsCrossed, desc: 'Dishes & categories' },
                { label: 'CMS Editor', href: '/admin-cms', icon: FileText, desc: 'Banners & page text' },
                { label: 'Locations CMS', href: '/admin-locations', icon: MapPin, desc: 'London routes & SEO' },
                { label: 'SEO & AI Ranking', href: '/admin-seo', icon: Globe, desc: 'Metadata & keywords' },
                { label: 'Settings', href: '/admin-settings', icon: Settings, desc: 'Slots & business rules' },
              ].map((m, mIdx) => {
                const Icon = m.icon;
                return (
                  <Link
                    key={mIdx}
                    href={m.href}
                    className="p-3.5 rounded-xl border border-border bg-gray-50/60 hover:bg-white hover:border-[#1E3B2B] hover:shadow-md transition-all duration-200 flex flex-col justify-between group"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="w-8 h-8 rounded-lg bg-gray-100 text-[#1E3B2B] group-hover:bg-[#1E3B2B] group-hover:text-white transition-colors flex items-center justify-center">
                        <Icon size={16} />
                      </div>
                      <ArrowRight size={13} className="text-gray-400 group-hover:text-[#1E3B2B] transition-transform group-hover:translate-x-0.5" />
                    </div>
                    <div>
                      <div className="font-bold text-gray-900 text-xs">{m.label}</div>
                      <div className="text-[10px] text-gray-500 mt-0.5">{m.desc}</div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Realtime Order Feed Table with Inline Editable Status & Actions */}
          <div className="bg-white rounded-2xl border border-border shadow-xs overflow-hidden">
            <div className="p-5 border-b border-border flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-foreground text-sm">Realtime Order Feed</h3>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                    Live Editable
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Change status inline or click Edit to modify customer, address, slots, and totals
                </p>
              </div>
              <Link
                href="/order-menu-management-screen"
                className="text-xs font-semibold text-[#1E3B2B] hover:text-[#C39B54] flex items-center gap-1"
              >
                <span>View Full Dispatch</span>
                <ArrowRight size={13} />
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50 text-gray-600 font-bold uppercase tracking-wider text-[10px] border-b border-border">
                  <tr>
                    <th className="py-3 px-4">Order ID</th>
                    <th className="py-3 px-4">Customer</th>
                    <th className="py-3 px-4">Delivery Date / Slot</th>
                    <th className="py-3 px-4">Total</th>
                    <th className="py-3 px-4">Editable Status</th>
                    <th className="py-3 px-4 text-right">Super Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {liveOrders.slice(0, 10).map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50/70 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-gray-900">
                        #{order.id.slice(0, 8).toUpperCase()}
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-gray-900">
                          {order.customerName || order.userName || 'Guest Customer'}
                        </div>
                        <div className="text-[11px] text-gray-400">
                          {order.customerEmail || order.email || '—'}
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-gray-600">
                        <div>{order.deliveryDate || 'Standard Delivery'}</div>
                        <div className="text-[11px] text-[#8C6B28] font-semibold">
                          {slotNames[order.deliverySlot] || order.deliverySlot || 'Standard Slot'}
                        </div>
                      </td>

                      <td className="py-3.5 px-4 font-bold text-gray-900">
                        £{(order.total || 0).toFixed(2)}
                      </td>

                      <td className="py-3.5 px-4">
                        <select
                          value={order.status || 'Order Received'}
                          onChange={(e) => handleInlineStatusChange(order.id, e.target.value)}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-bold uppercase tracking-wider border cursor-pointer transition-colors focus:ring-2 focus:ring-[#1E3B2B] outline-none ${
                            statusColors[order.status] || 'bg-gray-100 text-gray-700 border-gray-300'
                          }`}
                        >
                          {ORDER_STATUS_OPTIONS.map((st) => (
                            <option key={st} value={st} className="bg-white text-gray-900 font-semibold normal-case">
                              {st}
                            </option>
                          ))}
                        </select>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenOrderModal(order, true)}
                            className="px-2.5 py-1 rounded-lg text-[#1E3B2B] bg-[#1E3B2B]/5 hover:bg-[#1E3B2B] hover:text-white transition-all text-xs font-bold flex items-center gap-1 cursor-pointer"
                            title="Edit Full Order Details"
                          >
                            <Edit size={13} />
                            <span>Edit</span>
                          </button>
                          <button
                            onClick={() => handleOpenOrderModal(order, false)}
                            className="p-1.5 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors cursor-pointer"
                            title="View Full Summary"
                          >
                            <Eye size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Executive Order Details & Edit Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 max-w-xl w-full space-y-4 shadow-2xl max-h-[92vh] overflow-y-auto border border-border">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-[#1E3B2B]/10 text-[#1E3B2B] flex items-center justify-center">
                  {isEditingOrder ? <Edit size={18} /> : <Eye size={18} />}
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#C39B54] block">
                    {isEditingOrder ? 'Super Admin Order Editor' : 'Super Admin Order View'}
                  </span>
                  <h3 className="font-extrabold text-gray-900 text-base font-mono">
                    #{selectedOrder.id}
                  </h3>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {!isEditingOrder ? (
                  <button
                    onClick={() => setIsEditingOrder(true)}
                    className="px-3 py-1.5 rounded-xl bg-[#1E3B2B] text-white text-xs font-bold flex items-center gap-1.5 hover:bg-[#284f3a] transition-all cursor-pointer shadow-xs"
                  >
                    <Edit size={13} />
                    <span>Edit Order</span>
                  </button>
                ) : (
                  <button
                    onClick={() => setIsEditingOrder(false)}
                    className="px-3 py-1.5 rounded-xl bg-gray-100 text-gray-700 text-xs font-bold hover:bg-gray-200 transition-all cursor-pointer"
                  >
                    View Mode
                  </button>
                )}
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="p-1.5 rounded-xl text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Editable Mode Form */}
            {isEditingOrder ? (
              <div className="space-y-4 text-xs">
                <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200 text-amber-900 text-[11px] font-medium flex items-center gap-2">
                  <ShieldCheck size={16} className="text-[#C39B54] shrink-0" />
                  <span>You have Super Admin authority to modify status, dates, slots, pricing, and address notes.</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-gray-700 font-bold mb-1">Order Status</label>
                    <select
                      value={editFormData.status || 'Order Received'}
                      onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-gray-300 font-semibold text-xs focus:ring-2 focus:ring-[#1E3B2B] outline-none"
                    >
                      {ORDER_STATUS_OPTIONS.map((st) => (
                        <option key={st} value={st}>
                          {st}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-gray-700 font-bold mb-1">Total Amount (£)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={editFormData.total !== undefined ? editFormData.total : ''}
                      onChange={(e) => setEditFormData({ ...editFormData, total: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-gray-300 font-mono font-bold text-xs focus:ring-2 focus:ring-[#1E3B2B] outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-gray-700 font-bold mb-1">Delivery Date</label>
                    <input
                      type="text"
                      value={editFormData.deliveryDate || ''}
                      onChange={(e) => setEditFormData({ ...editFormData, deliveryDate: e.target.value })}
                      placeholder="e.g. 2026-11-30 or Monday"
                      className="w-full p-2.5 rounded-xl border border-gray-300 text-xs focus:ring-2 focus:ring-[#1E3B2B] outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 font-bold mb-1">Delivery Slot</label>
                    <select
                      value={editFormData.deliverySlot || 'slot-1'}
                      onChange={(e) => setEditFormData({ ...editFormData, deliverySlot: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-gray-300 text-xs focus:ring-2 focus:ring-[#1E3B2B] outline-none"
                    >
                      <option value="slot-1">{slotNames['slot-1'] || 'Morning'}</option>
                      <option value="slot-2">{slotNames['slot-2'] || 'Afternoon'}</option>
                      <option value="slot-3">{slotNames['slot-3'] || 'Evening'}</option>
                    </select>
                  </div>
                </div>

                <div className="p-3.5 bg-gray-50 rounded-2xl border border-border space-y-3">
                  <span className="font-bold text-gray-900 block text-xs">Customer Contact Info</span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div>
                      <label className="block text-gray-500 text-[10px] uppercase font-bold mb-0.5">Name</label>
                      <input
                        type="text"
                        value={editFormData.customerName || ''}
                        onChange={(e) => setEditFormData({ ...editFormData, customerName: e.target.value })}
                        className="w-full p-2 rounded-lg border border-gray-300 bg-white text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-500 text-[10px] uppercase font-bold mb-0.5">Email</label>
                      <input
                        type="email"
                        value={editFormData.customerEmail || ''}
                        onChange={(e) => setEditFormData({ ...editFormData, customerEmail: e.target.value })}
                        className="w-full p-2 rounded-lg border border-gray-300 bg-white text-xs"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-gray-500 text-[10px] uppercase font-bold mb-0.5">Phone</label>
                    <input
                      type="text"
                      value={editFormData.customerPhone || ''}
                      onChange={(e) => setEditFormData({ ...editFormData, customerPhone: e.target.value })}
                      placeholder="e.g. +44 7123 456789"
                      className="w-full p-2 rounded-lg border border-gray-300 bg-white text-xs"
                    />
                  </div>
                </div>

                <div className="p-3.5 bg-gray-50 rounded-2xl border border-border space-y-3">
                  <span className="font-bold text-gray-900 block text-xs">Delivery Address Details</span>
                  <div className="space-y-2">
                    <input
                      type="text"
                      value={editFormData.addressLine1 || ''}
                      onChange={(e) => setEditFormData({ ...editFormData, addressLine1: e.target.value })}
                      placeholder="Street Address & Flat Number"
                      className="w-full p-2 rounded-lg border border-gray-300 bg-white text-xs"
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        value={editFormData.city || ''}
                        onChange={(e) => setEditFormData({ ...editFormData, city: e.target.value })}
                        placeholder="City"
                        className="p-2 rounded-lg border border-gray-300 bg-white text-xs"
                      />
                      <input
                        type="text"
                        value={editFormData.postcode || ''}
                        onChange={(e) => setEditFormData({ ...editFormData, postcode: e.target.value })}
                        placeholder="Postcode (e.g. W2 1NY)"
                        className="p-2 rounded-lg border border-gray-300 bg-white text-xs font-mono font-bold uppercase"
                      />
                    </div>
                    <input
                      type="text"
                      value={editFormData.instructions || ''}
                      onChange={(e) => setEditFormData({ ...editFormData, instructions: e.target.value })}
                      placeholder="Gate code, concierge instructions, or safe place"
                      className="w-full p-2 rounded-lg border border-gray-300 bg-white text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-gray-700 font-bold mb-1">Super Admin Internal Notes</label>
                  <textarea
                    rows={2}
                    value={editFormData.adminNotes || ''}
                    onChange={(e) => setEditFormData({ ...editFormData, adminNotes: e.target.value })}
                    placeholder="Add special chef notes or delivery dispatch instructions..."
                    className="w-full p-2.5 rounded-xl border border-gray-300 text-xs focus:ring-2 focus:ring-[#1E3B2B] outline-none"
                  />
                </div>

                <div className="pt-2 flex items-center justify-between gap-3 border-t border-border">
                  <button
                    onClick={() => {
                      handleInlineStatusChange(selectedOrder.id, 'Cancelled');
                      toast.success(`Order #${selectedOrder.id.slice(-6).toUpperCase()} marked as Cancelled`);
                      setSelectedOrder(null);
                    }}
                    className="px-4 py-2.5 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 text-xs font-bold transition-all cursor-pointer"
                  >
                    Cancel Order
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setIsEditingOrder(false)}
                      className="px-4 py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold transition-all cursor-pointer"
                    >
                      Discard
                    </button>
                    <button
                      onClick={handleSaveOrderEdits}
                      disabled={savingOrder}
                      className="px-5 py-2.5 rounded-xl bg-[#1E3B2B] hover:bg-[#284f3a] text-white text-xs font-extrabold flex items-center gap-1.5 transition-all shadow-md active:scale-95 cursor-pointer disabled:opacity-50"
                    >
                      {savingOrder ? (
                        <>
                          <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span>Saving...</span>
                        </>
                      ) : (
                        <>
                          <Save size={14} />
                          <span>Save All Changes</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              /* View Mode Display */
              <div className="space-y-4 text-xs">
                <div className="grid grid-cols-2 gap-3 p-3.5 rounded-2xl bg-gray-50 border border-border">
                  <div>
                    <span className="text-gray-400 block text-[10px] uppercase font-bold">Customer</span>
                    <span className="font-bold text-gray-900 text-sm">
                      {selectedOrder.customerName || selectedOrder.userName || 'Guest Customer'}
                    </span>
                    <div className="text-gray-500 text-[11px] mt-0.5">
                      {selectedOrder.customerEmail || selectedOrder.email || 'No email provided'}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-gray-400 block text-[10px] uppercase font-bold">Total Amount</span>
                    <span className="font-black text-gray-900 text-lg text-emerald-700">
                      £{(selectedOrder.total || 0).toFixed(2)}
                    </span>
                    <div className="mt-1">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                          statusColors[selectedOrder.status] || 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {selectedOrder.status || 'Order Received'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-gray-50 rounded-xl border border-border">
                    <span className="text-gray-400 block text-[10px] uppercase font-bold">Delivery Date</span>
                    <span className="font-semibold text-gray-800">
                      {selectedOrder.deliveryDate || 'Scheduled Route'}
                    </span>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-xl border border-border">
                    <span className="text-gray-400 block text-[10px] uppercase font-bold">Delivery Slot</span>
                    <span className="font-semibold text-[#8C6B28]">
                      {slotNames[selectedOrder.deliverySlot] || selectedOrder.deliverySlot || 'Standard Slot'}
                    </span>
                  </div>
                </div>

                {selectedOrder.deliveryAddress && (
                  <div>
                    <span className="text-gray-400 block text-[10px] uppercase font-bold mb-1">
                      Delivery Address
                    </span>
                    <p className="text-gray-700 bg-gray-50 p-3 rounded-xl border border-border leading-relaxed">
                      {selectedOrder.deliveryAddress.addressLine1 || selectedOrder.deliveryAddress.street || ''}
                      <br />
                      {selectedOrder.deliveryAddress.city} <strong className="text-gray-900 font-mono">{selectedOrder.deliveryAddress.postcode}</strong>
                      {selectedOrder.deliveryAddress.instructions && (
                        <span className="block mt-1 text-[11px] text-amber-800 font-medium">
                          Note: {selectedOrder.deliveryAddress.instructions}
                        </span>
                      )}
                    </p>
                  </div>
                )}

                {selectedOrder.adminNotes && (
                  <div className="p-3 bg-purple-50 rounded-xl border border-purple-200 text-purple-950">
                    <span className="text-[10px] uppercase font-bold text-purple-700 block mb-0.5">Super Admin Notes</span>
                    <p className="text-xs">{selectedOrder.adminNotes}</p>
                  </div>
                )}

                <div>
                  <span className="text-gray-400 block text-[10px] uppercase font-bold mb-2">
                    Items in Feast ({selectedOrder.items?.length || 0})
                  </span>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {selectedOrder.items?.map((item: any, iIdx: number) => (
                      <div
                        key={iIdx}
                        className="p-2.5 rounded-xl bg-gray-50 border border-border flex items-center justify-between"
                      >
                        <div>
                          <div className="font-semibold text-gray-900">{item.name || item.title}</div>
                          <div className="text-[10px] text-gray-400">Qty: {item.quantity || 1}</div>
                        </div>
                        <div className="font-bold text-gray-900">
                          £{(item.price || 0).toFixed(2)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-between gap-3 border-t border-border">
                  <button
                    onClick={() => setIsEditingOrder(true)}
                    className="px-4 py-2.5 rounded-xl bg-[#1E3B2B] text-white font-bold text-xs hover:bg-[#284f3a] transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <Edit size={13} />
                    <span>Edit This Order</span>
                  </button>
                  <button
                    onClick={() => setSelectedOrder(null)}
                    className="px-4 py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold text-xs cursor-pointer"
                  >
                    Close
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
