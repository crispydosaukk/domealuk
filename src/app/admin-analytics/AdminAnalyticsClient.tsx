'use client';
import React, { useEffect, useState } from 'react';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import dynamic from 'next/dynamic';
import { TrendingUp, PoundSterling, ShoppingBag, Users, CheckCircle, XCircle, Clock } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

const RevenueChart = dynamic(() => import('@/app/admin-dashboard/components/RevenueChart'), { ssr: false });
const OrderVolumeChart = dynamic(() => import('@/app/admin-dashboard/components/OrderVolumeChart'), { ssr: false });

export default function AdminAnalyticsClient() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (!user || user.email !== 'domealuk79812@gmail.com') return;

    const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, (snap) => {
      setOrders(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });
    return () => unsub();
  }, [user]);

  const totalRevenue = orders.filter(o => o.status === 'Delivered').reduce((s, o) => s + (o.total || 0), 0);
  const totalOrders = orders.length;
  const delivered = orders.filter(o => o.status === 'Delivered').length;
  const cancelled = orders.filter(o => o.status === 'Cancelled').length;
  const pending = orders.filter(o => !['Delivered', 'Cancelled'].includes(o.status || '')).length;
  const uniqueCustomers = new Set(orders.map(o => o.userId)).size;
  const avgOrderValue = delivered > 0 ? (totalRevenue / delivered) : 0;
  const deliveryRate = totalOrders > 0 ? ((delivered / totalOrders) * 100).toFixed(1) : '0';

  // Top items analysis
  const itemMap: Record<string, { count: number; revenue: number }> = {};
  orders.forEach(o => {
    o.items?.forEach((item: any) => {
      if (!itemMap[item.name]) itemMap[item.name] = { count: 0, revenue: 0 };
      itemMap[item.name].count += item.qty || 1;
      itemMap[item.name].revenue += (item.price || 0) * (item.qty || 1);
    });
  });
  const topItems = Object.entries(itemMap)
    .sort(([, a], [, b]) => b.count - a.count)
    .slice(0, 8);

  // Orders per day of week
  const dayMap: Record<string, number> = { Mon: 0, Tue: 0, Wed: 0, Thu: 0, Fri: 0, Sat: 0, Sun: 0 };
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  orders.forEach(o => {
    if (o.createdAt?.toDate) {
      const d = dayNames[o.createdAt.toDate().getDay()];
      dayMap[d] = (dayMap[d] || 0) + 1;
    }
  });

  const statCards = [
    { label: 'Total Revenue', value: `£${totalRevenue.toFixed(2)}`, icon: PoundSterling, color: 'text-amber-600 bg-amber-50 border-amber-200', sub: 'From delivered orders' },
    { label: 'Total Orders', value: totalOrders, icon: ShoppingBag, color: 'text-blue-600 bg-blue-50 border-blue-200', sub: 'All time' },
    { label: 'Avg Order Value', value: `£${avgOrderValue.toFixed(2)}`, icon: TrendingUp, color: 'text-primary bg-red-50 border-red-200', sub: 'Per delivered order' },
    { label: 'Delivery Rate', value: `${deliveryRate}%`, icon: CheckCircle, color: 'text-green-600 bg-green-50 border-green-200', sub: 'Orders completed' },
    { label: 'Customers', value: uniqueCustomers, icon: Users, color: 'text-purple-600 bg-purple-50 border-purple-200', sub: 'Unique users' },
    { label: 'Pending', value: pending, icon: Clock, color: 'text-amber-600 bg-amber-50 border-amber-200', sub: 'Awaiting delivery' },
    { label: 'Delivered', value: delivered, icon: CheckCircle, color: 'text-green-600 bg-green-50 border-green-200', sub: 'Successfully completed' },
    { label: 'Cancelled', value: cancelled, icon: XCircle, color: 'text-red-600 bg-red-50 border-red-200', sub: 'Total cancellations' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-foreground">Analytics</h1>
        <p className="text-sm text-muted-foreground">Live performance data — All time</p>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((c, i) => (
          <div key={i} className={`bg-white rounded-2xl border p-5 ${c.color.split(' ')[2]}`}>
            <div className="flex items-start justify-between mb-3">
              <p className="text-xs font-700 uppercase tracking-wider text-muted-foreground">{c.label}</p>
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${c.color.split(' ')[1]}`}>
                <c.icon size={18} className={c.color.split(' ')[0]} />
              </div>
            </div>
            <p className={`text-3xl font-900 tabular-nums ${c.color.split(' ')[0]}`}>{c.value}</p>
            <p className="text-xs text-muted-foreground mt-1">{c.sub}</p>
          </div>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-border p-5">
          <p className="font-700 text-foreground mb-4">Revenue — Last 7 Days</p>
          <RevenueChart orders={orders} />
        </div>
        <div className="bg-white rounded-2xl border border-border p-5">
          <p className="font-700 text-foreground mb-4">Order Volume — Last 7 Days</p>
          <OrderVolumeChart orders={orders} />
        </div>
      </div>

      {/* Top selling items + Day breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Items */}
        <div className="bg-white rounded-2xl border border-border p-5">
          <p className="font-700 text-foreground mb-4">Top Selling Items</p>
          {loading ? (
            <p className="text-muted-foreground text-sm">Loading...</p>
          ) : topItems.length === 0 ? (
            <p className="text-muted-foreground text-sm">No data yet.</p>
          ) : (
            <div className="space-y-3">
              {topItems.map(([name, data], idx) => (
                <div key={name} className="flex items-center gap-3">
                  <span className="text-xs font-800 text-muted-foreground w-5 shrink-0">#{idx + 1}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm font-600 text-foreground truncate">{name}</p>
                      <p className="text-xs font-700 tabular-nums text-muted-foreground ml-2 shrink-0">{data.count} sold</p>
                    </div>
                    <div className="w-full bg-muted rounded-full h-1.5">
                      <div
                        className="bg-primary h-1.5 rounded-full"
                        style={{ width: `${Math.min(100, (data.count / (topItems[0][1].count || 1)) * 100)}%` }}
                      />
                    </div>
                  </div>
                  <p className="text-xs font-700 text-amber-600 shrink-0">£{data.revenue.toFixed(2)}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Orders by Day */}
        <div className="bg-white rounded-2xl border border-border p-5">
          <p className="font-700 text-foreground mb-4">Orders by Day of Week</p>
          <div className="space-y-3">
            {Object.entries(dayMap).map(([day, count]) => (
              <div key={day} className="flex items-center gap-3">
                <span className="text-xs font-700 text-muted-foreground w-7">{day}</span>
                <div className="flex-1 bg-muted rounded-full h-2.5">
                  <div
                    className="bg-blue-500 h-2.5 rounded-full transition-all"
                    style={{ width: count > 0 ? `${Math.min(100, (count / (Math.max(...Object.values(dayMap)) || 1)) * 100)}%` : '0%' }}
                  />
                </div>
                <span className="text-xs font-700 tabular-nums text-foreground w-6 text-right">{count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
