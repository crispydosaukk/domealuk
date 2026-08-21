'use client';
import React, { useState, useEffect } from 'react';
import { Search, Filter, CheckCircle, Package, FileText, Download } from 'lucide-react';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import {
  exportDeliveriesToPdf,
  exportDeliveriesToExcel,
  formatOrderDeliveryDateTime,
  DeliveryExportItem,
} from '@/lib/exportUtils';

const slotNames: Record<string, string> = {
  'slot-1': 'Morning (7:30 AM – 8:30 AM)',
  'slot-2': 'Afternoon (12:00 PM – 1:00 PM)',
  'slot-3': 'Evening (7:30 PM – 8:30 PM)',
};

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
  }, [user]);

  const filtered = orders.filter((o) => {
    const name = o.address?.fullName || '';
    return (
      name.toLowerCase().includes(search.toLowerCase()) ||
      o.id.toLowerCase().includes(search.toLowerCase())
    );
  });

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
    return slotPart ? `${datePart} • ${slotPart}` : datePart;
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
      title: 'Order History Delivery Schedule',
      subtitle: `Completed delivered orders (${exportItems.length} records)`,
      filename: `DoMeal_Delivered_Orders_${new Date().toISOString().slice(0, 10)}`,
      items: exportItems,
    });

    toast.success(`Downloaded PDF (${exportItems.length} delivery records)`);
  };

  const handleDownloadExcel = () => {
    const dataToExport = filtered.length > 0 ? filtered : orders;
    const exportItems = mapOrdersToDeliveryExport(dataToExport);

    exportDeliveriesToExcel({
      filename: `DoMeal_Delivered_Orders_${new Date().toISOString().slice(0, 10)}`,
      sheetName: 'Delivered Orders',
      items: exportItems,
    });

    toast.success(`Downloaded Excel (.xlsx) (${exportItems.length} delivery records)`);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-foreground">Completed Order History</h1>
          <p className="text-sm text-muted-foreground">View and export all past delivered orders</p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Download PDF Button */}
          <button
            onClick={handleDownloadPdf}
            className="px-3.5 py-2 rounded-xl bg-white hover:bg-rose-50 text-rose-700 font-700 text-xs border border-rose-200 shadow-sm hover:shadow transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
            title="Download Minimal Delivery PDF"
          >
            <FileText className="w-4 h-4 text-rose-600" />
            <span>Download PDF</span>
          </button>

          {/* Download Excel Button */}
          <button
            onClick={handleDownloadExcel}
            className="px-3.5 py-2 rounded-xl bg-white hover:bg-emerald-50 text-emerald-700 font-700 text-xs border border-emerald-200 shadow-sm hover:shadow transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
            title="Download Minimal Delivery Excel (.xlsx)"
          >
            <Download className="w-4 h-4 text-emerald-600" />
            <span>Download Excel</span>
          </button>

          <div className="bg-green-50 text-green-700 px-3.5 py-2 rounded-xl flex items-center gap-1.5 border border-green-200 text-xs">
            <CheckCircle size={16} />
            <span className="font-700">{orders.length} Completed</span>
          </div>
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
