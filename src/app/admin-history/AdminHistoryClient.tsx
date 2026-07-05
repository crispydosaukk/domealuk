'use client';
import React, { useState, useEffect } from 'react';
import { Search, Filter, CheckCircle, Package } from 'lucide-react';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/context/AuthContext';

export default function AdminHistoryClient() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    if (!user || user.email !== 'domealuk79812@gmail.com') return;

    // Only fetch Completed/Delivered orders for history
    const q = query(collection(db, 'orders'), where('status', '==', 'Delivered'));
    const unsub = onSnapshot(q, (snap) => {
      const fetched = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      fetched.sort(
        (a: any, b: any) => (b.createdAt?.toMillis?.() || 0) - (a.createdAt?.toMillis?.() || 0)
      );
      setOrders(fetched);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const filtered = orders.filter((o) => {
    const name = o.address?.fullName || '';
    return (
      name.toLowerCase().includes(search.toLowerCase()) ||
      o.id.toLowerCase().includes(search.toLowerCase())
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-foreground">Completed Order History</h1>
          <p className="text-sm text-muted-foreground">View all past delivered orders</p>
        </div>
        <div className="bg-green-50 text-green-700 px-4 py-2 rounded-xl flex items-center gap-2 border border-green-200">
          <CheckCircle size={18} />
          <span className="font-700">{orders.length} Completed</span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <Search
            size={16}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by Order ID or Customer Name..."
            className="w-full pl-10 pr-4 py-2.5 border border-border rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted border-b border-border">
              <tr>
                <th className="text-left px-5 py-3 text-xs font-700 text-muted-foreground uppercase">
                  Order ID
                </th>
                <th className="text-left px-5 py-3 text-xs font-700 text-muted-foreground uppercase">
                  Customer
                </th>
                <th className="text-left px-5 py-3 text-xs font-700 text-muted-foreground uppercase">
                  Items
                </th>
                <th className="text-left px-5 py-3 text-xs font-700 text-muted-foreground uppercase">
                  Date Delivered
                </th>
                <th className="text-left px-5 py-3 text-xs font-700 text-muted-foreground uppercase">
                  Total
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-5 py-12 text-center text-muted-foreground">
                    Loading history...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-12 text-center text-muted-foreground">
                    No completed orders found.
                  </td>
                </tr>
              ) : (
                filtered.map((order) => (
                  <tr key={order.id} className="hover:bg-muted/40 transition-colors">
                    <td className="px-5 py-4 font-700 text-primary text-xs">{order.id}</td>
                    <td className="px-5 py-4">
                      <p className="font-600 text-foreground">
                        {order.address?.fullName || 'Unknown'}
                      </p>
                      <p className="text-xs text-muted-foreground">{order.address?.phone}</p>
                    </td>
                    <td className="px-5 py-4 text-muted-foreground text-xs max-w-[200px] truncate">
                      {order.items?.map((i: any) => `${i.qty}x ${i.name}`).join(', ')}
                    </td>
                    <td className="px-5 py-4 text-muted-foreground whitespace-nowrap text-xs">
                      {order.createdAt?.toDate
                        ? order.createdAt.toDate().toLocaleDateString('en-GB')
                        : 'Unknown'}
                    </td>
                    <td className="px-5 py-4 font-700 tabular-nums text-foreground">
                      £{(order.total || 0).toFixed(2)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
