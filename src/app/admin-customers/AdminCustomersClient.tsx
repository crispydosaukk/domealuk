'use client';
import React, { useState, useEffect } from 'react';
import { Search, Users, Mail, Phone, MapPin, ShoppingBag, Calendar, ChevronDown, ChevronUp } from 'lucide-react';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/context/AuthContext';

export default function AdminCustomersClient() {
  const [users, setUsers] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (!user || user.email !== 'domealuk79812@gmail.com') return;

    const unsub1 = onSnapshot(collection(db, 'users'), (snap) => {
      setUsers(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
    const unsub2 = onSnapshot(q, (snap) => {
      setOrders(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });
    return () => { unsub1(); unsub2(); };
  }, [user]);

  // Enrich user data by cross-referencing orders for missing details
  const ADMIN_EMAIL = 'domealuk79812@gmail.com';

  const enriched = users.filter(u => u.email !== ADMIN_EMAIL).map(u => {
    const userOrders = orders.filter(o => o.userId === u.id);
    const totalSpent = userOrders.reduce((s, o) => s + (o.total || 0), 0);
    const latestOrder = userOrders[0];

    // Fallback: get name & phone from their order address if missing from user profile
    const resolvedName = u.name || latestOrder?.address?.fullName || 'Unknown';
    const resolvedPhone = u.phone || latestOrder?.address?.phone || '—';
    const resolvedAddress = latestOrder?.address || null;

    return {
      ...u,
      resolvedName,
      resolvedPhone,
      resolvedAddress,
      orderCount: userOrders.length,
      totalSpent,
      latestOrder,
      orders: userOrders
    };
  });

  const filtered = enriched.filter(u => {
    const s = search.toLowerCase();
    return u.resolvedName.toLowerCase().includes(s)
      || (u.email || '').toLowerCase().includes(s)
      || u.resolvedPhone.toLowerCase().includes(s);
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-foreground">Customers</h1>
          <p className="text-sm text-muted-foreground">All registered users from the website</p>
        </div>
        <div className="bg-blue-50 text-blue-700 px-4 py-2 rounded-xl flex items-center gap-2 border border-blue-200">
          <Users size={18} />
          <span className="font-700">{users.length} Registered</span>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by name, email or phone..."
          className="w-full pl-10 pr-4 py-2.5 border border-border rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-primary/30 text-sm"
        />
      </div>

      {/* Customer Cards */}
      {loading ? (
        <div className="bg-white rounded-2xl border border-border p-12 text-center text-muted-foreground">Loading customers...</div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-border p-12 text-center text-muted-foreground">No customers found.</div>
      ) : (
        <div className="space-y-3">
          {filtered.map(u => {
            const isExpanded = expandedId === u.id;
            return (
              <div key={u.id} className={`bg-white rounded-2xl border-2 transition-all duration-200 overflow-hidden ${isExpanded ? 'border-primary shadow-md shadow-red-50' : 'border-border hover:border-primary/30'}`}>
                {/* Customer Row */}
                <button
                  onClick={() => setExpandedId(isExpanded ? null : u.id)}
                  className="w-full flex items-center gap-4 p-5 text-left"
                >
                  {/* Avatar */}
                  <div className="w-11 h-11 rounded-full bg-primary flex items-center justify-center text-white font-800 text-base shrink-0">
                    {u.resolvedName[0].toUpperCase()}
                  </div>

                  {/* Name & Email */}
                  <div className="flex-1 min-w-0">
                    <p className="font-700 text-foreground text-base">{u.resolvedName}</p>
                    <p className="text-xs text-muted-foreground truncate">{u.email}</p>
                  </div>

                  {/* Phone */}
                  <div className="hidden sm:block text-sm text-muted-foreground min-w-[120px]">
                    <p className="text-[10px] font-700 uppercase text-muted-foreground/60 mb-0.5">Phone</p>
                    <p className="font-600">{u.resolvedPhone}</p>
                  </div>

                  {/* Orders */}
                  <div className="hidden md:block text-center min-w-[60px]">
                    <p className="text-[10px] font-700 uppercase text-muted-foreground/60 mb-0.5">Orders</p>
                    <span className="bg-blue-100 text-blue-700 font-700 text-sm px-2.5 py-0.5 rounded-md">{u.orderCount}</span>
                  </div>

                  {/* Spent */}
                  <div className="text-right min-w-[70px]">
                    <p className="text-[10px] font-700 uppercase text-muted-foreground/60 mb-0.5">Spent</p>
                    <p className="font-800 text-foreground tabular-nums">£{u.totalSpent.toFixed(2)}</p>
                  </div>

                  {isExpanded ? <ChevronUp size={16} className="text-muted-foreground shrink-0" /> : <ChevronDown size={16} className="text-muted-foreground shrink-0" />}
                </button>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="border-t border-border px-5 pb-5 pt-4 bg-muted/10">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                      {/* Contact Info */}
                      <div>
                        <p className="text-[10px] font-800 uppercase tracking-wider text-muted-foreground mb-3">Contact Information</p>
                        <div className="space-y-3 bg-white border border-border p-4 rounded-xl shadow-sm text-sm">
                          <div className="flex items-center gap-2.5">
                            <Mail size={15} className="shrink-0 text-primary" />
                            <span className="text-foreground break-all">{u.email || '—'}</span>
                          </div>
                          <div className="flex items-center gap-2.5">
                            <Phone size={15} className="shrink-0 text-primary" />
                            <span className="text-foreground">{u.resolvedPhone}</span>
                          </div>
                          <div className="flex items-center gap-2.5">
                            <Calendar size={15} className="shrink-0 text-primary" />
                            <span className="text-muted-foreground text-xs">Joined: {u.createdAt?.toDate ? u.createdAt.toDate().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Unknown'}</span>
                          </div>
                        </div>
                      </div>

                      {/* Address */}
                      <div>
                        <p className="text-[10px] font-800 uppercase tracking-wider text-muted-foreground mb-3">Delivery Address</p>
                        <div className="bg-white border border-border p-4 rounded-xl shadow-sm text-sm">
                          {u.resolvedAddress ? (
                            <div className="flex items-start gap-2.5">
                              <MapPin size={15} className="shrink-0 text-primary mt-0.5" />
                              <div className="text-foreground text-xs leading-relaxed">
                                <p className="font-600">{u.resolvedAddress.fullName}</p>
                                {u.resolvedAddress.streetAddress && <p>{u.resolvedAddress.streetAddress}</p>}
                                {(u.resolvedAddress.city || u.resolvedAddress.postcode) && (
                                  <p>{[u.resolvedAddress.city, u.resolvedAddress.postcode].filter(Boolean).join(', ')}</p>
                                )}
                                {u.resolvedAddress.phone && <p className="mt-1 text-muted-foreground">📱 {u.resolvedAddress.phone}</p>}
                              </div>
                            </div>
                          ) : (
                            <p className="text-muted-foreground text-xs">No address on file — customer has not placed any orders yet.</p>
                          )}
                        </div>
                      </div>

                      {/* Stats */}
                      <div>
                        <p className="text-[10px] font-800 uppercase tracking-wider text-muted-foreground mb-3">Order Stats</p>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="bg-white border border-border rounded-xl p-3 text-center shadow-sm">
                            <p className="text-xs text-muted-foreground mb-1">Total Orders</p>
                            <p className="text-2xl font-900 text-foreground">{u.orderCount}</p>
                          </div>
                          <div className="bg-white border border-border rounded-xl p-3 text-center shadow-sm">
                            <p className="text-xs text-muted-foreground mb-1">Total Spent</p>
                            <p className="text-2xl font-900 text-primary">£{u.totalSpent.toFixed(2)}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Recent Orders */}
                    {u.orders.length > 0 && (
                      <div className="mt-5">
                        <p className="text-[10px] font-800 uppercase tracking-wider text-muted-foreground mb-3">Order History</p>
                        <div className="bg-white border border-border rounded-xl shadow-sm overflow-hidden">
                          <table className="w-full text-sm">
                            <thead className="bg-muted">
                              <tr>
                                <th className="text-left px-4 py-2.5 text-[10px] font-700 text-muted-foreground uppercase">Order ID</th>
                                <th className="text-left px-4 py-2.5 text-[10px] font-700 text-muted-foreground uppercase">Date</th>
                                <th className="text-left px-4 py-2.5 text-[10px] font-700 text-muted-foreground uppercase">Items</th>
                                <th className="text-left px-4 py-2.5 text-[10px] font-700 text-muted-foreground uppercase">Status</th>
                                <th className="text-right px-4 py-2.5 text-[10px] font-700 text-muted-foreground uppercase">Total</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                              {u.orders.slice(0, 10).map((o: any) => (
                                <tr key={o.id} className="hover:bg-muted/30">
                                  <td className="px-4 py-3 font-700 text-primary text-xs">{o.id}</td>
                                  <td className="px-4 py-3 text-muted-foreground text-xs whitespace-nowrap">{o.createdAt?.toDate ? o.createdAt.toDate().toLocaleDateString('en-GB') : '—'}</td>
                                  <td className="px-4 py-3 text-muted-foreground text-xs max-w-[200px] truncate">{o.items?.map((i:any) => `${i.qty}x ${i.name}`).join(', ')}</td>
                                  <td className="px-4 py-3">
                                    <span className={`text-[10px] font-700 px-2 py-0.5 rounded-md ${
                                      o.status === 'Delivered' ? 'bg-green-100 text-green-700' :
                                      o.status === 'Cancelled' ? 'bg-red-100 text-red-600' :
                                      'bg-amber-100 text-amber-700'
                                    }`}>{o.status || 'Order Received'}</span>
                                  </td>
                                  <td className="px-4 py-3 text-right font-700 tabular-nums">£{(o.total || 0).toFixed(2)}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
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
