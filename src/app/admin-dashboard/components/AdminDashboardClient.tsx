'use client';
import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { Package, PoundSterling, Users, Truck, TrendingUp, TrendingDown, AlertTriangle, Eye, X } from 'lucide-react';
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/context/AuthContext';

const OrderVolumeChart = dynamic(() => import('./OrderVolumeChart'), { ssr: false });
const RevenueChart = dynamic(() => import('./RevenueChart'), { ssr: false });

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
  'slot-3': 'Evening'
};

export default function AdminDashboardClient() {
  const [liveOrders, setLiveOrders] = useState<any[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (!user || user.email !== 'domealuk79812@gmail.com') return;

    const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'), limit(100));
    const unsub = onSnapshot(q, (snap) => {
      const fetched = snap.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setLiveOrders(fetched);
    });
    return () => unsub();
  }, []);

  const todayStart = new Date();
  todayStart.setHours(0,0,0,0);

  const ordersToday = liveOrders.filter(o => o.createdAt && o.createdAt.toDate() >= todayStart);
  const revenueToday = ordersToday.reduce((sum, o) => sum + (o.total || 0), 0);
  const pendingOrders = liveOrders.filter(o => ['Order Received', 'Preparing', 'Pending'].includes(o.status || 'Order Received'));
  const uniqueCustomers = new Set(liveOrders.map(o => o.userId)).size;

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
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-foreground">Dashboard</h1>
          <p className="text-sm text-muted-foreground">Overview for today — DoMeal · domeal.co.uk</p>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground bg-white border border-border rounded-lg px-3 py-2">
          <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          Live data
        </div>
      </div>

      {/* KPI Bento Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-5 gap-4">
        {kpiCards.map(card => (
          <div
            key={card.id}
            className={`bg-white rounded-2xl border-2 ${card.borderColor} p-5 hover:shadow-md transition-all duration-200 ${card.trend === 'alert' ? 'ring-1 ring-red-300' : ''}`}
          >
            <div className="flex items-start justify-between mb-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${card.color}`}>
                <card.icon size={20} />
              </div>
              {card.trend === 'up' && <TrendingUp size={14} className="text-green-600" />}
              {card.trend === 'alert' && <AlertTriangle size={14} className="text-red-500" />}
              {card.trend === 'warn' && <TrendingDown size={14} className="text-yellow-600" />}
            </div>
            <p className="text-xs font-600 text-muted-foreground uppercase tracking-wide mb-1">{card.label}</p>
            <p className="text-2xl font-extrabold text-foreground tabular-nums mb-1">{card.value}</p>
            <p className={`text-xs font-500 ${card.trend === 'alert' ? 'text-red-500' : card.trend === 'warn' ? 'text-yellow-600' : 'text-green-600'}`}>
              {card.change}
            </p>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-border p-6">
          <h2 className="font-700 text-base text-foreground mb-1">Weekly Order Volume</h2>
          <p className="text-xs text-muted-foreground mb-4">Orders per day — last 7 days</p>
          <OrderVolumeChart orders={liveOrders} />
        </div>
        <div className="bg-white rounded-2xl border border-border p-6">
          <h2 className="font-700 text-base text-foreground mb-1">Revenue Trend</h2>
          <p className="text-xs text-muted-foreground mb-4">Daily revenue (£) — last 7 days</p>
          <RevenueChart orders={liveOrders} />
        </div>
      </div>

      {/* Today's Orders */}
      <div className="bg-white rounded-2xl border border-border overflow-hidden">
        <div className="flex items-center justify-between p-5 border-b border-border">
          <div>
            <h2 className="font-700 text-base text-foreground">Recent Orders</h2>
            <p className="text-xs text-muted-foreground mt-0.5">{liveOrders.length} recent orders found</p>
          </div>
          <a href="/order-menu-management-screen" className="text-xs font-600 text-primary hover:underline">View All →</a>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted">
              <tr>
                {['Order ID', 'Customer', 'Items', 'Slot', 'Total', 'Status', 'Time', 'Actions'].map(h => (
                  <th key={`th-${h}`} className="text-left px-4 py-3 text-xs font-700 text-muted-foreground uppercase tracking-wide whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {liveOrders.slice(0, 15).map(order => (
                <tr key={order.id} className="hover:bg-muted/50 transition-colors">
                  <td className="px-4 py-3 font-700 text-primary text-xs">{order.id}</td>
                  <td className="px-4 py-3 font-600 text-foreground whitespace-nowrap">{order.address?.fullName || 'Unknown'}</td>
                  <td className="px-4 py-3 text-muted-foreground max-w-[180px] truncate">{order.items?.map((i: any) => `${i.name} × ${i.qty}`).join(', ') || 'No items'}</td>
                  <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">{slotNames[order.deliverySlot] || order.deliverySlot || 'N/A'}</td>
                  <td className="px-4 py-3 font-700 tabular-nums whitespace-nowrap">£{(order.total || 0).toFixed(2)}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center text-xs font-700 px-2.5 py-1 rounded-full ${statusColors[order.status] || 'bg-gray-100 text-gray-700'}`}>
                      {order.status || 'Received'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground text-xs tabular-nums whitespace-nowrap">
                    {order.createdAt?.toDate ? order.createdAt.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'N/A'}
                  </td>
                  <td className="px-4 py-3">
                    <button onClick={() => setSelectedOrder(order)} className="p-1.5 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors border border-blue-200">
                      <Eye size={16} />
                    </button>
                  </td>
                </tr>
              ))}
              {liveOrders.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-muted-foreground">No recent orders found. Place a new order to see it here!</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

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