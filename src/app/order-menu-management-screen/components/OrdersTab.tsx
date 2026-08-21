'use client';
import React, { useState, useEffect } from 'react';
import { Search, Filter, ChevronDown, Eye, X, Wallet, FileText, Download } from 'lucide-react';
import { toast } from 'sonner';
import {
  exportDeliveriesToPdf,
  exportDeliveriesToExcel,
  formatOrderDeliveryDateTime,
  DeliveryExportItem,
} from '@/lib/exportUtils';
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  doc,
  updateDoc,
  getDoc,
  getDocs,
  where,
  increment,
  addDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/context/AuthContext';

const statusOptions = [
  'All',
  'Order Received',
  'Confirmed',
  'Preparing',
  'Out for Delivery',
  'Delivered',
  'Cancelled',
];

const statusColors: Record<string, string> = {
  'Order Received': 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100',
  Delivered: 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100',
  'Out for Delivery': 'bg-sky-50 text-sky-700 border-sky-200 hover:bg-sky-100',
  Preparing: 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100',
  Confirmed: 'bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100',
  Pending: 'bg-yellow-50 text-yellow-700 border-yellow-200 hover:bg-yellow-100',
  Cancelled: 'bg-red-50 text-red-600 border-red-200 hover:bg-red-100',
};

const slotNames: Record<string, string> = {
  'slot-1': 'Morning',
  'slot-2': 'Afternoon',
  'slot-3': 'Evening',
};

