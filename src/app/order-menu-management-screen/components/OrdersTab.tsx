'use client';
import React, { useState, useEffect } from 'react';
import { Search, Filter, ChevronDown, Eye, X } from 'lucide-react';
import { toast } from 'sonner';
import { collection, query, orderBy, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/context/AuthContext';

const statusOptions = ['All', 'Order Received', 'Confirmed', 'Preparing', 'Out for Delivery', 'Delivered', 'Cancelled'];

const statusColors: Record<string, string> = {
  'Order Received': 'bg-blue-100 text-blue-700',
  Delivered: 'bg-green-100 text-green-700',
  'Out for Delivery': 'bg-blue-100 text-blue-700',
  Preparing: 'bg-amber-100 text-amber-700',
  Confirmed: 'bg-purple-100 text-purple-700',
  Pending: 'bg-yellow-100 text-yellow-700',
  Cancelled: 'bg-red-100 text-red-600',
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
  const [openStatusDropdown, setOpenStatusDropdown] = useState<string | null>(null);
  const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0 });
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [page, setPage] = useState(1);
  const perPage = 8;
  const { user } = useAuth();

  useEffect(() => {
    if (!user || user.email !== 'domealuk79812@gmail.com') return;

    const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, (snap) => {
      const fetched = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setOrders(fetched);
      setLoading(false);
    });
    return () => unsub();
  }, [user]);

  const updateStatus = async (orderId: string, newStatus: string) => {
    try {
      await updateDoc(doc(db, 'orders', orderId), { status: newStatus });
      setOpenStatusDropdown(null);
      toast.success(`Order ${orderId} → ${newStatus}`);
    } catch {
      toast.error('Failed to update status');
    }
  };

  const filtered = orders.filter(o => {
    const name = o.address?.fullName || '';
    const matchSearch = name.toLowerCase().includes(search.toLowerCase()) || o.id.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'All' || o.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const paginated = filtered.slice((page - 1) * perPage, page * perPage);

  const formatDate = (ts: any) => {
    if (!ts?.toDate) return 'N/A';
    return ts.toDate().toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center justify-between">
        <div className="flex flex-wrap gap-3 items-center">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search orders or customers..."
              className="pl-9 pr-4 py-2.5 border border-border rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary w-64"
            />
          </div>
          <div className="flex items-center gap-1.5 bg-white border border-border rounded-xl px-3 py-2 text-sm">
            <Filter size={14} className="text-muted-foreground" />
            <select
              value={statusFilter}
              onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
              className="bg-transparent text-sm font-600 text-foreground focus:outline-none pr-1"
            >
              {statusOptions.map(s => (
                <option key={`filter-${s}`} value={s}>{s}</option>
              ))}
            </select>
          </div>
        </div>
        <p className="text-xs text-muted-foreground">{filtered.length} orders found</p>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted border-b border-border">
              <tr>
                {['Order ID', 'Customer', 'Items', 'Slot', 'Date', 'Total', 'Status', 'Actions'].map(h => (
                  <th key={`orders-th-${h}`} className="text-left px-4 py-3 text-xs font-700 text-muted-foreground uppercase tracking-wide whitespace-nowrap">
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
                    {orders.length === 0 ? 'No orders yet. Orders will appear here once placed.' : 'No orders match your search or filter.'}
                  </td>
                </tr>
              ) : paginated.map(order => (
                <tr key={order.id} className="hover:bg-muted/40 transition-colors">
                  <td className="px-4 py-3 font-700 text-primary text-xs whitespace-nowrap">{order.id}</td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <p className="font-600 text-foreground">{order.address?.fullName || 'Unknown'}</p>
                    <p className="text-xs text-muted-foreground">{order.address?.phone || ''}</p>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground max-w-[160px] truncate">
                    {order.items?.map((i: any) => `${i.name} × ${i.qty}`).join(', ') || 'N/A'}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                    {slotNames[order.deliverySlot] || order.deliverySlot || 'N/A'}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">{order.deliveryDate || formatDate(order.createdAt)}</td>
                  <td className="px-4 py-3 font-700 tabular-nums whitespace-nowrap">£{(order.total || 0).toFixed(2)}</td>
                  <td className="px-4 py-3">
                    <button
                      onClick={(e) => {
                        const rect = e.currentTarget.getBoundingClientRect();
                        setDropdownPos({ top: rect.bottom + 4, left: rect.left });
                        setOpenStatusDropdown(openStatusDropdown === order.id ? null : order.id);
                      }}
                      className={`inline-flex items-center gap-1.5 text-xs font-700 px-2.5 py-1 rounded-full ${statusColors[order.status] || 'bg-gray-100 text-gray-700'} hover:opacity-80 transition-opacity`}
                    >
                      {order.status || 'Order Received'}
                      <ChevronDown size={10} />
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <button onClick={() => setSelectedOrder(order)} className="p-1.5 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors border border-blue-200">
                      <Eye size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-border bg-muted/30">
          <p className="text-xs text-muted-foreground">
            Showing {filtered.length === 0 ? 0 : Math.min((page - 1) * perPage + 1, filtered.length)}–{Math.min(page * perPage, filtered.length)} of {filtered.length} orders
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1.5 text-xs font-600 border border-border rounded-lg bg-white hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Previous
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
              <button
                key={`page-${p}`}
                onClick={() => setPage(p)}
                className={`w-8 h-8 text-xs font-700 rounded-lg border transition-colors ${page === p ? 'bg-primary text-white border-primary' : 'bg-white border-border hover:bg-muted'}`}
              >
                {p}
              </button>
            ))}
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-3 py-1.5 text-xs font-600 border border-border rounded-lg bg-white hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Fixed-position status dropdown */}
      {openStatusDropdown && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpenStatusDropdown(null)} />
          <div
            className="fixed z-50 bg-white border border-border rounded-2xl shadow-2xl py-2 min-w-[180px]"
            style={{ top: dropdownPos.top, left: dropdownPos.left }}
          >
            <p className="px-3 pb-2 text-[10px] font-800 text-muted-foreground uppercase tracking-wider border-b border-border mb-1">
              Update Status
            </p>
            {statusOptions.filter(s => s !== 'All').map(s => {
              const currentOrder = orders.find(o => o.id === openStatusDropdown);
              const isCurrent = currentOrder?.status === s;
              return (
                <button
                  key={`status-opt-${s}`}
                  onClick={() => updateStatus(openStatusDropdown, s)}
                  className={`w-full text-left px-3 py-2 text-xs font-600 hover:bg-muted transition-colors flex items-center gap-2 ${isCurrent ? 'text-primary bg-orange-50' : 'text-foreground'}`}
                >
                  <span className={`w-2 h-2 rounded-full flex-shrink-0 ${statusColors[s]?.split(' ')[0] || 'bg-gray-200'}`} />
                  {s}
                  {isCurrent && <span className="ml-auto text-[10px] font-700 text-primary">Current</span>}
                </button>
              );
            })}
          </div>
        </>
      )}

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSelectedOrder(null)} />
          <div className="relative bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95">
            <div className="p-5 border-b border-border bg-gray-50 flex items-center justify-between shrink-0">
              <div>
                <h2 className="font-800 text-lg text-[#142249]">Order Summary: {selectedOrder.id}</h2>
                <p className="text-xs text-muted-foreground mt-0.5">Placed on {selectedOrder.createdAt?.toDate ? selectedOrder.createdAt.toDate().toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' }) : 'N/A'}</p>
              </div>
              <button onClick={() => setSelectedOrder(null)} className="p-2 bg-white rounded-full text-muted-foreground hover:text-foreground shadow-sm border border-border transition-colors">
                <X size={18} />
              </button>
            </div>

            <div className="overflow-y-auto p-6 space-y-6 flex-1">
              {/* Customer Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100 shadow-sm">
                  <h3 className="font-800 text-xs text-blue-800 uppercase tracking-wider mb-2">Customer Info</h3>
                  <p className="font-700 text-sm text-foreground">{selectedOrder.address?.fullName || 'Unknown'}</p>
                  <p className="text-sm text-muted-foreground mt-1">{selectedOrder.address?.email}</p>
                  <p className="text-sm text-muted-foreground">{selectedOrder.address?.phone}</p>
                </div>
                <div className="bg-orange-50/50 p-4 rounded-xl border border-orange-100 shadow-sm">
                  <h3 className="font-800 text-xs text-orange-800 uppercase tracking-wider mb-2">Delivery Address</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {selectedOrder.address?.streetAddress}<br/>
                    {selectedOrder.address?.city}, {selectedOrder.address?.postcode}
                  </p>
                  {selectedOrder.deliverySlot && (
                    <p className="text-xs font-700 text-orange-800 mt-2 bg-orange-100 inline-block px-2 py-0.5 rounded">Slot: {slotNames[selectedOrder.deliverySlot] || selectedOrder.deliverySlot}</p>
                  )}
                </div>
              </div>

              {/* Order Items */}
              <div>
                <h3 className="font-800 text-sm text-[#142249] mb-3 border-b border-border pb-2">Order Items</h3>
                <div className="space-y-3">
                  {selectedOrder.items?.map((item: any, idx: number) => {
                    const extraPriceTotal = item.subItems?.reduce((sum: number, sub: any) => sum + (sub.price || 0), 0) || 0;
                    const basePrice = item.price - extraPriceTotal;
                    
                    return (
                      <div key={idx} className="bg-muted/20 p-4 rounded-xl border border-border shadow-sm">
                        <div className="flex justify-between items-start mb-2">
                          <span className="font-700 text-foreground"><span className="text-primary mr-1">{item.qty}x</span> {item.name}</span>
                          <span className="font-800 tabular-nums">£{(basePrice * item.qty).toFixed(2)}</span>
                        </div>
                        {item.subItems && item.subItems.length > 0 && (
                          <div className="pl-6 space-y-1.5 mt-2">
                            <p className="text-[10px] font-800 text-muted-foreground uppercase tracking-widest mb-1 border-b border-border/50 pb-1 inline-block">Package Contents</p>
                            {item.subItems.map((sub: any, sIdx: number) => (
                              <div key={sIdx} className="flex justify-between text-xs text-muted-foreground">
                                <span className="flex items-center gap-2">
                                  <div className="w-1.5 h-1.5 rounded-full bg-primary/40" /> 
                                  {sub.name}
                                </span>
                                {sub.price > 0 && <span className="font-600">+£{(sub.price * item.qty).toFixed(2)}</span>}
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
              <div className="bg-gray-50 p-5 rounded-xl border border-border shadow-sm">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-muted-foreground font-500">Subtotal</span>
                  <span className="font-600 tabular-nums">£{((selectedOrder.total || 0) - (selectedOrder.deliveryFee || 0)).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm mb-3">
                  <span className="text-muted-foreground font-500">Delivery Fee</span>
                  <span className="font-600 tabular-nums">£{(selectedOrder.deliveryFee || 0).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-base font-800 border-t border-border/50 pt-3">
                  <span className="text-[#142249]">Total Amount Paid</span>
                  <span className="text-primary tabular-nums text-lg">£{(selectedOrder.total || 0).toFixed(2)}</span>
                </div>
              </div>
              
              {/* Instructions */}
              {selectedOrder.notes && (
                <div className="bg-yellow-50 p-4 rounded-xl border border-yellow-200 shadow-sm">
                  <h3 className="font-800 text-xs text-yellow-800 uppercase tracking-wider mb-1">Special Instructions</h3>
                  <p className="text-sm text-yellow-900 italic">"{selectedOrder.notes}"</p>
                </div>
              )}
            </div>
            
            <div className="p-5 border-t border-border bg-gray-50 flex gap-3 shrink-0">
              <button onClick={() => setSelectedOrder(null)} className="flex-1 bg-white border border-border text-foreground font-700 py-3 rounded-xl hover:bg-muted transition-colors active:scale-95 shadow-sm">
                Close Summary
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}