'use client';
import React, { useState, useEffect } from 'react';
import {
  Search,
  CreditCard,
  Wallet,
  Users,
  Eye,
  X,
  PoundSterling,
  Calendar,
  HelpCircle,
} from 'lucide-react';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/context/AuthContext';

const slotNames: Record<string, string> = {
  'slot-1': 'Morning',
  'slot-2': 'Afternoon',
  'slot-3': 'Evening',
};

const statusColors: Record<string, string> = {
  'Order Received': 'bg-blue-100 text-blue-700',
  Delivered: 'bg-green-100 text-green-700',
  'Out for Delivery': 'bg-blue-100 text-blue-700',
  Preparing: 'bg-amber-100 text-amber-700',
  Confirmed: 'bg-purple-100 text-purple-700',
  Pending: 'bg-yellow-100 text-yellow-700',
  Cancelled: 'bg-red-100 text-red-600',
};

export default function AdminPaymentsClient() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [paymentFilter, setPaymentFilter] = useState('All');
  const [typeFilter, setTypeFilter] = useState('All');
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (!user || user.email !== 'domealuk79812@gmail.com') return;

    const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, (snap) => {
      setOrders(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });

    return () => unsub();
  }, [user]);

  // Calculations for KPI Cards
  const stats = React.useMemo(() => {
    let totalRevenue = 0;
    let cardRevenue = 0;
    let codRevenue = 0;
    let walletAppliedTotal = 0;
    let activeSubscriptions = 0;

    orders.forEach((o) => {
      if (o.status === 'Cancelled') return;
      const orderTotal = o.total || 0;
      const orderWallet = o.walletApplied || 0;

      totalRevenue += orderTotal;
      walletAppliedTotal += orderWallet;

      if (o.paymentMethod === 'pay-cod') {
        codRevenue += orderTotal;
      } else {
        cardRevenue += orderTotal;
      }

      if (o.stripeSubscriptionId && o.subscriptionStatus === 'active') {
        activeSubscriptions++;
      }
    });

    return {
      totalRevenue,
      cardRevenue,
      codRevenue,
      walletAppliedTotal,
      activeSubscriptions,
    };
  }, [orders]);

  // Filtering
  const filteredOrders = React.useMemo(() => {
    return orders.filter((o) => {
      const name = o.address?.fullName || '';
      const email = o.address?.email || '';
      const phone = o.address?.phone || '';
      const subId = o.stripeSubscriptionId || '';
      const orderId = o.id || '';

      const matchSearch =
        name.toLowerCase().includes(search.toLowerCase()) ||
        email.toLowerCase().includes(search.toLowerCase()) ||
        phone.toLowerCase().includes(search.toLowerCase()) ||
        subId.toLowerCase().includes(search.toLowerCase()) ||
        orderId.toLowerCase().includes(search.toLowerCase());

      const matchPayment =
        paymentFilter === 'All' ||
        (paymentFilter === 'Card' && o.paymentMethod !== 'pay-cod') ||
        (paymentFilter === 'COD' && o.paymentMethod === 'pay-cod');

      const matchType =
        typeFilter === 'All' ||
        (typeFilter === 'Subscription' && !!o.stripeSubscriptionId) ||
        (typeFilter === 'One-time' && !o.stripeSubscriptionId);

      return matchSearch && matchPayment && matchType;
    });
  }, [orders, search, paymentFilter, typeFilter]);

  const formatDate = (ts: any) => {
    if (!ts?.toDate) return 'N/A';
    return ts.toDate().toLocaleString('en-GB', {
      dateStyle: 'medium',
      timeStyle: 'short',
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-foreground">Payment & Transaction Monitor</h1>
        <p className="text-sm text-muted-foreground">
          Monitor all customer cashflows, card debits, and subscription statuses.
        </p>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Volume */}
        <div className="bg-[#1E3B2B] text-white p-5 rounded-2xl border border-white/10 shadow-lg relative overflow-hidden">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[10px] font-800 uppercase tracking-widest text-blue-200">
                Total Cashflow
              </p>
              <p className="text-2xl font-900 mt-2 tabular-nums">
                £{stats.totalRevenue.toFixed(2)}
              </p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
              <PoundSterling size={20} className="text-white" />
            </div>
          </div>
          <div className="absolute right-0 bottom-0 translate-y-6 translate-x-4 opacity-10">
            <PoundSterling size={120} />
          </div>
        </div>

        {/* Card 2: Stripe Online Card */}
        <div className="bg-white p-5 rounded-2xl border border-border shadow-md flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[10px] font-800 uppercase tracking-widest text-muted-foreground">
                Stripe Card Revenue
              </p>
              <p className="text-2xl font-900 mt-2 text-foreground tabular-nums">
                £{stats.cardRevenue.toFixed(2)}
              </p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
              <CreditCard size={20} />
            </div>
          </div>
          <div className="mt-2 text-xs text-muted-foreground">
            Processed online via Stripe Card Element
          </div>
        </div>

        {/* Card 3: COD Payments */}
        <div className="bg-white p-5 rounded-2xl border border-border shadow-md flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[10px] font-800 uppercase tracking-widest text-muted-foreground">
                Cash on Delivery (COD)
              </p>
              <p className="text-2xl font-900 mt-2 text-foreground tabular-nums">
                £{stats.codRevenue.toFixed(2)}
              </p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
              <span className="text-lg">💵</span>
            </div>
          </div>
          <div className="mt-2 text-xs text-muted-foreground">
            Awaiting manual collections on delivery
          </div>
        </div>

        {/* Card 4: Subscriptions */}
        <div className="bg-white p-5 rounded-2xl border border-border shadow-md flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[10px] font-800 uppercase tracking-widest text-muted-foreground">
                Active Subscriptions
              </p>
              <p className="text-2xl font-900 mt-2 text-primary tabular-nums">
                {stats.activeSubscriptions}
              </p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
              <Users size={20} />
            </div>
          </div>
          <div className="mt-2 text-xs text-muted-foreground">
            Recurring weekly or fortnightly accounts
          </div>
        </div>
      </div>

      {/* Wallet usage info banner */}
      {stats.walletAppliedTotal > 0 && (
        <div className="bg-green-50 border border-green-200 rounded-2xl p-4 flex items-center gap-3 shadow-sm text-green-800 text-sm">
          <Wallet size={18} className="shrink-0" />
          <span className="font-600">
            A total of <span className="font-800">£{stats.walletAppliedTotal.toFixed(2)}</span> has
            been paid using customer loyalty wallet balances.
          </span>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search
            size={16}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by customer, email, phone, order, or stripe subscription ID..."
            className="w-full pl-10 pr-4 py-2.5 border border-border rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-primary/30 text-sm"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2.5">
          <select
            value={paymentFilter}
            onChange={(e) => setPaymentFilter(e.target.value)}
            className="px-3.5 py-2 border border-border rounded-xl bg-white text-sm font-600 text-foreground focus:outline-none"
          >
            <option value="All">All Payment Methods</option>
            <option value="Card">Stripe Card</option>
            <option value="COD">Cash on Delivery (COD)</option>
          </select>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3.5 py-2 border border-border rounded-xl bg-white text-sm font-600 text-foreground focus:outline-none"
          >
            <option value="All">All Order Types</option>
            <option value="Subscription">Subscriptions Only</option>
            <option value="One-time">One-time Only</option>
          </select>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white rounded-2xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted border-b border-border">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-700 text-muted-foreground uppercase tracking-wide">
                  Date / Time
                </th>
                <th className="px-4 py-3 text-left text-xs font-700 text-muted-foreground uppercase tracking-wide">
                  Order ID
                </th>
                <th className="px-4 py-3 text-left text-xs font-700 text-muted-foreground uppercase tracking-wide">
                  Customer details
                </th>
                <th className="px-4 py-3 text-left text-xs font-700 text-muted-foreground uppercase tracking-wide">
                  Payment Method
                </th>
                <th className="px-4 py-3 text-left text-xs font-700 text-muted-foreground uppercase tracking-wide">
                  Status
                </th>
                <th className="px-4 py-3 text-right text-xs font-700 text-muted-foreground uppercase tracking-wide">
                  Amount
                </th>
                <th className="px-4 py-3 text-center text-xs font-700 text-muted-foreground uppercase tracking-wide">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-muted-foreground text-sm">
                    Loading payments...
                  </td>
                </tr>
              ) : filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-muted-foreground text-sm">
                    No transactions found matching the selected filters.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((o) => {
                  const hasSub = !!o.stripeSubscriptionId;
                  const isCard = o.paymentMethod !== 'pay-cod';
                  const isCancelled = o.status === 'Cancelled';

                  return (
                    <tr key={o.id} className="hover:bg-muted/40 transition-colors">
                      {/* Date */}
                      <td className="px-4 py-3 text-muted-foreground text-xs whitespace-nowrap">
                        {formatDate(o.createdAt)}
                      </td>

                      {/* Order ID */}
                      <td className="px-4 py-3 font-700 text-primary text-xs whitespace-nowrap">
                        {o.id}
                      </td>

                      {/* Customer Details */}
                      <td className="px-4 py-3">
                        <p className="font-600 text-foreground text-sm">
                          {o.address?.fullName || 'Unknown'}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {o.address?.email || o.userId}
                        </p>
                        <p className="text-xs text-muted-foreground font-550">
                          {o.address?.phone || ''}
                        </p>
                      </td>

                      {/* Payment Method */}
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex flex-col gap-0.5">
                          <span className={`inline-flex items-center text-xs font-700`}>
                            {isCard ? '💳 Stripe Card' : '💵 Cash on Delivery'}
                          </span>
                          {hasSub ? (
                            <span className="text-[10px] font-800 text-primary uppercase tracking-wide">
                              🔁 Subscription
                            </span>
                          ) : (
                            <span className="text-[10px] font-600 text-muted-foreground uppercase tracking-wide">
                              One-time Order
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3 whitespace-nowrap">
                        {isCancelled ? (
                          <span className="inline-flex items-center text-[10px] font-800 bg-red-100 text-red-600 px-2 py-0.5 rounded-full">
                            Cancelled (Refunded/Stopped)
                          </span>
                        ) : isCard ? (
                          <span className="inline-flex items-center text-[10px] font-800 bg-green-100 text-green-700 px-2.5 py-0.5 rounded-full">
                            Paid successfully
                          </span>
                        ) : (
                          <span className="inline-flex items-center text-[10px] font-800 bg-amber-100 text-amber-700 px-2.5 py-0.5 rounded-full">
                            Pending COD
                          </span>
                        )}
                      </td>

                      {/* Amount */}
                      <td className="px-4 py-3 text-right whitespace-nowrap">
                        <p className="font-800 text-foreground tabular-nums">
                          £{(o.total || 0).toFixed(2)}
                        </p>
                        {o.walletApplied > 0 && (
                          <p className="text-[10px] text-green-600 font-600">
                            -£{o.walletApplied.toFixed(2)} Wallet
                          </p>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3 text-center whitespace-nowrap">
                        <button
                          onClick={() => setSelectedOrder(o)}
                          className="p-1.5 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors border border-blue-200"
                        >
                          <Eye size={15} />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Details Modal (Same look/feel for uniform professional standard) */}
      {selectedOrder && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setSelectedOrder(null)}
          />
          <div className="relative bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95">
            {/* Header */}
            <div className="p-5 border-b border-border bg-gray-50 flex items-center justify-between shrink-0">
              <div>
                <h2 className="font-800 text-lg text-[#1E3B2B]">
                  Transaction Detail: {selectedOrder.id}
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Placed on {formatDate(selectedOrder.createdAt)}
                </p>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="p-2 bg-white rounded-full text-muted-foreground hover:text-foreground shadow-sm border border-border transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="overflow-y-auto p-6 space-y-6 flex-1">
              {/* Customer Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100 shadow-sm flex flex-col items-start">
                  <h3 className="font-800 text-xs text-blue-800 uppercase tracking-wider mb-2">
                    Customer Info
                  </h3>
                  <p className="font-700 text-sm text-foreground">
                    {selectedOrder.address?.fullName || 'Unknown'}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {selectedOrder.address?.email}
                  </p>
                  <p className="text-sm text-muted-foreground">{selectedOrder.address?.phone}</p>
                  {selectedOrder.subscriptionFrequency && (
                    <div className="mt-3 inline-block bg-blue-100 text-blue-800 px-3 py-1.5 rounded-lg text-xs font-800 border border-blue-200 shadow-sm">
                      {selectedOrder.subscriptionFrequency}
                    </div>
                  )}
                </div>
                <div className="bg-orange-50/50 p-4 rounded-xl border border-orange-100 shadow-sm">
                  <h3 className="font-800 text-xs text-orange-800 uppercase tracking-wider mb-2">
                    Delivery Details
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {selectedOrder.address?.addressLine1 || selectedOrder.address?.streetAddress}
                    {selectedOrder.address?.addressLine2
                      ? `, ${selectedOrder.address.addressLine2}`
                      : ''}
                    <br />
                    {selectedOrder.address?.city}, {selectedOrder.address?.postcode}
                  </p>
                  {selectedOrder.deliveryDates && selectedOrder.deliveryDates.length > 0 ? (
                    <p className="text-sm font-600 text-foreground mt-3">
                      Delivery Dates:{' '}
                      {selectedOrder.deliveryDates
                        .map((d: string) =>
                          new Date(d).toLocaleDateString('en-GB', {
                            day: 'numeric',
                            month: 'short',
                          })
                        )
                        .join(', ')}
                    </p>
                  ) : (
                    <p className="text-sm font-600 text-foreground mt-3">
                      Delivery Date: {selectedOrder.deliveryDate || 'N/A'}
                    </p>
                  )}
                  {selectedOrder.deliverySlot && (
                    <p className="text-xs font-700 text-orange-800 mt-1 bg-orange-100 inline-block px-2 py-0.5 rounded">
                      Slot: {slotNames[selectedOrder.deliverySlot] || selectedOrder.deliverySlot}
                    </p>
                  )}
                </div>
              </div>

              {/* Billing Info */}
              <div className="bg-gray-50/50 p-4 rounded-xl border border-border shadow-sm">
                <h3 className="font-800 text-xs text-primary uppercase tracking-wider mb-3">
                  Billing & Payment Info
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-xs text-muted-foreground font-600">Payment Method</p>
                    <p className="font-700 text-foreground mt-0.5">
                      {selectedOrder.paymentMethod === 'pay-cod'
                        ? '💵 Cash on Delivery (COD)'
                        : '💳 Online Payment (Stripe Card)'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground font-600">Payment Status</p>
                    <p className="mt-1">
                      {selectedOrder.status === 'Cancelled' ? (
                        <span className="inline-flex items-center text-[10px] font-800 bg-red-100 text-red-600 px-2.5 py-0.5 rounded border border-red-200">
                          Cancelled / Stopped
                        </span>
                      ) : selectedOrder.paymentMethod === 'pay-cod' ? (
                        <span className="inline-flex items-center text-[10px] font-800 bg-amber-50 text-amber-700 px-2.5 py-0.5 rounded border border-amber-200">
                          Pending Cash Delivery
                        </span>
                      ) : (
                        <span className="inline-flex items-center text-[10px] font-800 bg-green-50 text-green-700 px-2.5 py-0.5 rounded border border-green-200">
                          Paid Successfully
                        </span>
                      )}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground font-600">Subscription Status</p>
                    <p className="mt-1">
                      {selectedOrder.subscriptionStatus === 'active' ? (
                        <span className="inline-flex items-center text-[10px] font-800 bg-green-50 text-green-700 px-2.5 py-0.5 rounded border border-green-200">
                          Active
                        </span>
                      ) : selectedOrder.subscriptionStatus === 'cancelled' ? (
                        <span className="inline-flex items-center text-[10px] font-800 bg-gray-100 text-gray-500 px-2.5 py-0.5 rounded border border-gray-200">
                          Cancelled
                        </span>
                      ) : selectedOrder.subscriptionStatus === 'cod' ? (
                        <span className="inline-flex items-center text-[10px] font-800 bg-blue-50 text-blue-700 px-2.5 py-0.5 rounded border border-blue-200">
                          Cash on Delivery
                        </span>
                      ) : (
                        <span className="inline-flex items-center text-[10px] font-800 bg-gray-50 text-gray-500 px-2.5 py-0.5 rounded border border-gray-200">
                          None (One-time)
                        </span>
                      )}
                    </p>
                  </div>
                </div>
                {selectedOrder.stripeSubscriptionId && (
                  <div className="mt-3 pt-3 border-t border-border/50 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <span className="text-xs text-muted-foreground font-600">
                      Stripe Subscription ID:
                    </span>
                    <span className="font-mono text-xs bg-white px-2.5 py-1 rounded border border-border/40 text-foreground select-all">
                      {selectedOrder.stripeSubscriptionId}
                    </span>
                  </div>
                )}
              </div>

              {/* Order Items */}
              {selectedOrder.allergiesInfo && (
                <div className="bg-red-50 p-4 rounded-xl border border-red-200 shadow-sm">
                  <h3 className="font-800 text-xs text-red-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <span className="text-base">⚠️</span> Allergy Information
                  </h3>
                  <p className="text-sm font-600 text-red-900">{selectedOrder.allergiesInfo}</p>
                </div>
              )}

              <div>
                <h3 className="font-800 text-sm text-[#1E3B2B] mb-3 border-b border-border pb-2">
                  Items Purchased
                </h3>
                <div className="space-y-3">
                  {selectedOrder.items?.map((item: any, idx: number) => {
                    const extraPriceTotal =
                      item.subItems?.reduce((sum: number, sub: any) => sum + (sub.price || 0), 0) ||
                      0;
                    const basePrice = item.price - extraPriceTotal;

                    return (
                      <div
                        key={idx}
                        className="bg-muted/20 p-4 rounded-xl border border-border shadow-sm"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <span className="font-700 text-foreground">
                            <span className="text-primary mr-1">{item.qty}x</span> {item.name}
                          </span>
                          <span className="font-800 tabular-nums">
                            £{(basePrice * item.qty).toFixed(2)}
                          </span>
                        </div>
                        {item.subItems && item.subItems.length > 0 && (
                          <div className="pl-6 space-y-1.5 mt-2">
                            <p className="text-[10px] font-800 text-muted-foreground uppercase tracking-widest mb-1 border-b border-border/50 pb-1 inline-block">
                              Package Contents
                            </p>
                            {item.subItems.map((sub: any, sIdx: number) => (
                              <div
                                key={sIdx}
                                className="flex justify-between text-xs text-muted-foreground"
                              >
                                <span className="flex items-center gap-2">
                                  <div className="w-1.5 h-1.5 rounded-full bg-primary/40" />
                                  {sub.name}
                                </span>
                                {sub.price > 0 && (
                                  <span className="font-600">
                                    +£{(sub.price * item.qty).toFixed(2)}
                                  </span>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Summary */}
              <div className="bg-gray-50 p-5 rounded-xl border border-border shadow-sm space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground font-500">Subtotal</span>
                  <span className="font-600 tabular-nums">
                    £
                    {(
                      selectedOrder.subtotal ||
                      (selectedOrder.total || 0) +
                        (selectedOrder.discountApplied || 0) +
                        (selectedOrder.studentDiscountApplied || 0) +
                        (selectedOrder.walletApplied || 0) -
                        (selectedOrder.dabbaFeeApplied ? selectedOrder.dabbaFee || 12.0 : 0)
                    ).toFixed(2)}
                  </span>
                </div>
                {selectedOrder.studentDiscountApplied > 0 && (
                  <div className="flex justify-between text-sm font-700 text-[#C39B54]">
                    <span>🎓 Student Discount ({selectedOrder.studentDiscountPercent || 0}%)</span>
                    <span className="tabular-nums">
                      -£{selectedOrder.studentDiscountApplied.toFixed(2)}
                    </span>
                  </div>
                )}
                {selectedOrder.discountApplied > 0 && (
                  <div className="flex justify-between text-sm font-700 text-orange-600">
                    <span>🏷️ Promo Discount</span>
                    <span className="tabular-nums">
                      -£{selectedOrder.discountApplied.toFixed(2)}
                    </span>
                  </div>
                )}
                {selectedOrder.walletApplied > 0 && (
                  <div className="flex justify-between text-sm font-700 text-green-700">
                    <span className="flex items-center gap-1.5">
                      <Wallet size={16} /> Wallet Applied
                    </span>
                    <span className="tabular-nums">-£{selectedOrder.walletApplied.toFixed(2)}</span>
                  </div>
                )}
                {selectedOrder.dabbaFeeApplied && (
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Reusable Dabba Deposit</span>
                    <span className="tabular-nums">
                      £{(selectedOrder.dabbaFee || 12.0).toFixed(2)}
                    </span>
                  </div>
                )}
                <div className="flex justify-between text-base font-800 border-t border-border/50 pt-3">
                  <span className="text-[#1E3B2B]">Total Amount Paid</span>
                  <span className="text-primary tabular-nums text-lg">
                    £{(selectedOrder.total || 0).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-5 border-t border-border bg-gray-50 flex gap-3 shrink-0">
              <button
                onClick={() => setSelectedOrder(null)}
                className="flex-1 bg-white border border-border text-foreground font-700 py-3 rounded-xl hover:bg-muted transition-colors active:scale-95 shadow-sm"
              >
                Close Details
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
