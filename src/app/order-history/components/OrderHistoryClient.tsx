'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Package, Clock, CheckCircle, Truck, XCircle, ChevronDown, ChevronUp, RotateCcw, Search, Filter, Bell, ShoppingCart, User, Wallet } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';

const statusConfig: Record<string, { icon: React.ElementType; color: string; bg: string; label: string }> = {
  'Order Received': { icon: Package, color: 'text-blue-700', bg: 'bg-blue-100', label: 'Order Received' },
  Delivered: { icon: CheckCircle, color: 'text-green-700', bg: 'bg-green-100', label: 'Delivered' },
  'Out for Delivery': { icon: Truck, color: 'text-blue-700', bg: 'bg-blue-100', label: 'Out for Delivery' },
  Preparing: { icon: Clock, color: 'text-amber-700', bg: 'bg-amber-100', label: 'Preparing' },
  Confirmed: { icon: Package, color: 'text-purple-700', bg: 'bg-purple-100', label: 'Confirmed' },
  Cancelled: { icon: XCircle, color: 'text-red-600', bg: 'bg-red-100', label: 'Cancelled' },
};

const filterOptions = ['All', 'Order Received', 'Confirmed', 'Preparing', 'Out for Delivery', 'Delivered', 'Cancelled'];

export default function OrderHistoryClient() {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      setOrders([]);
      setLoading(false);
      return;
    }

    const q = query(collection(db, 'orders'), where('userId', '==', user.uid));
    const unsub = onSnapshot(q, (snap) => {
      const fetched = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      fetched.sort((a: any, b: any) => (b.createdAt?.toMillis?.() || 0) - (a.createdAt?.toMillis?.() || 0));
      setOrders(fetched);
      setLoading(false);
    });

    return () => unsub();
  }, [user]);

  const filtered = orders.filter(o => {
    const matchSearch = o.id.toLowerCase().includes(search.toLowerCase()) ||
      o.items?.some((i: any) => i.name.toLowerCase().includes(search.toLowerCase()));
    const matchStatus = statusFilter === 'All' || (o.status || 'Order Received') === statusFilter;
    return matchSearch && matchStatus;
  });

  const totalSpent = orders
    .filter(o => o.status === 'Delivered')
    .reduce((sum, o) => sum + (o.total || 0), 0);

  const deliveredCount = orders.filter(o => o.status === 'Delivered').length;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="bg-white rounded-2xl border border-border p-16 text-center shadow-sm">
        <User size={48} className="text-muted-foreground mx-auto mb-4 opacity-40" />
        <h2 className="font-800 text-xl text-foreground mb-2">Please sign in</h2>
        <p className="text-muted-foreground mb-6 max-w-md mx-auto">You need to be logged in to view your order history.</p>
        <Link href="/sign-up-login-screen" className="inline-flex bg-primary text-white font-700 px-6 py-3 rounded-xl hover:bg-red-900 transition-all active:scale-95">
          Sign In
        </Link>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-extrabold text-foreground mb-1">Order History</h1>
        <p className="text-sm text-muted-foreground">Track all past and current DoMeal orders</p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-2xl border border-border p-5 shadow-sm">
          <p className="text-xs text-muted-foreground font-600 uppercase tracking-wide mb-1">Total Orders</p>
          <p className="text-3xl font-extrabold text-foreground tabular-nums">{orders.length}</p>
        </div>
        <div className="bg-white rounded-2xl border border-border p-5 shadow-sm">
          <p className="text-xs text-muted-foreground font-600 uppercase tracking-wide mb-1">Delivered</p>
          <p className="text-3xl font-extrabold text-green-600 tabular-nums">{deliveredCount}</p>
        </div>
        <div className="bg-white rounded-2xl border border-border p-5 shadow-sm">
          <p className="text-xs text-muted-foreground font-600 uppercase tracking-wide mb-1">Total Spent</p>
          <p className="text-3xl font-extrabold text-primary tabular-nums">£{totalSpent.toFixed(2)}</p>
        </div>
        <div className="bg-red-50 rounded-2xl border border-red-200 p-5 shadow-sm">
          <p className="text-xs text-primary font-600 uppercase tracking-wide mb-1">Notifications</p>
          <div className="flex items-center gap-2">
            <Bell size={18} className="text-primary" />
            <p className="text-sm font-700 text-foreground">Email & SMS On</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center mb-6">
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search orders or items..."
            className="w-full pl-9 pr-4 py-2.5 border border-border rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary shadow-sm"
          />
        </div>
        <div className="flex items-center gap-1.5 bg-white border border-border shadow-sm rounded-xl px-3 py-2.5 text-sm">
          <Filter size={14} className="text-muted-foreground" />
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="bg-transparent text-sm font-600 text-foreground focus:outline-none pr-1"
          >
            {filterOptions.map(s => (
              <option key={`filter-${s}`} value={s}>{s}</option>
            ))}
          </select>
        </div>
        <p className="text-xs text-muted-foreground ml-auto">{filtered.length} orders</p>
      </div>

      {/* Orders list */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-border p-16 text-center shadow-sm">
          <Package size={48} className="text-muted-foreground mx-auto mb-4 opacity-40" />
          <p className="font-700 text-foreground mb-1">No orders found</p>
          <p className="text-sm text-muted-foreground mb-6">Try adjusting your search or filter</p>
          <Link href="/menu" className="inline-flex items-center gap-2 bg-primary text-white font-700 px-5 py-3 rounded-xl hover:bg-red-900 transition-all active:scale-95 text-sm">
            Browse Menu
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map(order => {
            const currentStatus = order.status || 'Order Received';
            const cfg = statusConfig[currentStatus] || statusConfig['Order Received'];
            const StatusIcon = cfg.icon;
            const isExpanded = expandedId === order.id;

            return (
              <div
                key={order.id}
                className={`bg-white rounded-2xl border-2 transition-all duration-200 overflow-hidden ${
                  isExpanded ? 'border-primary shadow-md shadow-red-50' : 'border-border hover:border-primary/30 shadow-sm'
                }`}
              >
                {/* Order header row */}
                <button
                  onClick={() => setExpandedId(isExpanded ? null : order.id)}
                  className="w-full flex flex-col sm:flex-row items-start sm:items-center gap-4 p-5 text-left"
                >
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${cfg.bg}`}>
                    <StatusIcon size={20} className={cfg.color} />
                  </div>

                  <div className="flex-1 min-w-0 w-full">
                    <div className="flex justify-between sm:justify-start items-center gap-2 mb-1 w-full">
                      <span className="font-800 text-base text-primary">{order.id}</span>
                      <span className={`text-xs font-700 px-2.5 py-1 rounded-md ${cfg.bg} ${cfg.color}`}>
                        {cfg.label}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground font-500">
                      Placed: {order.createdAt?.toDate ? order.createdAt.toDate().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Recent'} · {order.items?.length || 0} item{(order.items?.length || 0) !== 1 ? 's' : ''}
                    </p>
                  </div>

                  <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto mt-2 sm:mt-0 pt-2 sm:pt-0 border-t sm:border-0 border-border/50 shrink-0">
                    <p className="font-800 text-lg text-foreground tabular-nums">£{(order.total || 0).toFixed(2)}</p>
                    <p className="text-xs text-muted-foreground font-600 mt-1 flex items-center gap-1">
                      {isExpanded ? 'Hide Details' : 'View Details'} 
                      {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    </p>
                  </div>
                </button>

                {/* Expanded details */}
                {isExpanded && (
                  <div className="border-t border-border px-5 pb-5 pt-4 bg-muted/10">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                      <div>
                        <p className="text-[10px] font-800 text-muted-foreground uppercase tracking-wider mb-3">Items Ordered</p>
                        <div className="space-y-3 bg-white border border-border p-4 rounded-xl shadow-sm">
                          {order.items?.map((item: any, idx: number) => {
                            const extraPriceTotal = item.subItems?.reduce((sum: number, sub: any) => sum + (sub.price || 0), 0) || 0;
                            const basePrice = item.price - extraPriceTotal;
                            
                            return (
                              <div key={`${order.id}-item-${idx}`} className="flex flex-col gap-1 border-b border-border/50 pb-2 last:border-0">
                                <div className="flex justify-between text-sm">
                                  <span className="text-foreground font-500"><span className="font-700">{item.qty}x</span> {item.name}</span>
                                  <span className="font-700 tabular-nums text-foreground">£{(basePrice * item.qty).toFixed(2)}</span>
                                </div>
                                {item.subItems && item.subItems.length > 0 && (
                                  <div className="pl-6 space-y-0.5">
                                    {item.subItems.map((sub: any, sIdx: number) => (
                                      <div key={sIdx} className="flex justify-between text-[11px] text-muted-foreground">
                                        <span className="flex items-center gap-1.5">
                                          <div className="w-1 h-1 rounded-full bg-primary/40" />
                                          {sub.name}
                                        </span>
                                        {sub.price > 0 && <span>+£{(sub.price * item.qty).toFixed(2)}</span>}
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                          <div className="border-t border-border pt-3 mt-3">
                            {order.walletApplied > 0 && (
                              <div className="flex justify-between font-700 text-sm mb-1.5 text-green-700">
                                <span className="flex items-center gap-1.5"><Wallet size={16} /> Wallet Applied</span>
                                <span className="tabular-nums">-£{(order.walletApplied).toFixed(2)}</span>
                              </div>
                            )}
                            <div className="flex justify-between font-800 text-sm">
                              <span>Total Paid</span>
                              <span className="text-primary tabular-nums">£{(order.total || 0).toFixed(2)}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div>
                        <p className="text-[10px] font-800 text-muted-foreground uppercase tracking-wider mb-3">Delivery Information</p>
                        <div className="space-y-3 bg-white border border-border p-4 rounded-xl shadow-sm text-sm">
                          <div className="flex items-start gap-3">
                            <Clock size={16} className="text-primary shrink-0 mt-0.5" />
                            <div>
                              <p className="font-700 text-foreground">Requested Delivery</p>
                              <p className="text-muted-foreground mt-0.5 text-xs">{order.deliverySlot || 'Standard Delivery'}</p>
                            </div>
                          </div>
                          
                          <div className="flex items-start gap-3">
                            <Package size={16} className="text-primary shrink-0 mt-0.5" />
                            <div>
                              <p className="font-700 text-foreground">Delivery Address</p>
                              <p className="text-muted-foreground mt-0.5 text-xs leading-relaxed max-w-[200px]">
                                {order.address?.fullName}<br/>
                                {order.address?.streetAddress}<br/>
                                {order.address?.city}, {order.address?.postcode}
                              </p>
                            </div>
                          </div>
                          
                          {order.notes && (
                             <div className="flex items-start gap-3">
                               <Bell size={16} className="text-primary shrink-0 mt-0.5" />
                               <div>
                                 <p className="font-700 text-foreground">Special Instructions</p>
                                 <p className="text-muted-foreground mt-0.5 text-xs italic">"{order.notes}"</p>
                               </div>
                             </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-3 mt-6 pt-5 border-t border-border">
                      {order.status === 'Delivered' && (
                        <Link
                          href="/menu"
                          className="flex items-center gap-2 bg-primary text-white text-sm font-700 px-5 py-2.5 rounded-xl hover:bg-red-900 transition-all active:scale-95 shadow-sm shadow-red-200"
                        >
                          <RotateCcw size={14} />
                          Order Again
                        </Link>
                      )}
                      <Link
                        href="/menu"
                        className="flex items-center gap-2 bg-white border border-border text-foreground text-sm font-600 px-5 py-2.5 rounded-xl hover:border-primary/50 hover:bg-muted/50 transition-all shadow-sm"
                      >
                        <ShoppingCart size={14} />
                        Order Something New
                      </Link>
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
