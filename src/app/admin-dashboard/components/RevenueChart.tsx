'use client';
import React, { useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number }>; label?: string }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-border rounded-xl shadow-lg px-4 py-3">
        <p className="text-xs font-700 text-muted-foreground mb-1">{label}</p>
        <p className="text-base font-extrabold text-foreground tabular-nums">£{payload[0].value.toFixed(2)}</p>
      </div>
    );
  }
  return null;
};

export default function RevenueChart({ orders = [] }: { orders?: any[] }) {
  const data = useMemo(() => {
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const result: { day: string; dateStr: string; revenue: number }[] = [];

    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      d.setHours(0, 0, 0, 0);
      result.push({
        day: dayNames[d.getDay()],
        dateStr: new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().split('T')[0],
        revenue: 0,
      });
    }

    orders.forEach(o => {
      if (!o.createdAt?.toDate) return;
      const d = o.createdAt.toDate();
      const dateStr = new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().split('T')[0];
      const match = result.find(r => r.dateStr === dateStr);
      if (match) match.revenue += o.total || 0;
    });

    return result;
  }, [orders]);

  return (
    <ResponsiveContainer width="100%" height={220}>
      <AreaChart data={data} margin={{ top: 4, right: 4, left: -10, bottom: 0 }}>
        <defs>
          <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--secondary)" stopOpacity={0.3} />
            <stop offset="100%" stopColor="var(--secondary)" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
        <XAxis dataKey="day" tick={{ fontSize: 12, fill: 'var(--muted-foreground)' }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} axisLine={false} tickLine={false} tickFormatter={(v) => `£${v.toFixed(0)}`} />
        <Tooltip content={<CustomTooltip />} />
        <Area type="monotone" dataKey="revenue" stroke="var(--secondary)" strokeWidth={2.5} fill="url(#revenueGradient)" dot={{ fill: 'var(--secondary)', r: 3, strokeWidth: 0 }} activeDot={{ r: 5, fill: 'var(--secondary)' }} />
      </AreaChart>
    </ResponsiveContainer>
  );
}