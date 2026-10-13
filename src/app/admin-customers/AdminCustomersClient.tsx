'use client';
import React, { useState, useEffect } from 'react';
import {
  Search,
  Users,
  Mail,
  Phone,
  MapPin,
  ShoppingBag,
  ChevronDown,
  ChevronUp,
  Wallet,
  RefreshCw,
  XCircle,
  Utensils,
  Package,
  Repeat,
  Sparkles,
  Copy,
  Check,
  X,
  CreditCard,
  UserCheck,
} from 'lucide-react';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/context/AuthContext';
import { isAdminEmail } from '@/lib/adminAuth';

const getEpochTime = (val: any): number => {
  if (!val) return 0;
  if (typeof val.toDate === 'function') return val.toDate().getTime();
  if (val instanceof Date) return val.getTime();
  if (typeof val.toMillis === 'function') return val.toMillis();
  if (typeof val === 'number') return val;
  if (typeof val === 'string') {
    const parsed = new Date(val).getTime();
    return isNaN(parsed) ? 0 : parsed;
  }
  return 0;
};

export default function AdminCustomersClient() {
  const [users, setUsers] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'cancelled' | 'onetime'>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const { user } = useAuth();

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  useEffect(() => {
    if (!user || !isAdminEmail(user.email)) return;

    let resolved = 0;
    const trySetLoaded = () => {
      resolved++;
      if (resolved >= 3) setLoading(false);
    };

    const unsub1 = onSnapshot(collection(db, 'users'), (snap) => {
      setUsers(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      trySetLoaded();
    });
    const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
    const unsub2 = onSnapshot(q, (snap) => {
      setOrders(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      trySetLoaded();
    });
    const unsub3 = onSnapshot(collection(db, 'wallet_transactions'), (snap) => {
      setTransactions(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      trySetLoaded();
    });
    return () => {
      unsub1();
      unsub2();
      unsub3();
    };
  }, [user]);

  // 1. Gather registered users
  const registeredUsers = users.filter((u) => !isAdminEmail(u.email));
  const registeredUserIds = new Set(registeredUsers.map((u) => u.id));
  const registeredEmails = new Set(
    registeredUsers.map((u) => (u.email || '').toLowerCase().trim()).filter(Boolean)
  );
  const registeredPhones = new Set(
    registeredUsers.map((u) => (u.phone || '').replace(/\s+/g, '')).filter(Boolean)
  );

  // 2. Identify guest/phone checkout orders that don't belong to a registered user
  const guestCustomerGroups: Record<string, any[]> = {};
  orders.forEach((o) => {
    const oEmail = (o.customerEmail || o.email || o.address?.email || '').toLowerCase().trim();
    const oPhone = (o.address?.phone || o.phone || '').replace(/\s+/g, '');
    const oUserId = o.userId;

    const matchesRegistered =
      (oUserId && oUserId !== 'guest-user' && registeredUserIds.has(oUserId)) ||
      (oEmail && registeredEmails.has(oEmail)) ||
      (oPhone && registeredPhones.has(oPhone));

    if (!matchesRegistered) {
      const guestKey = oPhone || oEmail || oUserId || o.id;
      if (!guestCustomerGroups[guestKey]) {
        guestCustomerGroups[guestKey] = [];
      }
      guestCustomerGroups[guestKey].push(o);
    }
  });

  const guestCustomers = Object.entries(guestCustomerGroups).map(([key, gOrders]) => {
    const latestOrder = gOrders[0];
    return {
      id: `guest-${key}`,
      isGuest: true,
      name: latestOrder?.address?.fullName || 'Direct Customer',
      email: latestOrder?.customerEmail || latestOrder?.email || latestOrder?.address?.email || '',
      phone: latestOrder?.address?.phone || latestOrder?.phone || '',
      createdAt: latestOrder?.createdAt,
      addresses: latestOrder?.address ? [latestOrder.address] : [],
      walletBalance: 0,
    };
  });

  const allRawCustomers = [...registeredUsers, ...guestCustomers];

  // 3. Enrich customer data with detailed subscription & items metrics
  const enriched = allRawCustomers.map((u) => {
    const uEmail = (u.email || '').toLowerCase().trim();
    const uPhone = (u.phone || '').replace(/\s+/g, '');

    // Match all orders for this customer:
    // Registered accounts match strictly by userId or verified email
    // Guest accounts match by email or phone (excluding orders owned by registered users)
    const userOrders = orders.filter((o) => {
      const oEmail = (o.customerEmail || o.email || o.address?.email || '').toLowerCase().trim();
      const oUserId = o.userId;

      if (!u.isGuest && u.id) {
        const matchesId = Boolean(oUserId && oUserId === u.id);
        const matchesEmail = Boolean(uEmail && oEmail && uEmail === oEmail);
        return matchesId || matchesEmail;
      }

      // Guest customer matching
      const isRegisteredOrder = Boolean(
        oUserId && oUserId !== 'guest-user' && registeredUserIds.has(oUserId)
      );
      if (isRegisteredOrder) return false;

      const matchesEmail = Boolean(uEmail && oEmail && uEmail === oEmail);
      const oPhone = (o.address?.phone || o.phone || '').replace(/\s+/g, '');
      const matchesPhone = Boolean(uPhone && oPhone && uPhone === oPhone);

      return matchesEmail || matchesPhone;
    });

    userOrders.sort((a, b) => getEpochTime(b.createdAt) - getEpochTime(a.createdAt));

    const totalSpent = userOrders.reduce((s, o) => s + (o.total || 0), 0);
    const latestOrder = userOrders[0];

    // Accurate subscription order classification:
    // A subscription order has stripeSubscriptionId OR stripeInvoiceId OR is active with subscription frequency
    const subscriptionOrders = userOrders.filter(
      (o) => o.stripeSubscriptionId || o.stripeInvoiceId || (o.subscriptionStatus === 'active' && o.subscriptionFrequency)
    );
    const renewalOrders = userOrders.filter((o) => o.stripeInvoiceId);
    const oneTimeOrders = userOrders.filter(
      (o) => !o.stripeSubscriptionId && !o.stripeInvoiceId && o.subscriptionStatus !== 'active'
    );

    const hasSubscription = subscriptionOrders.length > 0;
    const latestSubOrder = subscriptionOrders[0];

    let subscriptionStatus: 'active' | 'cancelled' | 'past_due' | 'none' = 'none';
    if (hasSubscription) {
      if (userOrders.some((o) => o.subscriptionStatus === 'active' || o.stripeSubscriptionId)) {
        subscriptionStatus = 'active';
      } else if (userOrders.some((o) => o.subscriptionStatus === 'cancelled' || o.status === 'Cancelled')) {
        subscriptionStatus = 'cancelled';
      } else if (userOrders.some((o) => o.subscriptionStatus === 'past_due')) {
        subscriptionStatus = 'past_due';
      } else if (latestSubOrder?.subscriptionStatus && latestSubOrder.subscriptionStatus !== 'none') {
        subscriptionStatus = latestSubOrder.subscriptionStatus;
      } else {
        subscriptionStatus = 'active';
      }
    }

    const subscriptionFrequency =
      latestSubOrder?.subscriptionFrequency || (hasSubscription ? 'Delivery every 1 Week' : null);
    const stripeSubscriptionId = latestSubOrder?.stripeSubscriptionId || null;

    // Items ordered breakdown across all orders
    const itemMap: Record<
      string,
      { name: string; totalQty: number; timesOrdered: number; lastOrdered: any }
    > = {};
    let totalItemsQuantity = 0;

    userOrders.forEach((o) => {
      (o.items || []).forEach((item: any) => {
        const name = item.name || 'Meal Plan';
        const qty = Number(item.qty) || 1;
        totalItemsQuantity += qty;
        if (!itemMap[name]) {
          itemMap[name] = { name, totalQty: 0, timesOrdered: 0, lastOrdered: o.createdAt };
        }
        itemMap[name].totalQty += qty;
        itemMap[name].timesOrdered += 1;
      });
    });

    const itemsBreakdown = Object.values(itemMap).sort((a, b) => b.totalQty - a.totalQty);

    // Wallet stats
    const userTx = transactions.filter((t) => t.userId === u.id);
    const referralEarned = userTx
      .filter((t) => t.type === 'credit' && /referral/i.test(t.description || ''))
      .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);
    const giftEarned = userTx
      .filter((t) => t.type === 'credit' && /gift/i.test(t.description || ''))
      .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);
    const totalEarned = userTx
      .filter((t) => t.type === 'credit')
      .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

    const resolvedName =
      u.name && u.name !== 'Direct Customer'
        ? u.name
        : latestOrder?.address?.fullName || u.name || 'Customer';
    const resolvedPhone = u.phone || latestOrder?.address?.phone || '—';
    const resolvedAddress = latestOrder?.address || u.addresses?.[0] || null;

    return {
      ...u,
      resolvedName,
      resolvedPhone,
      resolvedAddress,
      orderCount: userOrders.length,
      totalSpent,
      latestOrder,
      orders: userOrders,
      subscriptionOrders,
      renewalOrders,
      oneTimeOrders,
      hasSubscription,
      subscriptionStatus,
      subscriptionFrequency,
      stripeSubscriptionId,
      itemsBreakdown,
      totalItemsQuantity,
      referralEarned,
      giftEarned,
      totalEarned,
    };
  });

  // Top platform KPIs
  const totalCustomers = enriched.length;
  const activeSubscribers = enriched.filter((c) => c.subscriptionStatus === 'active').length;
  const cancelledSubscribers = enriched.filter((c) => c.subscriptionStatus === 'cancelled').length;
  const oneTimeCustomers = enriched.filter(
    (c) => c.subscriptionStatus === 'none' && c.orderCount > 0
  ).length;

  const totalSubscriptionOrdersPlaced = enriched.reduce(
    (sum, c) => sum + c.subscriptionOrders.length,
    0
  );
  const totalRenewalCyclesCount = enriched.reduce(
    (sum, c) => sum + c.renewalOrders.length,
    0
  );
  const totalRevenue = enriched.reduce((sum, c) => sum + c.totalSpent, 0);

  // Filter & Search
  const filtered = enriched.filter((u) => {
    // Status Filter
    if (statusFilter === 'active' && u.subscriptionStatus !== 'active') return false;
    if (statusFilter === 'cancelled' && u.subscriptionStatus !== 'cancelled') return false;
    if (statusFilter === 'onetime' && (u.subscriptionStatus !== 'none' || u.orderCount === 0))
      return false;

    // Search query
    const s = search.toLowerCase().trim();
    if (!s) return true;

    const matchesName = u.resolvedName.toLowerCase().includes(s);
    const matchesEmail = (u.email || '').toLowerCase().includes(s);
    const matchesPhone = u.resolvedPhone.toLowerCase().includes(s);
    const matchesOrder = u.orders.some((o: any) => o.id?.toLowerCase().includes(s));
    const matchesItem = u.itemsBreakdown.some((i: any) => i.name?.toLowerCase().includes(s));

    return matchesName || matchesEmail || matchesPhone || matchesOrder || matchesItem;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4 pb-1">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Customer Analytics & Tracker
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Track customer order frequencies, meal preferences, active subscriptions, and cancellations.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <div className="h-9 bg-emerald-50 text-emerald-800 px-3.5 rounded-xl flex items-center gap-2 border border-emerald-200/90 text-xs font-bold shadow-2xs">
            <Users size={15} className="text-emerald-700" />
            <span>{totalCustomers} Total Customers</span>
          </div>
          <div className="h-9 bg-primary/10 text-primary px-3.5 rounded-xl flex items-center gap-2 border border-primary/20 text-xs font-bold shadow-2xs">
            <Sparkles size={15} />
            <span>£{totalRevenue.toFixed(2)} Revenue</span>
          </div>
        </div>
      </div>

      {/* Top Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Active Subscribers */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-sm transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Active Subscribers
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-100 flex items-center justify-center">
              <Repeat size={15} />
            </div>
          </div>
          <div>
            <p className="text-2xl font-black text-emerald-700 tabular-nums tracking-tight">
              {activeSubscribers}
            </p>
            <p className="text-xs text-slate-500 mt-0.5">
              {totalCustomers > 0 ? ((activeSubscribers / totalCustomers) * 100).toFixed(0) : 0}% of customer base
            </p>
          </div>
        </div>

        {/* Card 2: Cancelled Plans */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-sm transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Cancelled Plans
            </span>
            <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-700 border border-rose-100 flex items-center justify-center">
              <XCircle size={15} />
            </div>
          </div>
          <div>
            <p className="text-2xl font-black text-rose-700 tabular-nums tracking-tight">
              {cancelledSubscribers}
            </p>
            <p className="text-xs text-slate-500 mt-0.5">
              Customers who paused or cancelled
            </p>
          </div>
        </div>

        {/* Card 3: Subscription Orders */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-sm transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Subscription Orders
            </span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 border border-blue-100 flex items-center justify-center">
              <ShoppingBag size={15} />
            </div>
          </div>
          <div>
            <p className="text-2xl font-black text-blue-700 tabular-nums tracking-tight">
              {totalSubscriptionOrdersPlaced}
            </p>
            <p className="text-xs text-slate-500 mt-0.5">
              Includes {totalRenewalCyclesCount} auto-renewals
            </p>
          </div>
        </div>

        {/* Card 4: One-Time Buyers */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-sm transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              One-Time Buyers
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 border border-amber-100 flex items-center justify-center">
              <Package size={15} />
            </div>
          </div>
          <div>
            <p className="text-2xl font-black text-amber-700 tabular-nums tracking-tight">
              {oneTimeCustomers}
            </p>
            <p className="text-xs text-slate-500 mt-0.5">Standard orders without plan</p>
          </div>
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3.5">
        {/* Filter Pills */}
        <div className="inline-flex items-center gap-1 bg-slate-100/90 p-1 rounded-xl border border-slate-200/80 text-xs font-semibold overflow-x-auto shadow-2xs">
          <button
            type="button"
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer whitespace-nowrap ${
              statusFilter === 'all'
                ? 'bg-white text-slate-900 shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All Customers ({totalCustomers})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('active')}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              statusFilter === 'active'
                ? 'bg-emerald-700 text-white shadow-xs font-bold'
                : 'text-slate-600 hover:text-emerald-800'
            }`}
          >
            <span>Active Subscribers</span>
            <span
              className={`px-1.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                statusFilter === 'active' ? 'bg-white/20 text-white' : 'bg-emerald-100 text-emerald-800'
              }`}
            >
              {activeSubscribers}
            </span>
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('cancelled')}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              statusFilter === 'cancelled'
                ? 'bg-rose-700 text-white shadow-xs font-bold'
                : 'text-slate-600 hover:text-rose-800'
            }`}
          >
            <span>Cancelled Plans</span>
            <span
              className={`px-1.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                statusFilter === 'cancelled' ? 'bg-white/20 text-white' : 'bg-rose-100 text-rose-800'
              }`}
            >
              {cancelledSubscribers}
            </span>
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('onetime')}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              statusFilter === 'onetime'
                ? 'bg-amber-700 text-white shadow-xs font-bold'
                : 'text-slate-600 hover:text-amber-800'
            }`}
          >
            <span>One-Time Buyers</span>
            <span
              className={`px-1.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                statusFilter === 'onetime' ? 'bg-white/20 text-white' : 'bg-amber-100 text-amber-800'
              }`}
            >
              {oneTimeCustomers}
            </span>
          </button>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search
            size={15}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name, phone, item..."
            className="w-full h-10 pl-10 pr-8 border border-slate-200/90 rounded-xl bg-white shadow-2xs text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 rounded"
            >
              <X size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Table Header Bar (Visible on lg+ screens for pixel-perfect vertical alignment) */}
      <div className="hidden lg:grid grid-cols-[minmax(280px,2fr)_180px_120px_110px_110px_44px] items-center gap-4 px-6 py-3 bg-slate-100/80 border border-slate-200/80 rounded-xl text-[11px] font-bold text-slate-500 uppercase tracking-wider shadow-2xs">
        <div>Customer</div>
        <div>Subscription Plan</div>
        <div className="text-center">Orders</div>
        <div className="text-center">Items Ordered</div>
        <div className="text-right">Total Spent</div>
        <div className="text-center">Action</div>
      </div>

      {/* Customer List */}
      {loading ? (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center text-slate-500 text-sm font-medium shadow-xs">
          <RefreshCw size={24} className="animate-spin text-primary mx-auto mb-3" />
          Loading customers and subscription tracking data...
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center text-slate-500 text-sm font-medium shadow-xs">
          No customers found matching your filter or search criteria.
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((u) => {
            const isExpanded = expandedId === u.id;
            return (
              <div
                key={u.id}
                className={`bg-white rounded-2xl border transition-all duration-200 overflow-hidden ${
                  isExpanded
                    ? 'border-primary shadow-md ring-1 ring-primary/20'
                    : 'border-slate-200/80 hover:border-slate-300 hover:shadow-xs'
                }`}
              >
                {/* Customer Row Clickable Header */}
                <button
                  type="button"
                  onClick={() => setExpandedId(isExpanded ? null : u.id)}
                  className="w-full text-left p-4 sm:p-5 lg:px-6 lg:py-4.5 focus:outline-none transition-colors hover:bg-slate-50/50 cursor-pointer"
                >
                  <div className="grid grid-cols-1 lg:grid-cols-[minmax(280px,2fr)_180px_120px_110px_110px_44px] items-center gap-4">
                    {/* 1. Customer Column */}
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div className="relative shrink-0">
                        <div className="w-11 h-11 rounded-full bg-gradient-to-br from-emerald-700 to-[#1E3B2B] text-white font-black text-sm flex items-center justify-center shadow-xs ring-2 ring-emerald-100">
                          {(u.resolvedName[0] || 'C').toUpperCase()}
                        </div>
                        {u.subscriptionStatus === 'active' && (
                          <span
                            className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full"
                            title="Active Subscriber"
                          />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-extrabold text-slate-900 text-sm tracking-tight truncate">
                            {u.resolvedName}
                          </span>
                          {u.isGuest && (
                            <span className="text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200 px-1.5 py-0.5 rounded-md shrink-0">
                              Guest
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-500 truncate mt-0.5 font-medium lowercase">
                          {u.email ? u.email.toLowerCase() : u.resolvedPhone}
                        </p>
                      </div>
                    </div>

                    {/* 2. Subscription Plan Column */}
                    <div className="flex items-center">
                      {u.subscriptionStatus === 'active' ? (
                        <span className="inline-flex items-center gap-1.5 text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200/90 px-2.5 py-1.5 rounded-lg whitespace-nowrap shadow-2xs">
                          <span className="inline-block animate-spin text-[10px]">🔁</span>
                          <span>{u.subscriptionFrequency || 'Active Subscription'}</span>
                        </span>
                      ) : u.subscriptionStatus === 'cancelled' ? (
                        <span className="inline-flex items-center gap-1.5 text-xs font-bold bg-rose-50 text-rose-800 border border-rose-200/90 px-2.5 py-1.5 rounded-lg whitespace-nowrap shadow-2xs">
                          <XCircle size={13} className="text-rose-600 shrink-0" />
                          <span>Plan Cancelled</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600 bg-slate-100/90 border border-slate-200 px-2.5 py-1.5 rounded-lg whitespace-nowrap">
                          <Package size={13} className="text-slate-500 shrink-0" />
                          <span>One-Time Buyer</span>
                        </span>
                      )}
                    </div>

                    {/* 3. Orders Column */}
                    <div className="flex flex-col items-start lg:items-center justify-center">
                      <span className="lg:hidden text-[10px] font-bold uppercase text-slate-400 mb-0.5">
                        Orders
                      </span>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="bg-blue-50 text-blue-800 border border-blue-200 font-extrabold text-xs px-2.5 py-0.5 rounded-md whitespace-nowrap">
                          {u.orderCount} total
                        </span>
                        {u.renewalOrders.length > 0 && (
                          <span
                            className="bg-emerald-50 text-emerald-800 border border-emerald-200 font-extrabold text-[11px] px-1.5 py-0.5 rounded-md whitespace-nowrap flex items-center gap-0.5"
                            title={`${u.renewalOrders.length} auto-renewal cycles charged`}
                          >
                            <Repeat size={10} />
                            <span>{u.renewalOrders.length}</span>
                          </span>
                        )}
                      </div>
                    </div>

                    {/* 4. Items Ordered Column */}
                    <div className="flex flex-col items-start lg:items-center justify-center">
                      <span className="lg:hidden text-[10px] font-bold uppercase text-slate-400 mb-0.5">
                        Items Ordered
                      </span>
                      <span className="font-extrabold text-slate-900 text-xs">
                        {u.totalItemsQuantity} {u.totalItemsQuantity === 1 ? 'item' : 'items'}
                      </span>
                      <span className="text-[10px] text-slate-400 font-medium">
                        {u.itemsBreakdown.length} unique
                      </span>
                    </div>

                    {/* 5. Total Spent Column */}
                    <div className="flex flex-col items-start lg:items-end justify-center">
                      <span className="lg:hidden text-[10px] font-bold uppercase text-slate-400 mb-0.5">
                        Total Spent
                      </span>
                      <span className="font-black text-slate-900 text-sm tabular-nums">
                        £{u.totalSpent.toFixed(2)}
                      </span>
                      <span className="text-[10px] text-slate-400 font-medium">
                        lifetime
                      </span>
                    </div>

                    {/* 6. Expand Action / Chevron Column */}
                    <div className="flex items-center justify-center">
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                          isExpanded
                            ? 'bg-primary/10 text-primary ring-1 ring-primary/30'
                            : 'bg-slate-100 text-slate-400 hover:text-slate-700 hover:bg-slate-200/80'
                        }`}
                      >
                        {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      </div>
                    </div>
                  </div>
                </button>

                {/* Expanded Details Drawer */}
                {isExpanded && (
                  <div className="border-t border-slate-200/80 px-5 sm:px-6 pb-6 pt-5 bg-slate-50/70 space-y-5">
                    {/* Top 3 Cards in Drawer */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {/* 1. Subscription Plan Tracker */}
                      <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-2xs">
                        <div className="flex items-center justify-between mb-3.5 border-b border-slate-100 pb-2.5">
                          <p className="text-[11px] font-extrabold uppercase tracking-wider text-emerald-900 flex items-center gap-1.5">
                            <Repeat size={13} className="text-emerald-700" />
                            <span>Subscription Details</span>
                          </p>
                          <span
                            className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md ${
                              u.subscriptionStatus === 'active'
                                ? 'bg-emerald-100 text-emerald-800'
                                : u.subscriptionStatus === 'cancelled'
                                ? 'bg-rose-100 text-rose-800'
                                : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {u.subscriptionStatus === 'active'
                              ? 'Active Plan'
                              : u.subscriptionStatus === 'cancelled'
                              ? 'Cancelled Plan'
                              : 'One-Time / No Plan'}
                          </span>
                        </div>
                        <div className="space-y-2.5 text-xs">
                          <div className="flex justify-between items-center">
                            <span className="text-slate-500 font-medium">Plan Frequency:</span>
                            <span className="font-bold text-slate-900">
                              {u.subscriptionFrequency || 'No Recurring Frequency'}
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-slate-500 font-medium">Plan Orders Placed:</span>
                            <span className="font-extrabold text-blue-700">
                              {u.subscriptionOrders.length} orders
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-slate-500 font-medium">Auto-Renewal Cycles:</span>
                            <span className="font-extrabold text-emerald-700">
                              {u.renewalOrders.length} renewals
                            </span>
                          </div>
                          {u.stripeSubscriptionId && (
                            <div className="pt-2 border-t border-dashed border-slate-200 flex flex-col gap-1.5">
                              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                                Stripe Subscription ID:
                              </span>
                              <div className="flex items-center gap-1.5">
                                <span className="font-mono text-[11px] bg-slate-100 px-2 py-1 rounded-md text-slate-800 select-all truncate flex-1 border border-slate-200/80">
                                  {u.stripeSubscriptionId}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => handleCopy(u.stripeSubscriptionId, `sub-${u.id}`)}
                                  className="p-1.5 rounded-md border border-slate-200 hover:bg-slate-100 text-slate-600 transition-colors"
                                  title="Copy Subscription ID"
                                >
                                  {copiedId === `sub-${u.id}` ? (
                                    <Check size={13} className="text-emerald-600" />
                                  ) : (
                                    <Copy size={13} />
                                  )}
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* 2. Contact & Delivery Info */}
                      <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-2xs">
                        <div className="flex items-center justify-between mb-3.5 border-b border-slate-100 pb-2.5">
                          <p className="text-[11px] font-extrabold uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
                            <MapPin size={13} className="text-primary" />
                            <span>Delivery & Contact</span>
                          </p>
                        </div>
                        <div className="space-y-2.5 text-xs">
                          <div className="flex items-center gap-2 text-slate-800">
                            <Mail size={13} className="text-slate-400 shrink-0" />
                            <span className="truncate">{u.email || 'No email provided'}</span>
                          </div>
                          <div className="flex items-center gap-2 text-slate-800">
                            <Phone size={13} className="text-slate-400 shrink-0" />
                            <span>{u.resolvedPhone}</span>
                          </div>
                          {u.resolvedAddress ? (
                            <div className="pt-2 border-t border-slate-100 text-slate-600 leading-relaxed">
                              <p className="font-bold text-slate-900">{u.resolvedAddress.fullName}</p>
                              <p>{u.resolvedAddress.addressLine1 || u.resolvedAddress.streetAddress}</p>
                              <p>
                                {[u.resolvedAddress.city, u.resolvedAddress.postcode]
                                  .filter(Boolean)
                                  .join(', ')}
                              </p>
                            </div>
                          ) : (
                            <p className="text-slate-400 text-xs italic pt-1">
                              No address recorded yet
                            </p>
                          )}
                        </div>
                      </div>

                      {/* 3. Wallet & Customer Stats */}
                      <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-2xs">
                        <div className="flex items-center justify-between mb-3.5 border-b border-slate-100 pb-2.5">
                          <p className="text-[11px] font-extrabold uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
                            <Wallet size={13} className="text-emerald-600" />
                            <span>Wallet & Value</span>
                          </p>
                          <span className="text-sm font-black text-emerald-700 tabular-nums">
                            £{(u.walletBalance || 0).toFixed(2)}
                          </span>
                        </div>
                        <div className="space-y-2.5 text-xs">
                          <div className="flex justify-between items-center">
                            <span className="text-slate-500 font-medium">Total Lifetime Orders:</span>
                            <span className="font-extrabold text-slate-900">{u.orderCount} orders</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-slate-500 font-medium">Total Revenue Spent:</span>
                            <span className="font-black text-slate-900 tabular-nums">
                              £{u.totalSpent.toFixed(2)}
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-slate-500 font-medium">Referral Rewards Earned:</span>
                            <span className="font-bold text-blue-700">£{u.referralEarned.toFixed(2)}</span>
                          </div>
                          {u.referralCode && (
                            <div className="flex justify-between items-center pt-2 border-t border-dashed border-slate-200">
                              <span className="text-slate-500 font-medium">Referral Code:</span>
                              <span className="font-mono font-bold tracking-wider text-primary">
                                {u.referralCode}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* 4. Items Ordered Breakdown */}
                    <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-2xs">
                      <div className="flex items-center justify-between mb-3.5 border-b border-slate-100 pb-2.5 flex-wrap gap-2">
                        <p className="text-[11px] font-extrabold uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
                          <Utensils size={13} className="text-primary" />
                          <span>Items Ordered Breakdown</span>
                        </p>
                        <span className="text-xs text-slate-500 font-semibold">
                          {u.itemsBreakdown.length} unique meal items ({u.totalItemsQuantity} total portions)
                        </span>
                      </div>

                      {u.itemsBreakdown.length === 0 ? (
                        <p className="text-xs text-slate-400 py-2 italic">
                          No meal items recorded for this customer yet.
                        </p>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                          {u.itemsBreakdown.map((item: any, idx: number) => (
                            <div
                              key={idx}
                              className="bg-slate-50 border border-slate-200/80 rounded-lg p-2.5 flex items-center justify-between gap-3 text-xs"
                            >
                              <div className="min-w-0">
                                <p className="font-bold text-slate-900 truncate">{item.name}</p>
                                <p className="text-[10px] text-slate-500">
                                  Ordered across {item.timesOrdered} order{item.timesOrdered > 1 ? 's' : ''}
                                </p>
                              </div>
                              <span className="bg-emerald-100 text-emerald-800 font-black px-2 py-0.5 rounded-md text-xs shrink-0 tabular-nums">
                                {item.totalQty}x
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* 5. Complete Order History Table */}
                    <div className="bg-white rounded-xl border border-slate-200/80 shadow-2xs overflow-hidden">
                      <div className="p-3.5 bg-slate-50/80 border-b border-slate-200/80 flex items-center justify-between">
                        <p className="text-[11px] font-extrabold uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
                          <ShoppingBag size={13} className="text-blue-700" />
                          <span>Complete Order History ({u.orders.length})</span>
                        </p>
                        <span className="text-xs text-slate-500 font-medium">
                          All orders placed by this customer
                        </span>
                      </div>

                      {u.orders.length === 0 ? (
                        <p className="text-xs text-slate-400 p-6 text-center italic">
                          No orders placed yet.
                        </p>
                      ) : (
                        <div className="overflow-x-auto">
                          <table className="w-full text-xs">
                            <thead className="bg-slate-50 text-[10px] font-bold text-slate-500 uppercase border-b border-slate-200/80">
                              <tr>
                                <th className="text-left px-4 py-2.5">Order ID</th>
                                <th className="text-left px-4 py-2.5">Date</th>
                                <th className="text-left px-4 py-2.5">Order Type</th>
                                <th className="text-left px-4 py-2.5">Items Ordered</th>
                                <th className="text-left px-4 py-2.5">Delivery Slot</th>
                                <th className="text-left px-4 py-2.5">Status</th>
                                <th className="text-right px-4 py-2.5">Total (£)</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                              {u.orders.map((o: any) => {
                                const isRenewal = Boolean(o.stripeInvoiceId);
                                const isSubscription = Boolean(
                                  o.stripeSubscriptionId || (o.subscriptionStatus === 'active' && o.subscriptionFrequency)
                                );
                                return (
                                  <tr key={o.id} className="hover:bg-slate-50/80 transition-colors">
                                    <td className="px-4 py-3 font-extrabold text-primary">
                                      {o.id}
                                    </td>
                                    <td className="px-4 py-3 text-slate-500 whitespace-nowrap">
                                      {o.createdAt?.toDate
                                        ? o.createdAt.toDate().toLocaleDateString('en-GB', {
                                            day: '2-digit',
                                            month: 'short',
                                            year: 'numeric',
                                          })
                                        : '—'}
                                    </td>
                                    <td className="px-4 py-3 whitespace-nowrap">
                                      {isRenewal ? (
                                        <span className="inline-flex items-center gap-1 text-[10px] font-extrabold bg-purple-50 text-purple-700 border border-purple-200 px-2 py-0.5 rounded">
                                          <span>🔁</span> Auto-Renewal
                                        </span>
                                      ) : isSubscription ? (
                                        <span className="inline-flex items-center gap-1 text-[10px] font-extrabold bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded">
                                          <span>📦</span> Plan Sign-up
                                        </span>
                                      ) : (
                                        <span className="inline-flex items-center gap-1 text-[10px] font-medium bg-slate-100 text-slate-700 border border-slate-200 px-2 py-0.5 rounded">
                                          One-Time Order
                                        </span>
                                      )}
                                    </td>
                                    <td className="px-4 py-3 text-slate-800 font-medium max-w-[240px]">
                                      {o.items && o.items.length > 0 ? (
                                        <div className="space-y-0.5">
                                          {o.items.map((it: any, iIdx: number) => (
                                            <div key={iIdx} className="truncate">
                                              <span className="font-bold text-primary">
                                                {it.qty || 1}x
                                              </span>{' '}
                                              {it.name}
                                            </div>
                                          ))}
                                        </div>
                                      ) : (
                                        <span className="text-slate-400 italic">Standard Plan</span>
                                      )}
                                    </td>
                                    <td className="px-4 py-3 text-slate-500 whitespace-nowrap">
                                      {o.deliverySlot || 'Standard Delivery'}
                                    </td>
                                    <td className="px-4 py-3 whitespace-nowrap">
                                      <span
                                        className={`text-[10px] font-extrabold px-2 py-0.5 rounded ${
                                          o.status === 'Delivered'
                                            ? 'bg-emerald-100 text-emerald-800'
                                            : o.status === 'Cancelled'
                                            ? 'bg-rose-100 text-rose-700'
                                            : o.status === 'Confirmed'
                                            ? 'bg-purple-100 text-purple-800'
                                            : 'bg-blue-100 text-blue-800'
                                        }`}
                                      >
                                        {o.status || 'Order Received'}
                                      </span>
                                    </td>
                                    <td className="px-4 py-3 text-right font-black tabular-nums text-slate-900">
                                      £{(o.total || 0).toFixed(2)}
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