export default function OrdersTab() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [page, setPage] = useState(1);
  const perPage = 8;
  const { user } = useAuth();

  useEffect(() => {
    if (!user || user.email !== 'domealuk79812@gmail.com') return;

    const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, (snap) => {
      const fetched = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setOrders(fetched);
      setLoading(false);
    });
    return () => unsub();
  }, [user]);

  const updateStatus = async (orderId: string, newStatus: string) => {
    try {
      await updateDoc(doc(db, 'orders', orderId), { status: newStatus });

      if (newStatus === 'Delivered') {
        const orderDoc = await getDoc(doc(db, 'orders', orderId));
        if (orderDoc.exists()) {
          const orderData = orderDoc.data();
          if (orderData.userId && !orderData.referralRewarded) {
            const userDoc = await getDoc(doc(db, 'users', orderData.userId));
            if (userDoc.exists()) {
              const userData = userDoc.data();
              if (userData.referredBy && !userData.referralRewardClaimed) {
                // Fetch the global referral amount
                let referralAmount = 10;
                const settingsDoc = await getDoc(doc(db, 'settings', 'global'));
                if (settingsDoc.exists() && settingsDoc.data().referralAmount !== undefined) {
                  referralAmount = settingsDoc.data().referralAmount;
                } else {
                  const oldRef = await getDoc(doc(db, 'settings', 'referral'));
                  if (oldRef.exists() && oldRef.data().amount !== undefined) {
                    referralAmount = oldRef.data().amount;
                  }
                }

                // Reward the referred user
                await updateDoc(doc(db, 'users', orderData.userId), {
                  walletBalance: increment(referralAmount),
                  referralRewardClaimed: true,
                });
                await addDoc(collection(db, 'wallet_transactions'), {
                  userId: orderData.userId,
                  amount: referralAmount,
                  type: 'credit',
                  status: 'completed',
                  description: `Referral signup reward`,
                  createdAt: serverTimestamp(),
                });

                // Reward the referrer
                const qReferrer = query(
                  collection(db, 'users'),
                  where('referralCode', '==', userData.referredBy)
                );
                const referrerSnaps = await getDocs(qReferrer);
                if (!referrerSnaps.empty) {
                  const referrerDoc = referrerSnaps.docs[0];
                  await updateDoc(doc(db, 'users', referrerDoc.id), {
                    walletBalance: increment(referralAmount),
                  });
                  await addDoc(collection(db, 'wallet_transactions'), {
                    userId: referrerDoc.id,
                    amount: referralAmount,
                    type: 'credit',
                    status: 'completed',
                    description: `Referral reward for inviting ${userData.name || 'a friend'}`,
                    createdAt: serverTimestamp(),
                  });
                }

                // Mark order as rewarded
                await updateDoc(doc(db, 'orders', orderId), {
                  referralRewarded: true,
                });

                toast.success(`Referral reward of £${referralAmount} added to both wallets!`);
              }
            }
          }
        }
      }

      toast.success(`Order ${orderId} → ${newStatus}`);
    } catch (err) {
      console.error(err);
      toast.error('Failed to update status');
    }
  };

  const filtered = orders.filter((o) => {
    const name = o.address?.fullName || '';
    const matchSearch =
      name.toLowerCase().includes(search.toLowerCase()) ||
      o.id.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'All' || o.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const paginated = filtered.slice((page - 1) * perPage, page * perPage);

  const formatDate = (ts: any) => {
    if (!ts?.toDate) return 'N/A';
    return ts
      .toDate()
      .toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  const formatDeliveryDateTime = (order: any) => {
    let datePart = '';
    if (Array.isArray(order.deliveryDates) && order.deliveryDates.length > 0) {
      datePart = order.deliveryDates.join(', ');
    } else if (order.deliveryDate) {
      datePart = order.deliveryDate;
    } else if (order.createdAt?.toDate) {
      datePart = order.createdAt.toDate().toLocaleDateString('en-GB');
    } else {
      datePart = 'Date N/A';
    }

    const slotPart = slotNames[order.deliverySlot] || order.deliverySlot || '';
    return slotPart ? `${datePart} (${slotPart})` : datePart;
  };

  const formatFullAddress = (addr: any) => {
    if (!addr) return 'Not provided';
    const parts = [
      addr.addressLine1,
      addr.addressLine2,
      addr.landmark,
      addr.city,
      addr.postcode,
    ].filter(Boolean);
    return parts.length > 0 ? parts.join(', ') : 'Not provided';
  };

  const formatSpecialNotes = (order: any) => {
    const notes = order.notes || order.deliveryInstructions || '';
    const allergies = order.allergiesInfo ? `Allergies: ${order.allergiesInfo}` : '';
    const combined = [notes, allergies].filter(Boolean).join(' | ');
    return combined || 'None';
  };

  const mapOrdersToDeliveryExport = (items: any[]): DeliveryExportItem[] => {
    return items.map((o) => ({
      fullName: o.address?.fullName || o.userName || 'Customer',
      deliveryDateTime: formatOrderDeliveryDateTime(o),
      deliveryFullAddress: formatFullAddress(o.address),
      specialNotes: formatSpecialNotes(o),
    }));
  };

  const handleDownloadPdf = async () => {
    const dataToExport = filtered.length > 0 ? filtered : orders;
    const exportItems = mapOrdersToDeliveryExport(dataToExport);

    await exportDeliveriesToPdf({
      title: 'Orders Delivery Schedule',
      subtitle:
        statusFilter === 'All'
          ? `All Orders (${exportItems.length} records)`
          : `Status Filter: ${statusFilter} (${exportItems.length} records)`,
      filename: `DoMeal_Orders_${new Date().toISOString().slice(0, 10)}`,
      items: exportItems,
    });

    toast.success(`Downloaded PDF (${exportItems.length} order records)`);
  };

  const handleDownloadExcel = () => {
    const dataToExport = filtered.length > 0 ? filtered : orders;
    const exportItems = mapOrdersToDeliveryExport(dataToExport);

    exportDeliveriesToExcel({
      filename: `DoMeal_Orders_${new Date().toISOString().slice(0, 10)}`,
      sheetName: 'Orders Manifest',
      items: exportItems,
    });

    toast.success(`Downloaded Excel (.xlsx) (${exportItems.length} order records)`);
  };

  return (
    <div className="space-y-4">
      {/* Filters & Export Actions */}
      <div className="flex flex-wrap gap-3 items-center justify-between">
        <div className="flex flex-wrap gap-3 items-center">
          <div className="relative">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            />
            <input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search orders or customers..."
              className="pl-9 pr-4 py-2.5 border border-border rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary w-64"
            />
          </div>
          <div className="flex items-center gap-1.5 bg-white border border-border rounded-xl px-3 py-2 text-sm">
            <Filter size={14} className="text-muted-foreground" />
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="bg-transparent text-sm font-600 text-foreground focus:outline-none pr-1"
            >
              {statusOptions.map((s) => (
                <option key={`filter-${s}`} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Download PDF Button */}
          <button
            onClick={handleDownloadPdf}
            className="px-3 py-2 rounded-xl bg-white hover:bg-rose-50 text-rose-700 font-700 text-xs border border-rose-200 shadow-sm hover:shadow transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
            title="Download Minimal Delivery PDF"
          >
            <FileText className="w-3.5 h-3.5 text-rose-600" />
            <span>Download PDF</span>
          </button>

          {/* Download Excel Button */}
          <button
            onClick={handleDownloadExcel}
            className="px-3 py-2 rounded-xl bg-white hover:bg-emerald-50 text-emerald-700 font-700 text-xs border border-emerald-200 shadow-sm hover:shadow transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
            title="Download Minimal Delivery Excel (.xlsx)"
          >
            <Download className="w-3.5 h-3.5 text-emerald-600" />
            <span>Download Excel</span>
          </button>

          <p className="text-xs text-muted-foreground ml-2">{filtered.length} orders found</p>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted border-b border-border">
              <tr>
                {[
                  'Order ID',
                  'Customer',
                  'Items',
                  'Slot',
                  'Date',
                  'Total',
                  'Status',
                  'Actions',
                ].map((h) => (
                  <th
                    key={`orders-th-${h}`}
                    className="text-left px-4 py-3 text-xs font-700 text-muted-foreground uppercase tracking-wide whitespace-nowrap"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-muted-foreground text-sm">
                    Loading orders...
                  </td>
                </tr>
              ) : paginated.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-muted-foreground text-sm">
                    {orders.length === 0
                      ? 'No orders yet. Orders will appear here once placed.'
                      : 'No orders match your search or filter.'}
                  </td>
                </tr>
              ) : (
                paginated.map((order) => (
                  <tr key={order.id} className="hover:bg-muted/40 transition-colors">
                    <td className="px-4 py-3 font-700 text-primary text-xs whitespace-nowrap">
                      {order.id}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <p className="font-600 text-foreground">
                        {order.address?.fullName || 'Unknown'}
                      </p>
                      <p className="text-xs text-muted-foreground">{order.address?.phone || ''}</p>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground max-w-[160px] truncate">
                      {order.items?.map((i: any) => `${i.name} × ${i.qty}`).join(', ') || 'N/A'}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                      {slotNames[order.deliverySlot] || order.deliverySlot || 'N/A'}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                      {order.deliveryDates
                        ? order.deliveryDates
                            .map((d: string) =>
                              new Date(d).toLocaleDateString('en-GB', {
                                day: 'numeric',
                                month: 'short',
                              })
                            )
                            .join(', ')
                        : order.deliveryDate || formatDate(order.createdAt)}
                    </td>
                    <td className="px-4 py-3 font-700 tabular-nums whitespace-nowrap">
                      £{(order.total || 0).toFixed(2)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="relative inline-flex items-center">
                        <select
                          value={order.status || 'Order Received'}
                          onChange={(e) => updateStatus(order.id, e.target.value)}
                          className={`appearance-none text-xs font-700 pl-3 pr-7 py-1.5 rounded-full cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all border shadow-xs ${
                            statusColors[order.status] || 'bg-gray-100 text-gray-700 border-gray-200'
                          }`}
                        >
                          {statusOptions
                            .filter((s) => s !== 'All')
                            .map((s) => (
                              <option
                                key={`status-opt-${order.id}-${s}`}
                                value={s}
                                className="bg-white text-slate-800 font-600 py-1"
                              >
                                {s}
                              </option>
                            ))}
                        </select>
                        <ChevronDown
                          size={12}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none opacity-60"
                        />
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="p-1.5 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors border border-blue-200"
                      >
                        <Eye size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-border bg-muted/30">
          <p className="text-xs text-muted-foreground">
            Showing{' '}
            {filtered.length === 0 ? 0 : Math.min((page - 1) * perPage + 1, filtered.length)}–
            {Math.min(page * perPage, filtered.length)} of {filtered.length} orders
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1.5 text-xs font-600 border border-border rounded-lg bg-white hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Previous
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={`page-${p}`}
                onClick={() => setPage(p)}
                className={`w-8 h-8 text-xs font-700 rounded-lg border transition-colors ${page === p ? 'bg-primary text-white border-primary' : 'bg-white border-border hover:bg-muted'}`}
              >
                {p}
              </button>
            ))}
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-3 py-1.5 text-xs font-600 border border-border rounded-lg bg-white hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setSelectedOrder(null)}
          />
          <div className="relative bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95">
            <div className="p-5 border-b border-border bg-gray-50 flex items-center justify-between shrink-0">
              <div>
                <h2 className="font-800 text-lg text-[#1E3B2B]">
                  Order Summary: {selectedOrder.id}
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Placed on{' '}
                  {selectedOrder.createdAt?.toDate
                    ? selectedOrder.createdAt
                        .toDate()
                        .toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' })
                    : 'N/A'}
                </p>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="p-2 bg-white rounded-full text-muted-foreground hover:text-foreground shadow-sm border border-border transition-colors"
              >
                <X size={18} />
              </button>
            </div>

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
                    {selectedOrder.address?.addressLine1}
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

              {/* Payment & Subscription Details */}
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
                      {selectedOrder.paymentMethod === 'pay-cod' ? (
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

              {selectedOrder.allergiesInfo && (
                <div className="bg-red-50 p-4 rounded-xl border border-red-200 shadow-sm">
                  <h3 className="font-800 text-xs text-red-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <span className="text-base">⚠️</span> Allergy Information
                  </h3>
                  <p className="text-sm font-600 text-red-900">{selectedOrder.allergiesInfo}</p>
                </div>
              )}

              {/* Order Items */}
              <div>
                <h3 className="font-800 text-sm text-[#1E3B2B] mb-3 border-b border-border pb-2">
                  Order Items
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
                      selectedOrder.total +
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
                {selectedOrder.deliveryFee !== undefined && selectedOrder.deliveryFee > 0 && (
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Delivery Charge</span>
                    <span className="tabular-nums">
                      £{selectedOrder.deliveryFee.toFixed(2)}
                    </span>
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

              {/* Instructions */}
              {selectedOrder.notes && (
                <div className="bg-yellow-50 p-4 rounded-xl border border-yellow-200 shadow-sm">
                  <h3 className="font-800 text-xs text-yellow-800 uppercase tracking-wider mb-1">
                    Special Instructions
                  </h3>
                  <p className="text-sm text-yellow-900 italic">"{selectedOrder.notes}"</p>
                </div>
              )}
            </div>

            <div className="p-5 border-t border-border bg-gray-50 flex gap-3 shrink-0">
              <button
                onClick={() => setSelectedOrder(null)}
                className="flex-1 bg-white border border-border text-foreground font-700 py-3 rounded-xl hover:bg-muted transition-colors active:scale-95 shadow-sm"
              >
                Close Summary
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
